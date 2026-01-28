import { toast } from "sonner"

export async function copyToClipboard(text: string, showToast = true): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    if (showToast) {
      toast.success("Copied to clipboard")
    }
    return true
  } catch {
    if (showToast) {
      toast.error("Failed to copy")
    }
    return false
  }
}
