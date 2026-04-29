module.exports = {
    apps: [
        {
            name: "teer-api",
            script: "dist/index.js",
            cwd: "./backend",
            watch: false,
            env: {
                NODE_ENV: "production",
            },
        },
        {
            name: "teer-frontend",
            script: "npm",
            args: "run start -- -p 3000",
            cwd: "./frontend",
            watch: false,
            env: {
                NODE_ENV: "production",
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

