'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart2, AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
    const router = useRouter();

    // Form state management
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        businessName: '',
    });

    // UI state management
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    // Handle input changes
    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    // Validate form data
    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 4) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.confirmPassword !== formData.password) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.businessName) {
            newErrors.businessName = 'Business name is required';
        }

        return newErrors;
    };

    // Handle form submission
    const handleSubmit = async e => {
        e.preventDefault();

        // Reset error and success states
        setErrors({});
        setSuccessMessage('');

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    businessName: formData.businessName,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create account');
            }

            // Show success message and redirect
            setSuccessMessage('Account created successfully!');
            setTimeout(() => {
                router.push('/login?signup=success');
            }, 1500);
        } catch (error) {
            setErrors({
                submit: error.message || 'Failed to create account. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='min-h-screen bg-gray-950 flex flex-col'>
            {/* Navigation */}
            <nav className='flex items-center justify-between p-4 border-b border-gray-800/50'>
                <Link href='/' className='flex items-center space-x-2'>
                    <BarChart2 className='w-6 h-6 text-blue-500' />
                    <span className='text-lg font-bold text-white'>Expense Tracker</span>
                </Link>
                <Link href='/login'>
                    <Button variant='ghost' className='text-sm text-gray-400 hover:text-white'>
                        Sign In
                    </Button>
                </Link>
            </nav>

            {/* Main Content */}
            <div className='flex-1 flex flex-col items-center justify-center p-4'>
                <div className='w-full max-w-md space-y-8'>
                    {/* Header */}
                    <div className='text-center'>
                        <h1 className='text-2xl font-bold text-white mb-2'>Create your account</h1>
                        <p className='text-gray-400 text-sm'>Start tracking your expenses in minutes</p>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <Alert className='bg-green-900/50 border-green-900 text-green-300'>
                            <AlertDescription>{successMessage}</AlertDescription>
                        </Alert>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className='space-y-6'>
                        {/* Business Name Field */}
                        <div className='space-y-2'>
                            <Label htmlFor='businessName' className='text-gray-300'>
                                Business Name
                            </Label>
                            <Input
                                id='businessName'
                                name='businessName'
                                type='text'
                                value={formData.businessName}
                                onChange={handleChange}
                                className={`bg-gray-900 border-gray-800 text-white placeholder-gray-500 focus:ring-blue-500 ${
                                    errors.businessName ? 'border-red-500' : ''
                                }`}
                                placeholder='Your business name'
                            />
                            {errors.businessName && <p className='text-red-500 text-xs mt-1'>{errors.businessName}</p>}
                        </div>

                        {/* Email Field */}
                        <div className='space-y-2'>
                            <Label htmlFor='email' className='text-gray-300'>
                                Email Address
                            </Label>
                            <Input
                                id='email'
                                name='email'
                                type='email'
                                value={formData.email}
                                onChange={handleChange}
                                className={`bg-gray-900 border-gray-800 text-white placeholder-gray-500 focus:ring-blue-500 ${
                                    errors.email ? 'border-red-500' : ''
                                }`}
                                placeholder='you@example.com'
                            />
                            {errors.email && <p className='text-red-500 text-xs mt-1'>{errors.email}</p>}
                        </div>

                        {/* Password Fields */}
                        <div className='space-y-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='password' className='text-gray-300'>
                                    Password
                                </Label>
                                <Input
                                    id='password'
                                    name='password'
                                    type='password'
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`bg-gray-900 border-gray-800 text-white placeholder-gray-500 focus:ring-blue-500 ${
                                        errors.password ? 'border-red-500' : ''
                                    }`}
                                    placeholder='••••••••'
                                />
                                {errors.password && <p className='text-red-500 text-xs mt-1'>{errors.password}</p>}
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='confirmPassword' className='text-gray-300'>
                                    Confirm Password
                                </Label>
                                <Input
                                    id='confirmPassword'
                                    name='confirmPassword'
                                    type='password'
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`bg-gray-900 border-gray-800 text-white placeholder-gray-500 focus:ring-blue-500 ${
                                        errors.confirmPassword ? 'border-red-500' : ''
                                    }`}
                                    placeholder='••••••••'
                                />
                                {errors.confirmPassword && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.confirmPassword}</p>
                                )}
                            </div>
                        </div>

                        {/* Error Alert */}
                        {errors.submit && (
                            <Alert variant='destructive' className='bg-red-900/50 border-red-900 text-red-300'>
                                <AlertCircle className='h-4 w-4' />
                                <AlertDescription>{errors.submit}</AlertDescription>
                            </Alert>
                        )}

                        {/* Submit Button */}
                        <Button
                            type='submit'
                            disabled={isLoading}
                            className='w-full bg-blue-600 hover:bg-blue-700 text-white py-6'
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </Button>
                    </form>

                    {/* Sign In Link */}
                    <p className='text-center text-sm text-gray-400'>
                        Already have an account?{' '}
                        <Link href='/login' className='text-blue-500 hover:text-blue-400'>
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
