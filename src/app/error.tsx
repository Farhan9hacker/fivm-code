"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold text-red-500 mb-4">Something went wrong!</h1>
            <p className="text-slate-400 mb-8 text-center max-w-md">
                An unexpected error has occurred. We have been notified and are working to fix the issue.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => reset()}
                    className="px-6 py-3 bg-violet-600 hover:bg-violet-700 rounded-lg font-bold transition shadow-lg shadow-violet-600/20"
                >
                    Try again
                </button>
                <button
                    onClick={() => window.location.href = "/"}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold transition"
                >
                    Go Home
                </button>
            </div>
        </div>
    );
}
