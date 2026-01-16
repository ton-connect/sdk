import YAML from 'yaml'

export interface FieldInfo {
  id: string
  name: string
  summary: string
  content: string
  links?: { title: string; url: string }[]
}

// Vite glob import - load all markdown files at build time
const transactionDocs = import.meta.glob('../docs/fields/transaction/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>

const signDataDocs = import.meta.glob('../docs/fields/sign-data/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>

const connectDocs = import.meta.glob('../docs/fields/connect/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>

// Section-level documentation
const sectionDocs = import.meta.glob('../docs/sections/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>

function parseMarkdownWithFrontmatter(content: string): FieldInfo {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) throw new Error('Invalid frontmatter in markdown file')

  const meta = YAML.parse(match[1])
  return {
    id: meta.id,
    name: meta.name,
    summary: meta.summary,
    content: match[2].trim(),
    links: meta.links || []
  }
}

export const transactionFields: FieldInfo[] = Object.values(transactionDocs).map(parseMarkdownWithFrontmatter)
export const signDataFields: FieldInfo[] = Object.values(signDataDocs).map(parseMarkdownWithFrontmatter)
export const connectFields: FieldInfo[] = Object.values(connectDocs).map(parseMarkdownWithFrontmatter)
export const sections: FieldInfo[] = Object.values(sectionDocs).map(parseMarkdownWithFrontmatter)

const allFields = [...transactionFields, ...signDataFields, ...connectFields]

export function getFieldInfo(fieldId: string): FieldInfo | undefined {
  return allFields.find(f => f.id === fieldId)
}

export function getSectionInfo(sectionId: string): FieldInfo | undefined {
  return sections.find(s => s.id === sectionId)
}
