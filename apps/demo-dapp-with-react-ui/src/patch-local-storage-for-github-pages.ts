// Scope keys to the app base path (GH Pages subpath), not the current SPA route.
// Using pathname would break TonConnect session restore after navigating + refresh.
const basePath = import.meta.env.BASE_URL.replace(/\/+$/, '');
const separator = basePath ? `${basePath}:` : '';

const setItem = localStorage.setItem;
localStorage.constructor.prototype.setItem = (key: unknown, value: string) =>
    setItem.apply(localStorage, [separator + key, value]);
localStorage.setItem = (key: unknown, value: string) =>
    setItem.apply(localStorage, [separator + key, value]);

const getItem = localStorage.getItem;
localStorage.constructor.prototype.getItem = (key: unknown) =>
    getItem.apply(localStorage, [separator + key]);
localStorage.getItem = (key: unknown) => getItem.apply(localStorage, [separator + key]);

const removeItem = localStorage.removeItem;
localStorage.constructor.prototype.removeItem = (key: unknown) =>
    removeItem.apply(localStorage, [separator + key]);
localStorage.removeItem = (key: unknown) => removeItem.apply(localStorage, [separator + key]);

export {};
