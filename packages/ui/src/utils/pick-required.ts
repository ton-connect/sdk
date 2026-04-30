export type PickRequired<TObj, VFields extends keyof TObj> = TObj & Required<Pick<TObj, VFields>>;
