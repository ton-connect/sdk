/**
 * The 3D diamond's model data, about 540 KB, is too large for the bundle and is fetched once a diamond
 * is shown. The files are read with the layout `scene.ts` expects, so a changed model goes into a new
 * folder rather than over these files, which published versions keep loading.
 *
 * Development servers serve the repository's copy instead, through `tools/serve-diamond-model.ts`.
 */
export const DIAMOND_MODEL_URL = import.meta.env.DEV
    ? '/@diamond-model/'
    : 'https://raw.githubusercontent.com/ton-connect/sdk/main/assets/diamond/';
