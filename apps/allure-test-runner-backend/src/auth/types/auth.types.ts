import { USER_ROLE } from '../../users';

export type Principal = {
    id: number;
    login: string;
    role: USER_ROLE;
}