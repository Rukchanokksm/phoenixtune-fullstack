import Link from "next/link"
import type { Game } from "@/types"

export function GameCard({ game }: { game: Game }) {
  return (
    <Link href={`/games/${game.slug}`} className="block rounded-lg border p-4 hover:shadow-md transition-shadow">
      <h3 className="font-semibold">{game.name}</h3>
    </Link>
  )
}
