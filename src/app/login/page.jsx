'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ForgotPassword from '@/components/login/ForgotPassword';

export default function LoginPage() {
    const router = useRouter();

    // Form state management
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // UI state management
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

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

    // Form validation
    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        return newErrors;
    };

    // Handle form submission
    const handleSubmit = async e => {
        e.preventDefault();

        // Validate form
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to sign in');
            }

            // Store auth data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect to dashboard
            router.push('/dashboard');
        } catch (error) {
            setErrors({
                submit: error.message || 'Invalid email or password. Please try again.',
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
                    <span className='text-lg font-bold text-white'>MyDuitApp</span>
                </Link>
                <Link href='/signup'>
                    <Button variant='ghost' className='text-sm text-gray-400 hover:text-white'>
                        Sign Up
                    </Button>
                </Link>
            </nav>

            {/* Main Content */}
            <div className='flex-1 flex flex-col items-center justify-center p-4'>
                <div className='w-full max-w-md space-y-8'>
                    {/* Header */}
                    <div className='text-center'>
                        <h1 className='text-2xl font-bold text-white mb-2'>Welcome back</h1>
                        <p className='text-gray-400 text-sm'>Sign in to continue managing your expenses</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className='space-y-6'>
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

                        {/* Password Field */}
                        <div className='space-y-2'>
                            <div className='flex justify-between items-center'>
                                <Label htmlFor='password' className='text-gray-300'>
                                    Password
                                </Label>
                                <ForgotPassword />
                            </div>
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

                        {/* Error Alert */}
                        {errors.submit && (
                            <Alert variant='destructive' className='bg-red-900/50 border-red-900 text-red-300'>
                                <div className='flex items-center gap-2'>
                                    <AlertCircle className='h-4 w-4' />
                                    <AlertDescription>{errors.submit}</AlertDescription>
                                </div>
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
                                    Signing In...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>

                    {/* Sign Up Link */}
                    <p className='text-center text-sm text-gray-400'>
                        Don't have an account?{' '}
                        <Link href='/signup' className='text-blue-500 hover:text-blue-400'>
                            Create one here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
