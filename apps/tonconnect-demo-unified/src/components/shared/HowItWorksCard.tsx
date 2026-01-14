import { useMemo } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Check } from "lucide-react"
import { getSectionInfo } from "@/data/field-info"

// Feature lists for each section
const SECTION_FEATURES: Record<string, string[]> = {
  transaction: [
    "Multiple messages per transaction",
    "Custom payloads for smart contracts",
    "Contract deployment support",
    "Batch operations",
  ],
  signData: [
    "Text, binary, cell formats",
    "Domain-bound signatures",
    "Timestamp protection",
    "Off-chain verification",
  ],
}

interface HowItWorksCardProps {
  sectionId: string
}

export function HowItWorksCard({ sectionId }: HowItWorksCardProps) {
  const info = getSectionInfo(sectionId)
  const features = SECTION_FEATURES[sectionId] || []

  // Extract h2 headings from markdown for navigation
  const headings = useMemo(() => {
    if (!info?.content) return []
    const matches = info.content.match(/^## (.+)$/gm)
    return matches?.map(h => h.replace("## ", "")) || []
  }, [info?.content])

  if (!info) return null

  const scrollToHeading = (heading: string) => {
    // Find the heading element and scroll to it
    const slug = heading.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "")
    const element = document.getElementById(slug)
    element?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{info.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-[260px_1fr] gap-6">

          {/* LEFT: Summary - hidden on mobile */}
          <div className="hidden lg:flex lg:flex-col space-y-5 border-r pr-6">
            {/* Summary */}
            <p className="text-sm text-muted-foreground">{info.summary}</p>

            {/* Features checklist */}
            {features.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Key Features</h4>
                <ul className="space-y-1.5">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Navigation */}
            {headings.length > 0 && (
              <nav className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Jump to</h4>
                <ul className="space-y-1">
                  {headings.map((heading, i) => (
                    <li key={i}>
                      <button
                        onClick={() => scrollToHeading(heading)}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                      >
                        → {heading}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {/* Links */}
            {info.links && info.links.length > 0 && (
              <div className="space-y-2 pt-2 border-t mt-auto">
                {info.links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    {link.title}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Full markdown content */}
          <div className="prose prose-sm dark:prose-invert max-w-none
            prose-headings:scroll-mt-4
            prose-h2:text-base prose-h2:font-semibold prose-h2:mt-6 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:first:mt-0
            prose-p:text-muted-foreground prose-p:my-2 prose-p:leading-relaxed
            prose-strong:text-foreground prose-strong:font-medium
            prose-ul:my-2 prose-ul:text-muted-foreground prose-ul:space-y-1
            prose-ol:my-2 prose-ol:text-muted-foreground prose-ol:space-y-1
            prose-li:my-0
            prose-code:text-xs prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-muted prose-pre:text-xs prose-pre:p-3 prose-pre:my-3
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Add id to h2 for navigation
                h2: ({ children, ...props }) => {
                  const text = String(children)
                  const id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "")
                  return <h2 id={id} {...props}>{children}</h2>
                }
              }}
            >
              {info.content}
            </ReactMarkdown>
          </div>

        </div>

        {/* Links on mobile - shown only on mobile */}
        {info.links && info.links.length > 0 && (
          <div className="lg:hidden flex flex-wrap gap-x-4 gap-y-2 border-t pt-4 mt-6">
            {info.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
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
