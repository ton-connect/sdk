import { BookOpen } from 'lucide-react';

import { GitHubIcon } from '../../ui/icons';
import type { FC, ReactNode } from 'react';

const linkClassName =
    'relative top-[0.2em] inline-flex size-7 shrink-0 items-center justify-center rounded-md text-primary hover:bg-tertiary';

interface PageHeadingProps {
    title: string | ReactNode;
    docHref?: string;
    sourceHref?: string;
    className?: string;
}

export const PageHeading: FC<PageHeadingProps> = ({
    title,
    docHref,
    sourceHref,
    className
}) => {
    if (title == null) {
        return null;
    }

    if (typeof title !== 'string') {
        return <>{title}</>;
    }

    return (
        <div className={className ?? 'flex min-w-0 items-baseline gap-1.5'}>
            <h1 className="truncate text-lg font-semibold leading-none md:text-lg">{title}</h1>
            {docHref && (
                <a
                    href={docHref}
                    target="_blank"
                    rel="noreferrer"
                    title="Documentation"
                    aria-label="Documentation"
                    className={linkClassName}
                    data-testid="page-doc-link"
                >
                    <BookOpen className="size-4" />
                </a>
            )}
            {sourceHref && (
                <a
                    href={sourceHref}
                    target="_blank"
                    rel="noreferrer"
                    title="View demo source on GitHub"
                    aria-label="View demo source on GitHub"
                    className={linkClassName}
                    data-testid="page-source-link"
                >
                    <GitHubIcon className="size-4" />
                </a>
            )}
        </div>
    );
};
