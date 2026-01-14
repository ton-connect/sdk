import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import { getSectionInfo } from "@/data/field-info"

interface Step {
  title: string
  description: string
}

interface ExpandableDocsCardProps {
  sectionId: string
  steps: Step[]
}

export function ExpandableDocsCard({ sectionId, steps }: ExpandableDocsCardProps) {
  const [expanded, setExpanded] = useState(false)
  const info = getSectionInfo(sectionId)

  if (!info) return null

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{info.name}</CardTitle>
          {expanded && (
            <Button variant="ghost" size="sm" onClick={() => setExpanded(false)}>
              <ChevronUp className="h-4 w-4 mr-1" />
              Less
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{info.summary}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {!expanded && (
          <>
            {/* Collapsed: Steps grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {steps.map((step, i) => (
                <div key={i}>
                  <h4 className="font-medium text-foreground mb-1">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>

            {/* Expand button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded(true)}
              className="w-full"
            >
              <ChevronDown className="h-4 w-4 mr-1" />
              Full Documentation
            </Button>
          </>
        )}

        {expanded && (
          /* Expanded: Full markdown */
          <div className="prose prose-sm dark:prose-invert max-w-none
            prose-headings:text-foreground prose-headings:font-semibold
            prose-h2:text-base prose-h2:mt-6 prose-h2:mb-2 prose-h2:border-b prose-h2:pb-1
            prose-p:text-muted-foreground prose-p:my-2
            prose-strong:text-foreground
            prose-ul:my-2 prose-li:my-0.5
            prose-code:text-xs prose-code:bg-muted prose-code:px-1 prose-code:rounded
            prose-pre:bg-muted prose-pre:text-xs"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {info.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Links (always visible) */}
        {info.links && info.links.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-3 border-t">
            {info.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                {link.title}
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
