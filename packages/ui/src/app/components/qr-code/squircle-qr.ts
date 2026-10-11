type QrMatrix = {
    getModuleCount(): number;
    isDark(row: number, col: number): boolean;
};

/** The square, in module units, holding the blank squircle the logo is laid over. */
export type QrHole = {
    start: number;
    size: number;
};

const FINDER_SIZE = 7;
// Outer corners are rounded by half a module, so a lone module is a squircle and a line has round ends
const MODULE_RADIUS = 0.5;
// The finder patterns: a ring of one module around a three-module square
const FINDER_OUTER_RADIUS = 2.4;
const FINDER_INNER_RADIUS = FINDER_OUTER_RADIUS - 1;
const FINDER_CENTER_RADIUS = 1.1;
// How far the Bézier handles reach towards a corner, relative to its radius. A circle needs 0.55;
// longer handles keep the curve closer to the corner, giving a squircle's flatter, continuous turn.
const SQUIRCLE_HANDLE = 0.72;
// The blank under the logo is a superellipse of this power, between a circle (2) and a square
const HOLE_SHAPE_POWER = 4;

/**
 * Draws the QR code as one SVG path, in the style of the Telegram apps: dark modules merge into smooth
 * shapes, with squircle corners outside and matching fillets inside, and the finder patterns are
 * squircles. Modules in the squircle inscribed in `hole` are left out.
 */
export function renderSquircleQr(qr: QrMatrix, cellSize: number, hole?: QrHole): string {
    const count = qr.getModuleCount();
    const size = count * cellSize;

    const isFinder = (row: number, col: number): boolean =>
        (row < FINDER_SIZE && (col < FINDER_SIZE || col >= count - FINDER_SIZE)) ||
        (row >= count - FINDER_SIZE && col < FINDER_SIZE);

    // By the module's centre, so the shapes around the blank follow its curve
    const isInHole = (row: number, col: number): boolean => {
        if (!hole) {
            return false;
        }

        const radius = hole.size / 2;
        const center = hole.start + radius;

        return (
            Math.abs((col + 0.5 - center) / radius) ** HOLE_SHAPE_POWER +
                Math.abs((row + 0.5 - center) / radius) ** HOLE_SHAPE_POWER <=
            1
        );
    };

    const isDark = (row: number, col: number): boolean =>
        row >= 0 &&
        col >= 0 &&
        row < count &&
        col < count &&
        !isFinder(row, col) &&
        !isInHole(row, col) &&
        qr.isDark(row, col);

    const isOuterCorner = (row: number, col: number, dRow: number, dCol: number): number =>
        !isDark(row + dRow, col) && !isDark(row, col + dCol) ? MODULE_RADIUS : 0;

    const path: string[] = [];

    for (let row = 0; row < count; row++) {
        for (let col = 0; col < count; col++) {
            if (isFinder(row, col)) {
                continue;
            }

            if (isDark(row, col)) {
                // A corner is rounded where neither of the modules along its sides is dark, so inside
                // a horizontal run none is: the run is drawn as one shape, rounded at its ends only
                let end = col;
                while (isDark(row, end + 1)) {
                    end++;
                }

                path.push(
                    drawRoundedRect(col, row, end - col + 1, 1, {
                        topLeft: isOuterCorner(row, col, -1, -1),
                        topRight: isOuterCorner(row, end, -1, 1),
                        bottomRight: isOuterCorner(row, end, 1, 1),
                        bottomLeft: isOuterCorner(row, col, 1, -1)
                    })
                );
                col = end;
                continue;
            }

            const top = isDark(row - 1, col);
            const bottom = isDark(row + 1, col);
            const left = isDark(row, col - 1);
            const right = isDark(row, col + 1);

            // An inner corner, where three dark modules meet around a light one, gets a fillet
            if (top && left && isDark(row - 1, col - 1)) {
                path.push(drawFillet(col, row, 1, 1));
            }
            if (top && right && isDark(row - 1, col + 1)) {
                path.push(drawFillet(col + 1, row, -1, 1));
            }
            if (bottom && right && isDark(row + 1, col + 1)) {
                path.push(drawFillet(col + 1, row + 1, -1, -1));
            }
            if (bottom && left && isDark(row + 1, col - 1)) {
                path.push(drawFillet(col, row + 1, 1, -1));
            }
        }
    }

    const finderOffset = count - FINDER_SIZE;
    [
        [0, 0],
        [finderOffset, 0],
        [0, finderOffset]
    ].forEach(([x, y]) => path.push(drawFinder(x!, y!)));

    return (
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" ` +
        `viewBox="0 0 ${count} ${count}"><path d="${path.join('')}"/></svg>`
    );
}

/**
 * Fills the inner corner at the vertex (`x`, `y`) of a light module; `dx` and `dy` point from the
 * vertex into the module.
 */
function drawFillet(x: number, y: number, dx: number, dy: number): string {
    const r = MODULE_RADIUS;
    const handle = r - r * SQUIRCLE_HANDLE;

    return (
        `M${format(x)} ${format(y)}` +
        `L${format(x + dx * r)} ${format(y)}` +
        `C${format(x + dx * handle)} ${format(y)} ${format(x)} ${format(y + dy * handle)} ` +
        `${format(x)} ${format(y + dy * r)}Z`
    );
}

/** A ring of one module around a three-module square, cut out of the outer shape by its winding. */
function drawFinder(x: number, y: number): string {
    return (
        drawSquircle(x, y, FINDER_SIZE, FINDER_OUTER_RADIUS) +
        drawSquircle(x + 1, y + 1, FINDER_SIZE - 2, FINDER_INNER_RADIUS, true) +
        drawSquircle(x + 2, y + 2, FINDER_SIZE - 4, FINDER_CENTER_RADIUS)
    );
}

function drawSquircle(
    x: number,
    y: number,
    size: number,
    radius: number,
    isReversed = false
): string {
    const corners = { topLeft: radius, topRight: radius, bottomRight: radius, bottomLeft: radius };

    return drawRoundedRect(x, y, size, size, corners, isReversed);
}

/** A rectangle with squircle corners, clockwise unless `isReversed`, which cuts it out of a shape. */
function drawRoundedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: { topLeft: number; topRight: number; bottomRight: number; bottomLeft: number },
    isReversed = false
): string {
    const right = x + width;
    const bottom = y + height;

    // Corners in clockwise order: the vertex, the direction the outline arrives from, and its radius
    const corners: [number, number, number, number, number][] = [
        [right, y, 1, 0, radius.topRight],
        [right, bottom, 0, 1, radius.bottomRight],
        [x, bottom, -1, 0, radius.bottomLeft],
        [x, y, 0, -1, radius.topLeft]
    ];

    const ordered = isReversed ? reverseCorners(corners) : corners;
    let d = '';

    ordered.forEach(([vx, vy, inX, inY, r], i) => {
        // The outline arrives along (inX, inY) and leaves turning clockwise, or anticlockwise reversed
        const outX = isReversed ? inY : -inY;
        const outY = isReversed ? -inX : inX;
        const startX = vx - inX * r;
        const startY = vy - inY * r;
        const endX = vx + outX * r;
        const endY = vy + outY * r;

        d += `${i === 0 ? 'M' : 'L'}${format(startX)} ${format(startY)}`;

        if (r > 0) {
            const handle = r * SQUIRCLE_HANDLE;
            d +=
                `C${format(startX + inX * handle)} ${format(startY + inY * handle)} ` +
                `${format(endX - outX * handle)} ${format(endY - outY * handle)} ` +
                `${format(endX)} ${format(endY)}`;
        }
    });

    return `${d}Z`;
}

// Walks the same corners anticlockwise: each vertex is now reached along the reverse of the side
// that left it
function reverseCorners(
    corners: [number, number, number, number, number][]
): [number, number, number, number, number][] {
    return [...corners].reverse().map(([vx, vy, inX, inY, r]) => {
        const outX = -inY;
        const outY = inX;
        return [vx, vy, -outX, -outY, r];
    });
}

function format(value: number): string {
    return String(Math.round(value * 1000) / 1000);
}
