import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy } from "lucide-react"
import { toast } from "sonner"

interface JsonDisplayProps {
  title: string
  json: string
}

export function JsonDisplay({ title, json }: JsonDisplayProps) {
  if (!json) return null

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(json)
      toast.success("Copied to clipboard")
    } catch {
      toast.error("Failed to copy")
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">{title}</Label>
        <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8 gap-2">
          <Copy className="h-4 w-4" />
          Copy
        </Button>
      </div>
      <ScrollArea className="h-[300px] rounded-md border bg-muted/50">
        <pre className="p-4 text-xs font-mono">{json}</pre>
      </ScrollArea>
    </div>
  )
}
