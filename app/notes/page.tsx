"use client"

import { FileText } from "lucide-react"

export default function NotesPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <FileText className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">Aucune note sélectionnée</h3>
      <p className="max-w-sm text-sm">
        Sélectionnez une note dans la liste de gauche pour l'afficher ou créez-en une nouvelle.
      </p>
    </div>
  )
}
