// Static NFT metadata mirroring TonAPI's `GET /v2/nfts/{account_id}` payload
// for EQCw0MR9ztrOfH20kscarqfVXaBpgHszBZlH7wyCZpWd2HIy (Kissed Frog #6425).
// Captured rather than fetched so the demo has zero network deps and consistent
// rendering. The shape matches `NftItem` from @ton-api/client.

export interface NftPreview {
    resolution: '5x5' | '100x100' | '500x500' | '1500x1500';
    url: string;
}

export interface NftAttribute {
    trait_type: string;
    value: string;
}

export interface NftData {
    address: string;
    name: string;
    description: string;
    collection: {
        address: string;
        name: string;
    };
    verified: boolean;
    approvedBy: ('getgems' | 'tonkeeper')[];
    image: string;
    lottie?: string;
    previews: NftPreview[];
    attributes: NftAttribute[];
}

export const KISSED_FROG_6425: NftData = {
    address: 'EQCw0MR9ztrOfH20kscarqfVXaBpgHszBZlH7wyCZpWd2HIy',
    name: 'Kissed Frog #0000',
    description:
        'An exclusive Kissed Frog with the appearance Happy Pepe on a Black background with Happy Smile icons.',
    collection: {
        address: 'EQDTro-ogJbS7o-OBD6bt2NysPt7SnGm5zfuRXGB1nE_rbGa',
        name: 'Kissed Frogs'
    },
    verified: true,
    approvedBy: ['getgems'],
    image: 'https://nft.fragment.com/gift/kissedfrog-6425.webp',
    lottie: 'https://nft.fragment.com/gift/kissedfrog-6425.lottie.json',
    previews: [
        {
            resolution: '5x5',
            url: 'https://cache.tonapi.io/imgproxy/CgP5tK6C9eRkPvQ2lotFgyv7OyepQ7wjgqRCEDurjlM/rs:fill:5:5:1/g:no/aHR0cHM6Ly9uZnQuZnJhZ21lbnQuY29tL2dpZnQva2lzc2VkZnJvZy02NDI1LndlYnA.webp'
        },
        {
            resolution: '100x100',
            url: 'https://cache.tonapi.io/imgproxy/Hslw0P-XLmBbtuH0Ig9F-PhtiyvN2CVfIegwekx4wCE/rs:fill:100:100:1/g:no/aHR0cHM6Ly9uZnQuZnJhZ21lbnQuY29tL2dpZnQva2lzc2VkZnJvZy02NDI1LndlYnA.webp'
        },
        {
            resolution: '500x500',
            url: 'https://cache.tonapi.io/imgproxy/iXiGtwrjmZESNQMG1Ys4xVGx3r08OLLeVDlRUcHxHVI/rs:fill:500:500:1/g:no/aHR0cHM6Ly9uZnQuZnJhZ21lbnQuY29tL2dpZnQva2lzc2VkZnJvZy02NDI1LndlYnA.webp'
        },
        {
            resolution: '1500x1500',
            url: 'https://cache.tonapi.io/imgproxy/u6vCCh41t179vYv2n3UAU1I0jpCS24L-KNRE8fGuCJQ/rs:fill:1500:1500:1/g:no/aHR0cHM6Ly9uZnQuZnJhZ21lbnQuY29tL2dpZnQva2lzc2VkZnJvZy02NDI1LndlYnA.webp'
        }
    ],
    attributes: [
        { trait_type: 'Model', value: 'Happy Pepe' },
        { trait_type: 'Backdrop', value: 'Black' },
        { trait_type: 'Symbol', value: 'Happy Smile' }
    ]
};

/** Pick the smallest preview whose width is >= `min`, fall back to the largest. */
export function pickPreview(data: NftData, min: number): string {
    const sorted = [...data.previews].sort(
        (a, b) => parseInt(a.resolution) - parseInt(b.resolution)
    );
    return (sorted.find(p => parseInt(p.resolution) >= min) ?? sorted[sorted.length - 1]).url;
}
