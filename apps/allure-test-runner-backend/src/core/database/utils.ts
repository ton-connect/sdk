import { ILike } from 'typeorm';

export function buildSearchQuery(search: string) {
    return ILike(`%${search}%`);
}
