import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './style.scss';

export function MultiFrame() {
    const [searchParams] = useSearchParams();
    const [showFirstFrame, setShowFirstFrame] = useState(false);
    const [showSecondFrame, setShowSecondFrame] = useState(false);

    // Get URL from query params or use default
    const urlParam = searchParams.get('url');
    const iframeUrl = urlParam ? decodeURIComponent(urlParam) : '/';

    useEffect(() => {
        // Show first iframe after 2 seconds
        const firstTimer = setTimeout(() => {
            setShowFirstFrame(true);
        }, 2000);

        // Show second iframe after 10 seconds
        const secondTimer = setTimeout(() => {
            setShowSecondFrame(true);
        }, 10000);

        return () => {
            clearTimeout(firstTimer);
            clearTimeout(secondTimer);
        };
    }, []);

    return (
        <div className="multiframe-container">
            <div className="multiframe-pane">
                {showFirstFrame ? (
                    <iframe
                        src={iframeUrl}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        title="First Frame"
                    />
                ) : (
                    <div className="multiframe-empty">Loading first frame...</div>
                )}
            </div>
            <div className="multiframe-pane">
                {showSecondFrame ? (
                    <iframe
                        src={iframeUrl}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        title="Second Frame"
                    />
                ) : (
                    <div className="multiframe-empty">Loading second frame...</div>
                )}
            </div>
        </div>
    );
}
