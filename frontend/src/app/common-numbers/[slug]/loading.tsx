export default function Loading() {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <div className="h-16 bg-white border-b border-gray-200 animate-pulse"></div>
            <main className="flex-1">
                <div className="h-[300px] bg-gray-900 animate-pulse"></div>
                <div className="mx-auto max-w-7xl px-4 py-12">
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 bg-white rounded-2xl border border-gray-200 animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
