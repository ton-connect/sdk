type Props = {
    description?: string;
    descriptionHtml?: string;
};

export function TestCaseDescription({ description, descriptionHtml }: Props) {
    if (!description && !descriptionHtml) {
        return null;
    }

    return (
        <div className="test-case-section">
            <div className="test-case-section-header-static">
                <h4 className="test-case-section-title">Description</h4>
            </div>
            <div className="test-case-content">
                {descriptionHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                ) : (
                    <div className="text-block">{description}</div>
                )}
            </div>
        </div>
    );
}
