import Link from "next/link"
import { SnakeGame } from "@/components/SnakeGame"
import { Button } from "@/components/ui/button"

export default function SnakePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="container mx-auto px-4 py-4 max-w-4xl flex justify-between items-center">
        <h1 className="text-2xl font-bold terminal-text">
          {">"} snake.exe
        </h1>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="hover:bg-accent"
        >
          <Link href="/">back</Link>
        </Button>
      </header>

      <main className="flex-1 flex items-end justify-center pb-8">
        <SnakeGame />
      </main>
    </div>
  )
}


