module.exports = {
    apps: [
        {
            name: "progressive.lk",
            script: "npm",
            args: "start",
            env: {
                NODE_ENV: "production",
                PORT: 3000,
            },
        },
    ],
};
