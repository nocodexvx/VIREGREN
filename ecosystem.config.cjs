module.exports = {
    apps: [{
        name: "variagen-api",
        script: "./server/index.js",
        instances: 1, // KVM 2 has 2 vCPUs. 1 instance leaves 1 core free for FFmpeg child processes.
        exec_mode: "fork",
        env: {
            NODE_ENV: "production",
            max_memory_restart: "1G" // Restart if memory leaks > 1GB (Safe within 8GB RAM)
        },
        error_file: "./logs/err.log",
        out_file: "./logs/out.log",
        time: true
    }]
};
