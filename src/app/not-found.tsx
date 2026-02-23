import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
            <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-emerald-500 mb-4">
                404
            </h1>
            <h2 className="text-2xl font-bold mb-6">Page Not Found</h2>
            <p className="text-slate-400 mb-8 text-center max-w-md">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Link
                href="/"
                className="px-6 py-3 bg-violet-600 hover:bg-violet-700 rounded-lg font-bold transition shadow-lg shadow-violet-600/20"
            >
                Return Home
            </Link>
        </div>
    );
}
