export type Mode = "noise" | "quiet"

type ModeStorage = Pick<Storage, "getItem" | "setItem">
const KEY = "1tx-mode"

export function readMode(storage: ModeStorage | null): Mode {
  try {
    return storage?.getItem(KEY) === "quiet" ? "quiet" : "noise"
  } catch {
    return "noise"
  }
}

export function writeMode(storage: ModeStorage | null, mode: Mode): void {
  try {
    storage?.setItem(KEY, mode)
  } catch {
    // Some private windows block storage. The switch still works, it just isn't remembered.
  }
}
