import { Title, Body } from '../../ui/typography';

type Props = {
    description?: string;
    descriptionHtml?: string;
};

export function TestCaseDescription({ description, descriptionHtml }: Props) {
    if (!description && !descriptionHtml) {
        return null;
    }

    return (
        <div className="border border-border rounded-md bg-card w-full min-w-0 overflow-hidden">
            <div className="px-2 py-1.5 border-b border-border bg-muted/20">
                <Title className="text-sm font-medium">Description</Title>
            </div>
            <div className="p-2 w-full min-w-0 overflow-hidden">
                {descriptionHtml ? (
                    <div
                        className="prose prose-sm max-w-none text-foreground break-words overflow-wrap-anywhere word-break-anywhere w-full text-xs"
                        dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                    />
                ) : (
                    <div className="bg-muted/30 border border-border rounded-md p-1.5 w-full min-w-0 break-words overflow-hidden">
                        <Body className="whitespace-pre-wrap break-words overflow-wrap-anywhere leading-snug word-break-anywhere w-full text-xs">
                            {description}
                        </Body>
                    </div>
                )}
            </div>
        </div>
    );
}
