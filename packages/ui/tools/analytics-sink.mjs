#!/usr/bin/env node
/**
 * Local stand-in for the analytics collector.
 *
 * The hosted collector at analytics.ton.org rejects every request from a development origin —
 * it answers 400 even for batches containing only long-established event names — so analytics
 * cannot be verified against it locally, and a regression would go unnoticed until release.
 *
 * Usage:
 *   node packages/ui/tools/analytics-sink.mjs
 *   pnpm --filter @tonconnect/ui dev
 *   open http://localhost:3000/?analyticsUrl=http://localhost:3100/events
 *
 * Prints one line per event, and the full batch with --verbose.
 */
import { createServer } from 'node:http';

const PORT = Number(process.env.PORT ?? 3100);
const verbose = process.argv.includes('--verbose');

let batches = 0;
let events = 0;
const seen = new Map();

createServer((req, res) => {
    // The SDK posts cross-origin from the dev server, so preflight has to succeed.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        res.writeHead(204).end();
        return;
    }

    if (req.method !== 'POST') {
        res.writeHead(405).end();
        return;
    }

    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
        let parsed;
        try {
            parsed = JSON.parse(body);
        } catch {
            console.error('  ! unparseable body:', body.slice(0, 200));
            res.writeHead(400).end('{}');
            return;
        }

        const batch = Array.isArray(parsed) ? parsed : [parsed];
        batches++;
        events += batch.length;

        console.log(`\nbatch ${batches} — ${batch.length} event(s)`);
        for (const event of batch) {
            const name = event.event_name ?? '<no event_name>';
            seen.set(name, (seen.get(name) ?? 0) + 1);

            // The fields this investigation cares about; everything else is in --verbose.
            const notable = [
                event.wallet_app_name && `wallet=${event.wallet_app_name}`,
                event.surface && `surface=${event.surface}`,
                event.selection_source && `source=${event.selection_source}`,
                event.connection_mode && `mode=${event.connection_mode}`,
                event.connection_source_kind && `kind=${event.connection_source_kind}`,
                event.is_restore !== undefined && `is_restore=${event.is_restore}`,
                event.trace_id && `trace=${String(event.trace_id).slice(0, 8)}`
            ].filter(Boolean);

            console.log(`  ${name.padEnd(30)} ${notable.join('  ')}`);
        }

        if (verbose) {
            console.log(JSON.stringify(batch, null, 2));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' }).end('{}');
    });
}).listen(PORT, () => {
    console.log(`analytics sink listening on http://localhost:${PORT}/events`);
    console.log('with the dev server running, open:');
    console.log(
        `  http://localhost:3000/?analyticsUrl=http://localhost:${PORT}/events\n`
    );
});

process.on('SIGINT', () => {
    console.log(`\n\n${batches} batch(es), ${events} event(s):`);
    for (const [name, count] of [...seen].sort((a, b) => b[1] - a[1])) {
        console.log(`  ${String(count).padStart(5)}  ${name}`);
    }
    process.exit(0);
});
