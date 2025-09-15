import React from 'react';
import { useGetMeQuery } from '../../store/api/allureApi';
import { useAuth } from '../../providers/AuthProvider';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { Settings, User, LogOut, ChevronDown } from 'lucide-react';
import { Loader } from '../ui/loader';
import { useNavigate } from 'react-router-dom';

export const UserInfo: React.FC = () => {
    const { data: user, isLoading } = useGetMeQuery();
    const { logout } = useAuth();
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="flex items-center gap-2">
                <Loader size="sm" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'user':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'wallet':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.login}</span>
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{user.login}</span>
                        <Badge className={getRoleColor(user.role)}>{user.role.toUpperCase()}</Badge>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {user.role === 'admin' && (
                    <>
                        <DropdownMenuItem onClick={() => navigate('/admin')}>
                            <Settings className="h-4 w-4 mr-2" />
                            Administration
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                )}

                <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
