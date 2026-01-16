
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const { promisify } = require('util');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

async function processVideo(job, updateProgress) {
    try {
        updateProgress(0);
        const outputDir = path.join(__dirname, 'jobs/temp', job.id);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const tasks = [];
        const totalVariations = job.variations;
        let completed = 0;

        for (let i = 0; i < totalVariations; i++) {
            const variationName = `variation_${i + 1}.mp4`;
            const outputPath = path.join(outputDir, variationName);

            tasks.push(() => createVariation(job.file, outputPath, i).then(() => {
                completed++;
                const progress = Math.round((completed / totalVariations) * 95);
                updateProgress(progress);
            }));
        }

        // Run sequentially to avoid CPU hogging, or limit concurrency
        for (const task of tasks) {
            await task();
        }

        // Zip results
        const zipPath = path.join(__dirname, 'jobs/output', `${job.id}.zip`);
        await createZip(outputDir, zipPath);

        updateProgress(100);

        // Cleanup temp files (optional, keeping for debugging)
        // fs.rmSync(outputDir, { recursive: true, force: true });

    } catch (error) {
        console.error('Processing error:', error);
        updateProgress(-1);
    }
}

function createVariation(inputPath, outputPath, index) {
    return new Promise((resolve, reject) => {
        // Randomize parameters
        const brightness = (Math.random() * 0.2 - 0.1).toFixed(2); // -0.1 to 0.1
        const saturation = (Math.random() * 0.4 + 0.8).toFixed(2); // 0.8 to 1.2
        const hue = (Math.random() * 20 - 10).toFixed(0); // -10 to 10 degrees (approx)
        // Zoom: crop center with 1.0 to 1.1x zoom
        const zoomFactor = (Math.random() * 0.1 + 1.0).toFixed(2);

        // Eq filter for brightness/saturation
        // hue is separate or part of eq? ffmpeg eq has brightness, contrast, saturation, gamma, gamma_r, gamma_g, gamma_b, gamma_weight.
        // hue filter exists separately.

        // Complex filter string
        // zoompan for zoom: very simpler implementation is just crop, but zoompan is animated.
        // Let's stick to safe crop/scale for "zoom" effect without animation to keep it fast, or use simple static crop.
        // "crop=iw/1.05:ih/1.05" for example.

        // Let's use `eq` filter for color correction
        const eqFilter = `eq=brightness=${brightness}:saturation=${saturation}`;
        const hueFilter = `hue=h=${hue}`;

        // Construct filter chain
        const filters = [eqFilter, hueFilter];

        // Add crop for zoom (random crop center)
        // We need input dimensions for dynamic crop. For simplicity, let's skip complex crop math without probing first.
        // Or just use a safe centered crop if we assume 16:9 etc. 
        // Actually, simple way: scale to slightly larger, then crop to original size.
        // "scale=iw*1.05:ih*1.05,crop=iw/1.05:ih/1.05" -> no that preserves aspect but changes resolution.
        // Proper zoom: crop a smaller window (iw/zoom) and scale back to iw:ih.
        const w = `iw/${zoomFactor}`;
        const h = `ih/${zoomFactor}`;
        const x = `(iw-${w})/2`;
        const y = `(ih-${h})/2`;
        // We must ensure w/h are even for some codecs, but usually okay. Sometims errors with odd numbers.
        // Safe bet: "crop=iw*0.95:ih*0.95:iw*0.025:ih*0.025,scale=iw:ih" (fixed 5% zoom)
        // Let's apply valid zoom only if zoom > 1.0
        if (zoomFactor > 1.01) {
            filters.push(`crop=iw/${zoomFactor}:ih/${zoomFactor}:(iw-ow)/2:(ih-oh)/2,scale=iw:ih`);
        }

        ffmpeg(inputPath)
            .outputOptions([
                '-c:v libx264',
                '-preset ultrafast', // Fast processing
                '-crf 28', // Good enough quality for variations
                '-c:a copy' // Copy audio
            ])
            .videoFilters(filters)
            .on('end', resolve)
            .on('error', reject)
            .save(outputPath);
    });
}

function createZip(sourceDir, outPath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', resolve);
        archive.on('error', reject);

        archive.pipe(output);
        archive.directory(sourceDir, false);
        archive.finalize();
    });
}

module.exports = { processVideo };
