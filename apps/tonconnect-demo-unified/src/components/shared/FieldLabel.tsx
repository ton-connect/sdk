import { useState, type ReactNode } from "react"
import { Label } from "@/components/ui/label"
import { FieldInfoModal } from "./FieldInfoModal"
import { getFieldInfo } from "@/data/field-info"
import { Info } from "lucide-react"

interface FieldLabelProps {
  htmlFor?: string
  fieldId: string
  children: ReactNode
  className?: string
}

export function FieldLabel({ htmlFor, fieldId, children, className }: FieldLabelProps) {
  const [open, setOpen] = useState(false)
  const info = getFieldInfo(fieldId)

  return (
    <>
      <div className="flex items-center gap-1.5">
        <Label htmlFor={htmlFor} className={className}>{children}</Label>
        {info && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {info && <FieldInfoModal open={open} onOpenChange={setOpen} info={info} />}
    </>
  )
}
