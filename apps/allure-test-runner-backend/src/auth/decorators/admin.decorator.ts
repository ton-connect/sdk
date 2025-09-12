import { USER_ROLE } from '../../users';
import { Auth } from './auth.decorator';

export const AdminOnly = () => Auth([USER_ROLE.ADMIN]);
