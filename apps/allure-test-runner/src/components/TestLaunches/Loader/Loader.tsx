import './Loader.scss';

type LoaderProps = {
    size?: 'small' | 'medium' | 'large';
    text?: string;
    overlay?: boolean;
};

export function Loader({ size = 'medium', text, overlay = false }: LoaderProps) {
    const content = (
        <div className={`loader loader--${size}`}>
            <div className="loader__spinner" />
            {text && <div className="loader__text">{text}</div>}
        </div>
    );

    if (overlay) {
        return <div className="loader-overlay">{content}</div>;
    }

    return content;
}
