import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { FieldInfo } from "@/data/field-info"

interface FieldInfoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  info: FieldInfo
}

export function FieldInfoModal({ open, onOpenChange, info }: FieldInfoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{info.name}</DialogTitle>
          <p className="text-sm text-muted-foreground">{info.summary}</p>
        </DialogHeader>

        <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:text-foreground prose-li:text-muted-foreground prose-th:text-foreground prose-td:text-muted-foreground">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{info.content}</ReactMarkdown>
        </div>

        {info.links && info.links.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {info.links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                {link.title} ↗
              </a>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
