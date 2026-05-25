const iframeStyle = { width: '100%', height: '100vh', border: 'none' } as const;

export const IframePage = () => <iframe src="/" style={iframeStyle} />;

export const IframeIframePage = () => <iframe src="/iframe" style={iframeStyle} />;
