import { Navigate, type NavigateProps } from 'react-router-dom';

import { usePreserveSearch } from '@/core/hooks/use-preserve-search';

type PreserveSearchNavigateProps = Omit<NavigateProps, 'to'> & {
    to: string;
};

export const PreserveSearchNavigate = ({ to, ...props }: PreserveSearchNavigateProps) => {
    const withSearch = usePreserveSearch();
    return <Navigate to={withSearch(to)} {...props} />;
};
