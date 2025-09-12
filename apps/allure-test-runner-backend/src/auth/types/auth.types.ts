import { USER_ROLE } from '../../users';

export type Principal = {
    id: number;
    role: USER_ROLE;
}