import { useParams, useNavigate } from 'react-router-dom';
import { TestCasesSection } from '../components/TestLaunches/TestCasesSection/TestCasesSection';
import { useLaunchesRedux } from '../hooks/useLaunchesRedux';
import '../components/TestLaunches/TestLaunches.scss';

export function LaunchDetailsPage() {
    const { launchId } = useParams<{ launchId: string }>();
    const navigate = useNavigate();

    const { launches, complete } = useLaunchesRedux();

    const launchIdNumber = launchId ? parseInt(launchId) : null;

    if (!launchIdNumber || isNaN(launchIdNumber)) {
        return (
            <div className="test-runs__error">
                <div className="test-runs__error-icon">⚠️</div>
                <div className="test-runs__error-title">Invalid Launch ID</div>
                <div className="test-runs__error-message">Launch ID must be a valid number</div>
                <button onClick={() => navigate('/launches')} className="btn btn-primary">
                    Back to Launches
                </button>
            </div>
        );
    }

    const selectedLaunch = launches.find(launch => launch.id === launchIdNumber);

    const handleClose = () => {
        navigate('/launches');
    };

    return (
        <TestCasesSection
            launchId={launchIdNumber}
            onClose={handleClose}
            onComplete={complete}
            launchClosed={selectedLaunch?.closed}
        />
    );
}
