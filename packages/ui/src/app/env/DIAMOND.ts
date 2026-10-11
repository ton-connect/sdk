// The 540 KB model loads once a diamond is shown; dev servers serve the repository copy instead.
// Published versions keep loading their folder, so a changed model goes into a new one.
export const DIAMOND_MODEL_URL = import.meta.env.DEV
    ? '/@diamond-model/'
    : 'https://s.ton-connect.io/diamond/v1/';
