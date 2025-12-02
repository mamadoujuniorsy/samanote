import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BookOpen, Home, Plus, Settings, Sparkles, Library, GraduationCap, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AppSidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" })
  }

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
    <div className={cn("pb-12 w-64 border-r bg-[#F7F7F5] dark:bg-gray-900 h-screen flex flex-col", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-[#37352F] dark:text-white flex items-center gap-2">
            <div className="w-6 h-6 bg-[#007AFF] rounded flex items-center justify-center text-white text-xs">S</div>
            SamaNote
          </h2>
          <div className="space-y-1">
            {routes.map((route) => (
              <Link key={route.href} href={route.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start font-medium text-[#37352F] dark:text-gray-300",
                    route.active 
                      ? "bg-[#EFEFED] text-[#37352F] dark:bg-gray-800 dark:text-white" 
                      : "hover:bg-[#EFEFED] dark:hover:bg-gray-800",
                    route.color
                  )}
                >
                  <route.icon className={cn("mr-2 h-4 w-4 text-gray-500", route.active && "text-[#37352F]", route.color)} />
                  {route.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-auto p-4 border-t space-y-2">
        <Button variant="ghost" className="w-full justify-start hover:bg-gray-100">
            <Settings className="mr-2 h-4 w-4" />
            Paramètres
        </Button>
        <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
        >
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
        </Button>
      </div>
    </div>
  )
}
