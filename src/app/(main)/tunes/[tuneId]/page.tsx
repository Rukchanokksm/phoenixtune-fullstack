interface Props { params: { tuneId: string } }
export default function TuneDetailPage({ params }: Props) {
  return (
    <section className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Tune #{params.tuneId}</h1>
    </section>
  )
}
