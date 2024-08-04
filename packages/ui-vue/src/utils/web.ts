export const isClient = () => {
  return typeof window !== "undefined";
};

export const isServer = () => {
  return !isClient();
};
