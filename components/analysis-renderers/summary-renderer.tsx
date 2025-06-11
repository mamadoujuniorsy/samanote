"use client"

import { Card, CardContent } from "@/components/ui/card"

interface SummaryRendererProps {
  content: string
}

export function SummaryRenderer({ content }: SummaryRendererProps) {
  return (
    <div className="summary-container">
      <Card>
        <CardContent className="pt-6">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function markdownToHtml(markdown: string): string {
  // Conversion simple de Markdown en HTML
  return markdown
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-5 mb-3">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
    .replace(/\n\n/g, "<br/>")
}
