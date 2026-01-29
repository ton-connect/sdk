import { Cell, loadMessage, beginCell, storeMessage } from "@ton/core"

/**
 * Generates a normalized hash of an "external-in" message for comparison.
 * Follows TEP-467.
 */
export function getNormalizedExtMessageHash(boc: string): string {
  const cell = Cell.fromBase64(boc)
  const message = loadMessage(cell.beginParse())

  if (message.info.type !== "external-in") {
    throw new Error(`Message must be "external-in", got ${message.info.type}`)
  }

  const info = { ...message.info, src: undefined, importFee: 0n }
  const normalizedMessage = {
    ...message,
    init: null,
    info: info,
  }

  return beginCell()
    .store(storeMessage(normalizedMessage, { forceRef: true }))
    .endCell()
    .hash()
    .toString("hex")
}
