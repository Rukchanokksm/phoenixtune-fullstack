interface Props { params: { username: string } }
export default function ProfilePage({ params }: Props) {
  return (
    <section className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">@{params.username}</h1>
    </section>
  )
}
