"use client";
export function TuneForm() {
  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          className="mt-1 w-full rounded border px-3 py-2"
          type="text"
          placeholder="Tune title"
        />
      </div>
      <button
        type="submit"
        className="rounded bg-primary px-4 py-2 text-primary-foreground"
      >
        Submit Tune
      </button>
    </form>
  );
}
