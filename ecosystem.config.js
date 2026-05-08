module.exports = {
    apps: [
        {
            name: "teer-api",
            script: "dist/index.js",
            cwd: "./backend",
            node_args: "--max-old-space-size=4096",
            watch: false,
            env: {
                NODE_ENV: "production",
            },
        },
        {
            name: "teer-worker",
            script: "dist/worker.js",
            cwd: "./backend",
            node_args: "--max-old-space-size=4096",
            watch: false,
            max_restarts: 20,
            restart_delay: 5000,
            env: {
                NODE_ENV: "production",
            },
        },
        {
            name: "teer-frontend",
            script: "npm",
            args: "run start -- -p 3000",
            cwd: "./frontend",
            node_args: "--max-old-space-size=512",
            watch: false,
            max_restarts: 10,
            restart_delay: 3000,
            env: {
                NODE_ENV: "production",
                NEXT_PUBLIC_API_URL: "https://api.teer.club/api",
                INTERNAL_API_URL: "http://localhost:5000/api",
            },
        },
        {
            name: "teer-admin",
            script: "npm",
            args: "run start -- -p 3001",
            cwd: "./admin-panel",
            watch: false,
            env: {
                NODE_ENV: "production",
            },
        }
    ]
};

