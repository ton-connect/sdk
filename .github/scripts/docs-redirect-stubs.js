'use strict';
const fs = require('node:fs');
const path = require('node:path');

const MODULE_PREFIXES = ['_tonconnect_sdk.', '_tonconnect_ui.', '_tonconnect_ui_react.', '_tonconnect_protocol.'];

function resolveTarget(oldPath, freshPaths) {
    let target = '';
    if (freshPaths.has(oldPath)) {
        target = oldPath;
    } else {
        const dir = path.posix.dirname(oldPath);
        const base = path.posix.basename(oldPath);
        const prefix = MODULE_PREFIXES.find(p => base.startsWith(p));
        if (prefix) {
            const rest = base.slice(prefix.length);
            const match = MODULE_PREFIXES.map(p => path.posix.join(dir, p + rest)).find(p => freshPaths.has(p));
            target = match || '';
        }
    }
    return target.replace(/(^|\/)index\.html$/, '$1');
}

function stubHtml(url) {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved to docs.ton-connect.io</title>
<link rel="canonical" href="${url}">
<script>location.replace(${JSON.stringify(url)} + location.hash)</script>
<noscript><meta http-equiv="refresh" content="0; url=${url}"></noscript>
</head>
<body><a href="${url}">${url}</a></body>
</html>
`;
}

function buildStubs({ oldPaths, freshPaths, baseUrl }) {
    const fresh = new Set(freshPaths);
    const stubs = new Map();
    for (const page of new Set([...oldPaths, ...freshPaths])) {
        if (page.endsWith('.html') && page !== '404.html') {
            stubs.set(page, stubHtml(baseUrl + resolveTarget(page, fresh)));
        }
    }
    stubs.set('404.html', stubHtml(baseUrl));
    return stubs;
}

function listHtml(root) {
    const found = [];
    const walk = rel => {
        for (const entry of fs.readdirSync(path.join(root, rel), { withFileTypes: true })) {
            const child = rel ? `${rel}/${entry.name}` : entry.name;
            if (entry.isDirectory()) walk(child);
            else if (entry.name.endsWith('.html')) found.push(child);
        }
    };
    walk('');
    return found;
}

function writeStubs(outDir, stubs) {
    fs.rmSync(outDir, { recursive: true, force: true });
    for (const [rel, html] of stubs) {
        const file = path.join(outDir, rel);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, html);
    }
    fs.writeFileSync(path.join(outDir, '.nojekyll'), '');
}

if (require.main === module) {
    const [oldDir, freshDir, outDir, baseUrl] = process.argv.slice(2);
    if (!oldDir || !freshDir || !outDir || !baseUrl) {
        console.error('usage: docs-redirect-stubs.js <old-docs-dir> <fresh-docs-dir> <out-dir> <base-url>');
        process.exit(2);
    }
    const stubs = buildStubs({ oldPaths: listHtml(oldDir), freshPaths: listHtml(freshDir), baseUrl });
    writeStubs(outDir, stubs);
    console.log(`wrote ${stubs.size} stubs to ${outDir}`);
}

module.exports = { resolveTarget, buildStubs, listHtml, stubHtml };
