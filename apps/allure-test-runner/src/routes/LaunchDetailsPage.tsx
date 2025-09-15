import { useParams, useNavigate } from 'react-router-dom';
import { TestCasesSection } from '../components/TestLaunches/TestCasesSection/TestCasesSection';
import { useCompleteLaunchMutation } from '../store/api/allureApi';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export function LaunchDetailsPage() {
    const { launchId } = useParams<{ launchId: string }>();
    const navigate = useNavigate();

    const [completeLaunch] = useCompleteLaunchMutation();

    const launchIdNumber = launchId ? parseInt(launchId) : null;

    if (!launchIdNumber || isNaN(launchIdNumber)) {
        return (
            <div className="w-full max-w-md mx-auto p-4">
                <Alert className="border-0 bg-destructive/10">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <AlertDescription className="ml-2">
                        <div className="space-y-3">
                            <div>
                                <h3 className="font-semibold text-destructive">
                                    Invalid Launch ID
                                </h3>
                                <p className="text-sm text-destructive/80">
                                    Launch ID must be a valid number
                                </p>
                            </div>
                            <Button onClick={() => navigate('/launches')} size="sm">
                                Back to Launches
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const handleClose = () => {
        navigate('/launches');
    };

    const handleComplete = async (id: number) => {
        try {
            await completeLaunch({ id }).unwrap();

            navigate('/launches');
        } catch (error) {
            console.error('Failed to complete launch:', error);
        }
    };

    return (
        <TestCasesSection
            launchId={launchIdNumber}
            onClose={handleClose}
            onComplete={handleComplete}
            launchClosed={false} // We don't have launch data here, so we'll let TestCasesSection handle it
        />
    );
}
