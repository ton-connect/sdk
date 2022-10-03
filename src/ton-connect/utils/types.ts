export type AsStruct<T> = { [P in keyof T as T[P] extends Function ? never : P]: T[P] };
