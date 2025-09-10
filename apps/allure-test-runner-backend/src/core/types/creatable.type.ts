export type Creatable<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
