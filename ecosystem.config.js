module.exports = {
    apps: [
        {
            name: "teer-api",
            script: "dist/index.js",
            cwd: "./backend",
            node_args: "--max-old-space-size=1024",
            watch: false,
            kill_timeout: 5000,
            max_restarts: 15,
            restart_delay: 3000,
            exp_backoff_restart_delay: 100,
            env: {
                NODE_ENV: "production",
            },
        },
        {
            name: "teer-worker",
            script: "dist/worker.js",
            cwd: "./backend",
            node_args: "--max-old-space-size=1024",
            watch: false,
            kill_timeout: 8000,
            max_restarts: 20,
            restart_delay: 5000,
            exp_backoff_restart_delay: 100,
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
            kill_timeout: 5000,
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
            node_args: "--max-old-space-size=256",
            watch: false,
            kill_timeout: 5000,
            max_restarts: 10,
            restart_delay: 3000,
            env: {
                NODE_ENV: "production",
                NEXT_PUBLIC_API_URL: "https://api.teer.club/api",
                NEXT_PUBLIC_API_KEY: "teer-admin-prod-2026-X9k2mP",
                INTERNAL_API_URL: "http://localhost:5000/api",
            },
        }
    ]
};

