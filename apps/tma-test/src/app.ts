import './style.css';
import { scenarios, Scenario } from './scenarios';
import { runSteps } from './runner';

export const initialHash = location.hash;

const STORAGE_KEY = 'tma-test-scenario';
const app = document.getElementById('app')!;

function renderPicker(): void {
    const rows = scenarios
        .map(
            (s, i) =>
                `<div class="group-row picker-row" data-index="${i}">` +
                `<div class="picker-content">` +
                `<div class="picker-name">${s.name}</div>` +
                `<div class="picker-desc">${s.description}</div>` +
                `</div>` +
                `<div class="picker-chevron">›</div>` +
                `</div>`
        )
        .join('');

    app.innerHTML =
        `<div class="page-header">` +
        `<div class="page-title">TON Connect Debug</div>` +
        `<div id="button-root"></div>` +
        `</div>` +
        `<div class="page-subtitle">Choose a scenario to test TMA detection</div>` +
        `<div class="group">${rows}</div>`;

    app.addEventListener('click', e => {
        const row = (e.target as HTMLElement).closest<HTMLElement>('.picker-row');
        if (!row) return;
        const index = Number(row.dataset.index);
        sessionStorage.setItem(STORAGE_KEY, String(index));
        startScenario(scenarios[index]);
    });
}

async function startScenario(scenario: Scenario): Promise<void> {
    app.innerHTML =
        `<div class="page-header">` +
        `<div class="page-title">${scenario.name}</div>` +
        `<div id="button-root"></div>` +
        `</div>` +
        `<div class="page-subtitle">${scenario.description}</div>` +
        `<div id="progress"></div>` +
        `<div id="diagnostics"></div>`;

    await runSteps(scenario.steps);
}

const saved = sessionStorage.getItem(STORAGE_KEY);
if (saved !== null && scenarios[Number(saved)]) {
    startScenario(scenarios[Number(saved)]);
} else {
    renderPicker();
}
