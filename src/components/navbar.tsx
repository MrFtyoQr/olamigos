"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

export default function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const navItems = [
    { name: "Chat", path: "/" },
    { name: "Sopa de Letras", path: "/word-search" },
    { name: "Ejercicio de Código", path: "/code-exercise" },
  ]

  return (
    <nav className="bg-white dark:bg-gray-950 shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image src="/images/logo.png" alt="Logo" width={40} height={40} className="mr-3" />
            <span className="text-xl font-bold text-gray-800 dark:text-white">CodeLearner</span>
          </div>

          <div className="flex items-center space-x-4">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button variant={pathname === item.path ? "default" : "ghost"} className="font-medium">
                  {item.name}
                </Button>
              </Link>
            ))}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

