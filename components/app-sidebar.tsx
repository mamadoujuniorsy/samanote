import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BookOpen, Home, Plus, Settings, Sparkles, Library, GraduationCap } from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AppSidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      label: "Accueil",
      icon: Home,
      href: "/",
      active: pathname === "/",
    },
    {
      label: "Notes",
      icon: BookOpen,
      href: "/notes",
      active: pathname.startsWith("/notes"),
    },
    {
      label: "Sujets",
      icon: Library,
      href: "/subjects",
      active: pathname.startsWith("/subjects"),
    },
    {
      label: "Quiz",
      icon: GraduationCap,
      href: "/quiz",
      active: pathname.startsWith("/quiz"),
    },
    {
      label: "IA Studio",
      icon: Sparkles,
      href: "/ai/generate",
      active: pathname.startsWith("/ai"),
      color: "text-ai-accent",
    },
  ]

  return (
    <div className={cn("pb-12 w-64 border-r bg-background h-screen flex flex-col", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            SamaNote
          </h2>
          <div className="space-y-1">
            {routes.map((route) => (
              <Link key={route.href} href={route.href}>
                <Button
                  variant={route.active ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    route.active && "bg-blue-50 text-primary hover:bg-blue-100",
                    !route.active && "hover:bg-gray-100",
                    route.color
                  )}
                >
                  <route.icon className={cn("mr-2 h-4 w-4", route.color)} />
                  {route.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-auto p-4 border-t">
        <Button variant="outline" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Paramètres
        </Button>
      </div>
    </div>
  )
}
