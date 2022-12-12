export function openLink(href: string, target = '_self'): void {
    window.open(href, target, 'noreferrer noopener');
}

export function openLinkBlank(href: string): void {
    openLink(href, '_blank');
}
