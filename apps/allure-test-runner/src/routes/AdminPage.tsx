import { useState } from 'react';
import { useGetUsersQuery, useUpdateUserMutation } from '../store/api/allureApi';
import { useAuth } from '../providers/AuthProvider';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, ArrowLeft, Save, Search, RefreshCw, User } from 'lucide-react';
import { PageContainer, ContentContainer, Stack, Inline } from '../components/ui/layout';
import { Input } from '../components/ui/input';
import { Loader } from '../components/ui/loader';
import { LargeTitle, Body } from '../components/ui/typography';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '../components/ui/table';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { UserInfo } from '../components/UserInfo/UserInfo';

const USER_ROLES = [
    { value: 'user', label: 'User' },
    { value: 'wallet', label: 'Wallet' },
    { value: 'admin', label: 'Admin' }
];

export function AdminPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search.trim(), 300);

    const queryParams = debouncedSearch
        ? { search: debouncedSearch, sort: ['createdAt,DESC'] }
        : { sort: ['createdAt,DESC'] };

    const {
        data: users,
        isLoading,
        error,
        refetch
    } = useGetUsersQuery(queryParams, {
        refetchOnMountOrArgChange: true
    });

    const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

    const [editingUser, setEditingUser] = useState<number | null>(null);
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [walletNameDraft, setWalletNameDraft] = useState<string>('');

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

    const handleEditUser = (userId: number, currentRole: string, walletName?: string | null) => {
        // Don't allow editing yourself
        if (user && userId === user.id) {
            return;
        }
        setEditingUser(userId);
        setSelectedRole(currentRole);
        setWalletNameDraft(walletName ?? '');
    };

    const handleSaveRole = async () => {
        if (editingUser && selectedRole) {
            try {
                await updateUser({
                    id: editingUser,
                    role: selectedRole,
                    walletName: walletNameDraft
                }).unwrap();
                setEditingUser(null);
                setSelectedRole('');
                setWalletNameDraft('');
                refetch();
            } catch (err) {
                console.error('Failed to update user role:', err);
            }
        }
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setSelectedRole('');
        setWalletNameDraft('');
    };

    if (error) {
        return (
            <PageContainer>
                <ContentContainer className="flex items-center justify-center">
                    <Alert className="border-0 bg-destructive/10 max-w-md">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <AlertDescription className="ml-2">
                            <Stack spacing="tight">
                                <div>
                                    <Body className="font-semibold text-destructive">
                                        Failed to load users
                                    </Body>
                                    <Body className="text-destructive/80">{String(error)}</Body>
                                </div>
                                <Button onClick={() => refetch()} size="default">
                                    Try Again
                                </Button>
                            </Stack>
                        </AlertDescription>
                    </Alert>
                </ContentContainer>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <ContentContainer>
                <Stack spacing="normal">
                    {/* Header */}
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <Inline spacing="normal" className="items-center">
                            <UserInfo />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">Back to Launches</span>
                                <span className="sm:hidden">Back</span>
                            </Button>
                            <LargeTitle>User Administration</LargeTitle>
                        </Inline>
                    </div>

                    {/* Users Table */}
                    <div className="bg-card rounded-lg border">
                        <div className="p-6">
                            <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
                                <h3 className="text-lg font-semibold">Users Management</h3>
                                <div className="flex flex-col gap-3 w-full lg:flex-row lg:w-auto lg:gap-2">
                                    <div className="relative flex-1 lg:w-64">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search"
                                            className="pl-10 h-11 lg:h-10 border bg-background text-base lg:text-sm"
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            autoComplete="off"
                                        />
                                        {isLoading && (
                                            <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
                                        )}
                                    </div>
                                    <Button
                                        onClick={() => refetch()}
                                        variant="outline"
                                        className="h-11 lg:h-10 lg:px-4 w-full lg:w-auto"
                                        size="default"
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Refresh
                                    </Button>
                                    {users && (
                                        <Badge
                                            variant="outline"
                                            className="h-11 lg:h-10 flex items-center justify-center"
                                        >
                                            Total: {users.total}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader />
                                </div>
                            ) : (users?.items ?? []).length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <User className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No users found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        {debouncedSearch
                                            ? `No users match "${debouncedSearch}"`
                                            : 'No users available'}
                                    </p>
                                    {debouncedSearch && (
                                        <Button variant="outline" onClick={() => setSearch('')}>
                                            Clear search
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {/* Desktop Table */}
                                    <div className="hidden lg:block overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="min-h-[60px]">
                                                    <TableHead className="w-[60px] h-[60px] align-middle">
                                                        ID
                                                    </TableHead>
                                                    <TableHead className="w-[120px] h-[60px] align-middle">
                                                        Login
                                                    </TableHead>
                                                    <TableHead className="w-[140px] h-[60px] align-middle">
                                                        Role
                                                    </TableHead>
                                                    <TableHead className="w-[140px] h-[60px] align-middle">
                                                        Wallet
                                                    </TableHead>
                                                    <TableHead className="w-[100px] h-[60px] align-middle">
                                                        Created
                                                    </TableHead>
                                                    <TableHead className="w-[160px] h-[60px] align-middle">
                                                        Actions
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {(users?.items ?? []).map(userItem => (
                                                    <TableRow
                                                        key={userItem.id}
                                                        className="min-h-[60px]"
                                                    >
                                                        <TableCell className="font-medium w-[60px] h-[60px] align-middle">
                                                            {userItem.id}
                                                        </TableCell>
                                                        <TableCell className="w-[120px] h-[60px] align-middle">
                                                            {userItem.login}
                                                        </TableCell>
                                                        <TableCell className="w-[140px] h-[60px] align-middle">
                                                            {editingUser === userItem.id ? (
                                                                <Select
                                                                    value={selectedRole}
                                                                    onValueChange={setSelectedRole}
                                                                >
                                                                    <SelectTrigger className="w-32">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {USER_ROLES.map(role => (
                                                                            <SelectItem
                                                                                key={role.value}
                                                                                value={role.value}
                                                                            >
                                                                                {role.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            ) : (
                                                                <button
                                                                    onClick={() =>
                                                                        handleEditUser(
                                                                            userItem.id,
                                                                            userItem.role,
                                                                            userItem.walletName
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center p-2 rounded hover:bg-muted/50 transition-colors"
                                                                >
                                                                    <Badge
                                                                        className={getRoleColor(
                                                                            userItem.role
                                                                        )}
                                                                    >
                                                                        {userItem.role.toUpperCase()}
                                                                    </Badge>
                                                                </button>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="w-[140px] h-[60px] align-middle">
                                                            {editingUser === userItem.id ? (
                                                                <Input
                                                                    placeholder="Wallet name"
                                                                    value={walletNameDraft}
                                                                    onChange={e =>
                                                                        setWalletNameDraft(
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                />
                                                            ) : (
                                                                <button
                                                                    onClick={() =>
                                                                        handleEditUser(
                                                                            userItem.id,
                                                                            userItem.role,
                                                                            userItem.walletName ??
                                                                                null
                                                                        )
                                                                    }
                                                                    className="w-full text-left hover:bg-muted/50 rounded px-3 py-2 transition-colors cursor-pointer min-h-[40px] flex items-center"
                                                                >
                                                                    <span className="text-muted-foreground">
                                                                        {userItem.walletName ?? '—'}
                                                                    </span>
                                                                </button>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="w-[100px] h-[60px] align-middle">
                                                            {new Date(
                                                                userItem.createdAt
                                                            ).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell className="w-[160px] h-[60px] align-middle">
                                                            {editingUser === userItem.id ? (
                                                                <Inline spacing="tight">
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={handleSaveRole}
                                                                        disabled={isUpdating}
                                                                        className="flex items-center gap-1"
                                                                    >
                                                                        <Save className="h-3 w-3" />
                                                                        Save
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={handleCancelEdit}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                </Inline>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        handleEditUser(
                                                                            userItem.id,
                                                                            userItem.role,
                                                                            userItem.walletName
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        user &&
                                                                        userItem.id === user.id
                                                                    }
                                                                >
                                                                    {user && userItem.id === user.id
                                                                        ? 'You'
                                                                        : 'Edit'}
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Mobile Cards */}
                                    <div className="lg:hidden space-y-4">
                                        {(users?.items ?? []).map(userItem => (
                                            <div
                                                key={userItem.id}
                                                className="bg-card border rounded-lg p-4"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm text-muted-foreground">
                                                            #{userItem.id}
                                                        </span>
                                                        <Badge
                                                            className={getRoleColor(userItem.role)}
                                                        >
                                                            {userItem.role.toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                    {user && userItem.id !== user.id && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleEditUser(
                                                                    userItem.id,
                                                                    userItem.role,
                                                                    userItem.walletName
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <div>
                                                        <span className="text-sm font-medium">
                                                            Login:
                                                        </span>
                                                        <span className="ml-2">
                                                            {userItem.login}
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <span className="text-sm font-medium">
                                                            Wallet:
                                                        </span>
                                                        <span className="ml-2 text-muted-foreground">
                                                            {userItem.walletName ?? '—'}
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <span className="text-sm font-medium">
                                                            Created:
                                                        </span>
                                                        <span className="ml-2 text-muted-foreground">
                                                            {new Date(
                                                                userItem.createdAt
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                {editingUser === userItem.id && (
                                                    <div className="mt-4 pt-4 border-t space-y-3">
                                                        <div>
                                                            <label className="text-sm font-medium mb-1 block">
                                                                Role:
                                                            </label>
                                                            <Select
                                                                value={selectedRole}
                                                                onValueChange={setSelectedRole}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {USER_ROLES.map(role => (
                                                                        <SelectItem
                                                                            key={role.value}
                                                                            value={role.value}
                                                                        >
                                                                            {role.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div>
                                                            <label className="text-sm font-medium mb-1 block">
                                                                Wallet Name:
                                                            </label>
                                                            <Input
                                                                placeholder="Wallet name"
                                                                value={walletNameDraft}
                                                                onChange={e =>
                                                                    setWalletNameDraft(
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        </div>

                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={handleSaveRole}
                                                                disabled={isUpdating}
                                                                className="flex-1"
                                                            >
                                                                <Save className="h-3 w-3 mr-1" />
                                                                Save
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={handleCancelEdit}
                                                                className="flex-1"
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </Stack>
            </ContentContainer>
        </PageContainer>
    );
}
