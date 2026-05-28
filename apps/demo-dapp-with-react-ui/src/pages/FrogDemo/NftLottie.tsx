import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

// Mirrors tonscan's `.nft-image-container__lottie` block: fetch the Lottie JSON
// referenced by the NFT metadata, render it with lottie-web under the hood, and
// fall through to the static preview while the JSON is loading (or if it fails
// to load, e.g. CORS).
interface Props {
    lottieUrl: string;
    fallbackImage: string;
    alt: string;
}

export function NftLottie({ lottieUrl, fallbackImage, alt }: Props) {
    const [data, setData] = useState<unknown | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetch(lottieUrl)
            .then(r => (r.ok ? r.json() : null))
            .then(json => {
                if (!cancelled) setData(json);
            })
            .catch(() => {
                if (!cancelled) setData(null);
            });
        return () => {
            cancelled = true;
        };
    }, [lottieUrl]);

    if (!data) {
        return <img src={fallbackImage} alt={alt} className="nft-image-container__image" />;
    }

    return (
        <Lottie
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            animationData={data as any}
            loop
            autoplay
            className="nft-image-container__lottie"
        />
    );
}
