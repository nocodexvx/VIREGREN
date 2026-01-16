
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const processor = require('./processor.cjs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Setup storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'jobs/input'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Database (in-memory)
const jobs = {};

// Routes
app.post('/api/process', upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file provided' });
  }

  const variations = parseInt(req.body.variations || '1');
  const jobId = require('uuid').v4();

  // Initialize job status
  jobs[jobId] = {
    id: jobId,
    status: 'pending',
    progress: 0,
    file: req.file.path,
    variations: variations,
    createdAt: new Date()
  };

  // Start processing in background (dont await)
  processor.processVideo(jobs[jobId], (progress) => {
    jobs[jobId].progress = progress;
    if (progress === 100) {
      jobs[jobId].status = 'done';
    } else if (progress === -1) {
      jobs[jobId].status = 'error';
    } else {
      jobs[jobId].status = 'processing';
    }
  });

  res.json({ jobId });
});

app.get('/api/status/:id', (req, res) => {
  const job = jobs[req.params.id];
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json({
    status: job.status,
    progress: job.progress
  });
});

app.get('/api/download/:id', (req, res) => {
  const job = jobs[req.params.id];
  if (!job || job.status !== 'done') {
    return res.status(404).json({ error: 'Job not ready or found' });
  }

  const zipPath = path.join(__dirname, 'jobs/output', `${job.id}.zip`);
  if (fs.existsSync(zipPath)) {
    res.download(zipPath);
  } else {
    res.status(500).json({ error: 'Output file missing' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
