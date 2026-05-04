import type { TuneParameters as TuneParametersType } from "@/types"

export function TuneParameters({ parameters }: { parameters: TuneParametersType }) {
  const rows = Object.entries(parameters).filter(([, v]) => v !== undefined && v !== null)

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b">
          <th className="pb-2 text-left">Parameter</th>
          <th className="pb-2 text-right">Value</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([key, value]) => (
          <tr key={key} className="border-b last:border-0">
            <td className="py-1">{key}</td>
            <td className="py-1 text-right">{String(value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
