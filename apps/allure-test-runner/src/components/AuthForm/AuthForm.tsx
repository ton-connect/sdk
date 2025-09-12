import { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { setToken } from '../../store/slices/authSlice';
import { useAuthenticateMutation } from '../../store/api/allureApi';
import { Stack, Card, CardContent } from '../ui/layout';
import { Display, Body, Caption } from '../ui/typography';
import { FormField, CleanInput, CleanButton } from '../ui/form-field';

interface FormData {
    userToken: string;
}

export function AuthForm() {
    const [error, setError] = useState<string | null>(null);
    const dispatch = useAppDispatch();
    const [authenticate, { isLoading: loading }] = useAuthenticateMutation();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<FormData>({
        defaultValues: {
            userToken: ''
        }
    });

    const userToken = watch('userToken');

    const onSubmit = useCallback(
        async (data: FormData) => {
            if (!data.userToken.trim()) {
                setError('User API token is required');
                return;
            }
            try {
                setError(null);
                const access = await authenticate({ userToken: data.userToken }).unwrap();
                dispatch(setToken(access));
            } catch (e: unknown) {
                const errorMessage = e instanceof Error ? e.message : 'Failed to authenticate';
                setError(errorMessage);
            }
        },
        [authenticate, dispatch]
    );

    const isSubmitDisabled = useMemo(() => !userToken?.trim() || loading, [userToken, loading]);

    return (
        <div className="w-full max-w-sm mx-auto">
            <Card className="border-0 shadow-none bg-transparent">
                <CardContent>
                    <Stack spacing="relaxed">
                        <Stack spacing="tight" className="text-center">
                            <Display>Welcome</Display>
                            <Body className="text-muted-foreground">
                                Enter your API token to continue
                            </Body>
                        </Stack>

                        {error && (
                            <div className="rounded-lg bg-destructive/10 px-4 py-3">
                                <Caption className="text-destructive">{error}</Caption>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Stack spacing="relaxed">
                                <FormField
                                    label="API Token"
                                    required
                                    error={errors.userToken?.message}
                                >
                                    <CleanInput
                                        type="password"
                                        placeholder="Enter your token"
                                        autoComplete="off"
                                        size="large"
                                        className="bg-muted/30 border-0"
                                        {...register('userToken', {
                                            required: 'User API token is required'
                                        })}
                                    />
                                </FormField>

                                <CleanButton
                                    type="submit"
                                    disabled={isSubmitDisabled}
                                    className="w-full"
                                    size="large"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Authenticating...
                                        </>
                                    ) : (
                                        'Continue'
                                    )}
                                </CleanButton>
                            </Stack>
                        </form>
                    </Stack>
                </CardContent>
            </Card>
        </div>
    );
}
