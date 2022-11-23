export function copyToClipboard(text: string): Promise<void> {
    if (navigator?.clipboard) {
        return navigator.clipboard.writeText(text);
    }

    fallbackCopyTextToClipboard(text);
    return Promise.resolve();
}

function fallbackCopyTextToClipboard(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
    } finally {
        document.body.removeChild(textArea);
    }
}
