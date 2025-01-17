import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ className = '', size = 'default' }) => {
    const sizeClasses = {
        small: 'w-4 h-4',
        default: 'w-8 h-8',
        large: 'w-12 h-12',
    };

    return (
        <div className='flex items-center justify-center w-full h-full min-h-[100px]'>
            <Loader2 className={`animate-spin text-blue-500 ${sizeClasses[size]} ${className}`} />
        </div>
    );
};

export default LoadingSpinner;
