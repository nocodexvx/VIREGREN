import express from 'express';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import { createClient } from '@supabase/supabase-js';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configure FFmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

const router = express.Router();

const uploadDir = path.join(__dirname, '../uploads');
const outputDir = path.join(__dirname, '../outputs');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
    storage,
    limits: { fileSize: 200 * 1024 * 1024 }
});

// ==========================================
// JOB QUEUE SYSTEM (KVM 2 OPTIMIZATION)
// ==========================================
// KVM 2 has 2 vCPUs. FFmpeg uses ~100% of available CPU.
// To keep the API responsive, we MUST limit concurrent generic jobs.
const MAX_CONCURRENT_JOBS = 1;
const jobQueue = [];
let activeJobs = 0;

async function updateJob(jobId, updates) {
    try {
        await supabase.from('video_jobs').update(updates).eq('job_id', jobId);
    } catch (e) {
        console.error(`Failed to update job ${jobId}`, e);
    }
}

// Queue Processor
function processQueue() {
    if (activeJobs >= MAX_CONCURRENT_JOBS) return;
    if (jobQueue.length === 0) return;

    const nextJob = jobQueue.shift();
    activeJobs++;

    console.log(`🚀 Starting Job ${nextJob.jobId} (Active: ${activeJobs})`);

    processVideo(nextJob.jobId, nextJob.inputPath, nextJob.variations)
        .finally(() => {
            activeJobs--;
            console.log(`✅ Finished Job ${nextJob.jobId} (Active: ${activeJobs})`);
            processQueue(); // Trigger next
        });
}

// POST /api/process
router.post('/process', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No video file provided' });

        const jobId = Date.now().toString();
        const variations = parseInt(req.body.variations) || 1;

        // DB Log
        await supabase.from('video_jobs').insert({
            job_id: jobId,
            status: 'queued', // Start as queued
            progress: 0,
            variations: variations,
            created_at: new Date()
        });

        // Add to Queue
        jobQueue.push({ jobId, inputPath: req.file.path, variations });

        const position = activeJobs + jobQueue.length;
        res.json({
            jobId,
            message: position <= MAX_CONCURRENT_JOBS ? 'Processing started' : 'Job queued',
            queuePosition: position
        });

        // Try to start
        processQueue();

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Async Video Processor
async function processVideo(jobId, inputPath, variations) {
    try {
        await updateJob(jobId, { status: 'processing', progress: 5 });

        const outputs = [];
        const promises = [];

        for (let i = 0; i < variations; i++) {
            const outputPath = path.join(outputDir, `${jobId}_var_${i}.mp4`);
            outputs.push(outputPath);

            const p = new Promise((resolve, reject) => {
                let command = ffmpeg(inputPath)
                    .videoFilters(i % 2 === 0 ? 'hue=s=0' : 'eq=contrast=1.2')
                    .output(outputPath)
                    .on('end', () => resolve())
                    .on('error', (err) => reject(err));
                command.run();
            });
            promises.push(p);
        }

        await Promise.all(promises);
        await updateJob(jobId, { progress: 90, outputs: outputs });

        // Create Zip
        const zipName = `variagen_${jobId}.zip`;
        const zipPath = path.join(outputDir, zipName);
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        return new Promise((resolve, reject) => {
            output.on('close', async () => {
                await updateJob(jobId, {
                    status: 'done',
                    progress: 100,
                    zip_path: zipPath
                });
                resolve();
            });

            archive.on('error', async (err) => {
                await updateJob(jobId, { status: 'error' });
                reject(err);
            });

            archive.pipe(output);
            outputs.forEach((file, index) => {
                archive.file(file, { name: `variation_${index + 1}.mp4` });
            });
            archive.finalize();
        });

    } catch (error) {
        console.error(`Job ${jobId} failed:`, error);
        await updateJob(jobId, { status: 'error' });
    }
}

// GET /api/status/:id
router.get('/status/:id', async (req, res) => {
    const { data: job, error } = await supabase
        .from('video_jobs')
        .select('status, progress')
        .eq('job_id', req.params.id)
        .single();

    if (error || !job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
});

// GET /api/download/:id
router.get('/download/:id', async (req, res) => {
    const { data: job, error } = await supabase
        .from('video_jobs')
        .select('zip_path, status')
        .eq('job_id', req.params.id)
        .single();

    if (error || !job || job.status !== 'done') return res.status(404).json({ error: 'File not ready' });
    if (!job.zip_path || !fs.existsSync(job.zip_path)) return res.status(404).json({ error: 'File missing on server' });

    res.download(job.zip_path, `variagen_results_${req.params.id}.zip`);
});

export default router;
