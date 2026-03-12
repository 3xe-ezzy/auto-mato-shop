'use client';

import { useState } from 'react';
import { authenticate } from '@/lib/actions';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
    const [isPending, setIsPending] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsPending(true);
        setErrorMessage(undefined);

        const formData = new FormData(event.currentTarget);
        try {
            const result = await authenticate(undefined, formData);
            if (result) {
                setErrorMessage(result);
                setIsPending(false);
            }
        } catch (error) {
            // Only set error if it's not a redirect (which we can't easily detect here, 
            // but Next.js will handle the redirect anyway)
            // If it's a real error, we want to show it.
            // But if we're here, authenticate might have thrown a redirect.
            // One way is to check if the error is an object with a message or just log it.
            console.error('Login error:', error);
            // Don't set error message immediately, let Next.js handle it
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
                <h1 className="mb-3 text-2xl">
                    Bitte einloggen.
                </h1>
                <div className="w-full">
                    <div>
                        <label
                            className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <div className="relative">
                            <input
                                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 text-black"
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Email eingeben"
                                required
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label
                            className="mb-3 mt-5 block text-xs font-medium text-black"
                            htmlFor="password"
                        >
                            Passwort
                        </label>
                        <div className="relative">
                            <input
                                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 pr-10 text-sm outline-2 placeholder:text-gray-500 text-black"
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Passwort eingeben"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                <button
                    className="mt-4 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                    aria-disabled={isPending}
                    disabled={isPending}
                >
                    {isPending ? 'Logging in...' : 'Log in'}
                </button>
                <div
                    className="flex h-8 items-end space-x-1"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {errorMessage && (
                        <>
                            <p className="text-sm text-red-500">{errorMessage}</p>
                        </>
                    )}
                </div>
            </div>
        </form>
    );
}


