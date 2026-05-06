#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const protocolRoot = path.resolve(packageRoot, '../protocol');
const srcRoot = path.join(packageRoot, 'src');
const publicEntry = path.join(srcRoot, 'index.ts');
const tempEntry = path.join(srcRoot, '__api_spec_entry.ts');
const tempOutDir = path.join(packageRoot, '.api-spec-tmp');
const finalSpec = path.join(packageRoot, 'API-SPEC.md');
const typedocConfig = path.join(packageRoot, 'typedoc.markdown.json');
const protocolTypes = path.join(protocolRoot, 'lib/types/index.d.ts');
const protocolExportLine = "export * from '@tonconnect/protocol';";

function run(command, args, cwd) {
    execFileSync(command, args, {
        cwd,
        stdio: 'inherit',
        env: process.env
    });
}

function ensureProtocolTypes() {
    if (fs.existsSync(protocolTypes)) {
        return;
    }

    run('pnpm', ['build'], protocolRoot);
}

function createTempEntry() {
    const source = fs.readFileSync(publicEntry, 'utf8');
    const filteredSource = source
        .split('\n')
        .filter(line => line.trim() !== protocolExportLine)
        .join('\n');

    fs.writeFileSync(tempEntry, filteredSource, 'utf8');
}

function generateMarkdown() {
    fs.rmSync(tempOutDir, { recursive: true, force: true });

    run(
        'pnpm',
        ['exec', 'typedoc', '--options', typedocConfig, path.relative(packageRoot, tempEntry)],
        packageRoot
    );

    const generatedSpec = path.join(tempOutDir, 'API-SPEC.md');
    if (!fs.existsSync(generatedSpec)) {
        throw new Error(`Expected generated file at ${generatedSpec}`);
    }

    fs.copyFileSync(generatedSpec, finalSpec);
}

function cleanup() {
    fs.rmSync(tempEntry, { force: true });
    fs.rmSync(tempOutDir, { recursive: true, force: true });
}

try {
    ensureProtocolTypes();
    createTempEntry();
    generateMarkdown();
    process.stdout.write(`Generated ${path.relative(packageRoot, finalSpec)} using typedoc-plugin-markdown.\n`);
} finally {
    cleanup();
}
