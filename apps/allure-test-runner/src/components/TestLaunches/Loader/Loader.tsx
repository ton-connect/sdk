import './Loader.scss';

type LoaderProps = {
    size?: 'small' | 'medium' | 'large';
    text?: string;
    overlay?: boolean;
    horizontal?: boolean;
};

export function Loader({ size = 'medium', text, overlay = false, horizontal = false }: LoaderProps) {
    const content = (
        <div className={`loader loader--${size} ${horizontal ? 'loader--horizontal' : ''}`}>
            <div className="loader__spinner" />
            {text && <div className="loader__text">{text}</div>}
        </div>
    );

    if (overlay) {
        return <div className="loader-overlay">{content}</div>;
    }

    return content;
}
