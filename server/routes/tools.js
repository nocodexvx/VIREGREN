import express from 'express';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import archiver from 'archiver';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Role for backend
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to clean up temp files
const cleanup = (...paths) => {
    paths.forEach(p => {
        if (p && fs.existsSync(p)) fs.unlinkSync(p);
    });
};

router.post('/metadata/clean', upload.array('files'), async (req, res) => {
    const jobId = uuidv4();
    const files = req.files || [];

    if (files.length === 0) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

    console.log(`[Tool] Cleaning metadata for ${files.length} files (Job: ${jobId})`);

    const processedFiles = [];
    const inputFiles = [];

    try {
        if (!fs.existsSync('outputs')) fs.mkdirSync('outputs');

        // Process each file
        for (const file of files) {
            const inputPath = file.path;
            inputFiles.push(inputPath);
            const outputFilename = `clean_${file.originalname}`;
            const outputPath = path.join('outputs', outputFilename);

            await new Promise((resolve, reject) => {
                ffmpeg(inputPath)
                    .outputOptions('-map_metadata -1')
                    .outputOptions('-c:v copy')
                    .save(outputPath)
                    .on('end', resolve)
                    .on('error', reject);
            });
            processedFiles.push(outputPath);
        }

        let finalDownloadPath = '';

        // Decide: Single File vs Zip Bundle
        if (processedFiles.length === 1) {
            finalDownloadPath = processedFiles[0];
        } else {
            // Bundle into ZIP
            const zipName = `clean_bundle_${jobId}.zip`;
            const zipPath = path.join('outputs', zipName);
            const output = fs.createWriteStream(zipPath);
            const archive = archiver('zip', { zlib: { level: 9 } });

            await new Promise((resolve, reject) => {
                output.on('close', resolve);
                archive.on('error', reject);
                archive.pipe(output);

                processedFiles.forEach(file => {
                    archive.file(file, { name: path.basename(file) });
                });

                archive.finalize();
            });

            finalDownloadPath = zipPath;

            // Clean up individual processed image files now that they are in the zip
            // (We keep input files until very end)
            cleanup(...processedFiles);
        }

        // Insert into video_jobs
        const { error } = await supabase
            .from('video_jobs')
            .insert({
                job_id: jobId,
                user_id: req.body.userId && req.body.userId.length > 10 ? req.body.userId : null,
                status: 'done',
                zip_path: finalDownloadPath,
                created_at: new Date()
            });

        if (error) throw error;

        // Cleanup Inputs
        cleanup(...inputFiles);

        res.json({
            success: true,
            jobId: jobId,
            downloadUrl: `/api/download/${jobId}`
        });

    } catch (e) {
        console.error("Metadata Clean Error:", e);
        // Cleanup everything on error
        cleanup(...inputFiles, ...processedFiles);
        res.status(500).json({ error: e.message });
    }
});

export default router;
