export interface Step {
    label: string;
    action: () => Promise<void | unknown> | void;
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function runSteps(steps: Step[]): Promise<void> {
    const container = document.getElementById('progress');
    if (!container) return;

    const group = document.createElement('div');
    group.className = 'group';
    container.appendChild(group);

    const rows: HTMLDivElement[] = steps.map(step => {
        const row = document.createElement('div');
        row.className = 'group-row step-pending';
        row.innerHTML =
            `<span class="step-label">${step.label}</span>` +
            `<span class="step-status">waiting</span>`;
        group.appendChild(row);
        return row;
    });

    for (let i = 0; i < steps.length; i++) {
        rows[i].className = 'group-row step-running';
        rows[i].querySelector('.step-status')!.textContent = 'loading…';

        await steps[i].action();
        await delay(1000);

        rows[i].className = 'group-row step-done';
        rows[i].querySelector('.step-status')!.textContent = '✓';
    }
}
