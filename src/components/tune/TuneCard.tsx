import Link from "next/link";
import type { Tune } from "@/types";

export function TuneCard({ tune }: { tune: Tune }) {
  return (
    <div className="rounded-lg border p-4 hover:shadow-md transition-shadow">
      <Link href={`/tunes/${tune.id}`}>
        <h3 className="font-semibold">{tune.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{tune.description}</p>
      </Link>
    </div>
  );
}
