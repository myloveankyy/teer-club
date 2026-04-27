export const env = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
};

// Validate environment variables on startup (during build and runtime)
export function validateEnv() {
    const missingVariables: string[] = [];

    if (!env.NEXT_PUBLIC_API_URL) {
        missingVariables.push("NEXT_PUBLIC_API_URL");
    }

    if (missingVariables.length > 0) {
        console.warn(
            `\u26A0\uFE0F Warning: The following environment variables are missing in the frontend config:\n` +
            missingVariables.map((v) => `  - ${v}`).join("\n") +
            `\n\nFalling back to default values where applicable.`
        );
    }
}
