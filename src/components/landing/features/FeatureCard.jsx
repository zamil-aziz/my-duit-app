export function FeatureCard({ icon, title, description }) {
    return (
        <div className='p-4 rounded-xl bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm'>
            <div className='flex items-start space-x-4'>
                <div className='p-2 bg-gray-800/50 rounded-lg'>{icon}</div>
                <div>
                    <h3 className='font-medium mb-1'>{title}</h3>
                    <p className='text-sm text-gray-400'>{description}</p>
                </div>
            </div>
        </div>
    );
}
