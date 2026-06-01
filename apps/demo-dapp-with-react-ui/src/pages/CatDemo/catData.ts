// Static NFT metadata for Scared Cat #742 (Telegram gift), shaped like the
// payload TonAPI returns for an NFT item. Captured rather than fetched so the
// demo has zero network deps. Reuses the `NftData` shape from the Frog demo.
import type { NftData } from '../FrogDemo/nftData';

const IMAGE = 'https://nft.fragment.com/gift/scaredcat-742.webp';

export const SCARED_CAT_742: NftData = {
    address: 'EQAscaredcat742demoaddressxxxxxxxxxxxxxxxxxxxxxxx',
    name: 'Scared Cat #742',
    description:
        'An exclusive Scared Cat with the appearance Meowdas on a Black background with Spider Web icons.',
    collection: {
        address: 'EQscaredcatscollectiondemoxxxxxxxxxxxxxxxxxxxxxxx',
        name: 'Scared Cats'
    },
    verified: true,
    approvedBy: ['getgems'],
    image: IMAGE,
    lottie: 'https://nft.fragment.com/gift/scaredcat-742.lottie.json',
    previews: [
        { resolution: '100x100', url: IMAGE },
        { resolution: '500x500', url: IMAGE },
        { resolution: '1500x1500', url: IMAGE }
    ],
    attributes: [
        { trait_type: 'Model', value: 'Meowdas' },
        { trait_type: 'Backdrop', value: 'Black' },
        { trait_type: 'Symbol', value: 'Spider Web' }
    ]
};
