import { memo } from 'react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Search, RefreshCw } from 'lucide-react';

type Props = {
    value: string;
    placeholder?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    loading?: boolean;
    onRefresh: () => void;
};

export const SearchBar = memo(function SearchBar({
    value,
    onChange,
    loading,
    onRefresh,
    placeholder
}: Props) {
    return (
        <div className="flex flex-col gap-3 w-full lg:flex-row lg:w-auto lg:gap-2">
            <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={placeholder || 'Search launches...'}
                    value={value}
                    onChange={onChange}
                    className="pl-10 h-11 lg:h-10 border bg-background text-base lg:text-sm"
                    autoComplete="off"
                />
                {loading && (
                    <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
                )}
            </div>
            <Button 
                onClick={onRefresh} 
                variant="outline"
                className="h-11 lg:h-10 lg:px-4 w-full lg:w-auto"
                size="default"
            >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
            </Button>
        </div>
    );
});
