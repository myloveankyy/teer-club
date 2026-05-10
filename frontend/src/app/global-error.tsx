"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Error captured by Next.js error reporting via digest property
    }, [error]);

    return (
        <html lang="en">
            <body>
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100vh",
                    padding: "16px",
                    textAlign: "center",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    backgroundColor: "#fff",
                }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
                    <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#111", marginBottom: "8px" }}>
                        Something went wrong
                    </h1>
                    <p style={{ fontSize: "14px", color: "#666", maxWidth: "400px", marginBottom: "24px" }}>
                        A critical error occurred. Please try refreshing the page.
                    </p>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <button
                            onClick={() => reset()}
                            style={{
                                padding: "12px 24px",
                                backgroundColor: "#2563eb",
                                color: "#fff",
                                border: "none",
                                borderRadius: "12px",
                                fontWeight: "bold",
                                fontSize: "14px",
                                cursor: "pointer",
                            }}
                        >
                            Try Again
                        </button>
                        <a
                            href="/"
                            style={{
                                padding: "12px 24px",
                                backgroundColor: "#f3f4f6",
                                color: "#111",
                                border: "1px solid #e5e7eb",
                                borderRadius: "12px",
                                fontWeight: "bold",
                                fontSize: "14px",
                                textDecoration: "none",
                                cursor: "pointer",
                            }}
                        >
                            Return Home
                        </a>
                    </div>
                </div>
            </body>
        </html>
    );
}
