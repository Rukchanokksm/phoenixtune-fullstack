"use client"
import Link from "next/link"

interface Props {
    gameSlug: string
    brands: string[] // just make names from DB
    accent?: string
}

export function BrandsGrid({ gameSlug, brands, accent = "#4ade80" }: Props) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))",
                gap: "8px",
            }}
        >
            {brands.map((brand) => (
                <Link
                    key={brand}
                    href={`/games/${gameSlug}/${encodeURIComponent(brand)}`}
                    style={{ textDecoration: "none" }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "11px 14px",
                            background: "#111318",
                            border: "1px solid #1e2130",
                            borderRadius: "9px",
                            cursor: "pointer",
                            transition: "border-color 0.2s,background 0.2s",
                        }}
                        onMouseEnter={(e) => {
                            const el = e.currentTarget as HTMLElement
                            el.style.borderColor = accent + "88"
                            el.style.background = "#13161f"
                        }}
                        onMouseLeave={(e) => {
                            const el = e.currentTarget as HTMLElement
                            el.style.borderColor = "#1e2130"
                            el.style.background = "#111318"
                        }}
                    >
                        <span
                            style={{
                                color: "#cbd5e1",
                                fontSize: "13px",
                                fontWeight: 500,
                            }}
                        >
                            {brand}
                        </span>
                    </div>
                </Link>
            ))}
        </div>
    )
}
