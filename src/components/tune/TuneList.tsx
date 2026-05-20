import { TuneCard } from "./TuneCard";
import type { Tune } from "@/types";

export function TuneList({ tunes }: { tunes: Tune[] }) {
  if (!tunes.length)
    return <p className="text-muted-foreground">No tunes found.</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tunes.map((tune) => (
        <TuneCard key={tune.id} tune={tune} />
      ))}
    </div>
  );
}
