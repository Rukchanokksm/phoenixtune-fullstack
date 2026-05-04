interface Props { params: { gameSlug: string } }
export default function GamePage({ params }: Props) {
  return (
    <section className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold capitalize">{params.gameSlug}</h1>
    </section>
  )
}
