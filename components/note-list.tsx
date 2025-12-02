"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  subject: {
    name: string
    color: string
  }
}

interface NoteListProps {
  notes: Note[]
  selectedNoteId?: string
}

export function NoteList({ notes, selectedNoteId }: NoteListProps) {
  return (
    <div className="flex flex-col h-full border-r bg-gray-50/50 w-80">
      <div className="p-4 border-b space-y-4 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Notes</h2>
          <Link href="/notes/new">
            <Button size="icon" className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              <span className="sr-only">Nouvelle note</span>
            </Button>
          </Link>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." className="pl-8 bg-gray-50 border-gray-200" />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 p-4 pt-0 mt-4">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/notes/${note.id}`}
              className={cn(
                "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
                selectedNoteId === note.id
                  ? "bg-blue-50 border-blue-200 shadow-sm"
                  : "bg-white border-transparent hover:border-gray-200"
              )}
            >
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-foreground">{note.title}</div>
                    {note.subject && (
                        <div className={`w-2 h-2 rounded-full bg-${note.subject.color}-500`} />
                    )}
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(note.createdAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </div>
                </div>
                <div className="line-clamp-2 text-xs text-muted-foreground">
                  {note.content.substring(0, 100)}
                </div>
                {note.tags.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {note.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0 h-5 bg-gray-100 text-gray-600">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
