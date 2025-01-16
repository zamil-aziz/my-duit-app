import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Skull, Brain, Lock } from 'lucide-react';

const ForgotPassword = () => {
    const responses = [
        {
            title: 'Oops, Memory Issues?',
            description:
                'Have you tried remembering harder? I hear that works 60% of the time, every time! 🧠\n\nMaybe check under your pillow? Sometimes passwords like to hide there with the tooth fairy!',
            icon: Brain,
        },
        {
            title: 'Password Gone Missing?',
            description:
                "Legend says it's hanging out with all those missing socks from your laundry! 🧦\n\nPerhaps it's taken a sabbatical to find its true identity. Very philosophical, these passwords.",
            icon: Lock,
        },
        {
            title: 'Well, This is Awkward...',
            description:
                'Your password is currently on vacation in the digital void. It left no forwarding address! ✈️\n\nLast seen partying with the 404 errors and deleted cookies. Quite the social butterfly!',
            icon: Skull,
        },
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const Icon = randomResponse.icon;

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant='link' className='text-sm text-gray-400 hover:text-blue-400'>
                    Forgot Password?
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className='bg-gray-900 border border-gray-800 max-w-lg w-[calc(100%-2rem)] sm:w-full mx-auto'>
                <AlertDialogHeader className='space-y-6 px-2 sm:px-4'>
                    <div className='mx-auto bg-blue-500/10 p-4 rounded-full'>
                        <Icon className='h-8 w-8 text-blue-500' />
                    </div>
                    <AlertDialogTitle className='text-2xl text-center text-white'>
                        {randomResponse.title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className='text-center text-gray-400 text-base leading-relaxed whitespace-pre-line'>
                        {randomResponse.description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className='mt-8 sm:mt-10'>
                    <AlertDialogAction className='bg-blue-600 hover:bg-blue-700 text-white w-full py-6 text-lg font-medium'>
                        Guess I'll Just Remember Harder! 💪
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ForgotPassword;
