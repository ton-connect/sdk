import React, { useState } from 'react';
import { useSignUpMutation, useSignInMutation } from '../../store/api/allureApi';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle } from 'lucide-react';

interface AuthFormProps {
    onSuccess: (token: string) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [formData, setFormData] = useState({
        login: '',
        password: ''
    });
    const [error, setError] = useState<string | null>(null);

    const [signUp, { isLoading: isSignUpLoading }] = useSignUpMutation();
    const [signIn, { isLoading: isSignInLoading }] = useSignInMutation();

    const isLoading = isSignUpLoading || isSignInLoading;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            if (isSignUp) {
                await signUp(formData).unwrap();
                // After successful sign up, switch to sign in
                setIsSignUp(false);
            } else {
                const result = await signIn(formData).unwrap();
                onSuccess(result.accessToken);
            }
        } catch (err: unknown) {
            const errorMessage =
                err &&
                typeof err === 'object' &&
                'data' in err &&
                err.data &&
                typeof err.data === 'object' &&
                'message' in err.data &&
                typeof err.data.message === 'string'
                    ? err.data.message
                    : 'An error occurred';
            setError(errorMessage);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center text-foreground">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </CardTitle>
                    <CardDescription className="text-center text-muted-foreground">
                        {isSignUp
                            ? 'Enter your credentials to create a new account'
                            : 'Enter your credentials to sign in to your account'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="login" className="text-foreground">
                                Login
                            </Label>
                            <Input
                                id="login"
                                name="login"
                                type="text"
                                value={formData.login}
                                onChange={handleInputChange}
                                placeholder="Enter your login"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-foreground">
                                Password
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-4 text-center">
                        <Button
                            variant="link"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            {isSignUp
                                ? 'Already have an account? Sign In'
                                : "Don't have an account? Sign Up"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
