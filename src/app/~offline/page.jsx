'use client';

export default function OfflinePage() {
    return (
        <div className='min-h-screen bg-gray-950 flex items-center justify-center px-4'>
            <div className='text-center'>
                <h1 className='text-2xl font-bold text-white mb-4'>You're offline</h1>
                <p className='text-gray-400 mb-4'>Please check your internet connection and try again.</p>
                <button
                    onClick={() => window.location.reload()}
                    className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg'
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}
