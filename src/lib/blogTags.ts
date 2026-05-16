export type BlogTag = {
    id: string
    label: string
    color: string
}

export const BLOG_TAGS: BlogTag[] = [
    { id: "forza-horizon-5",    label: "Forza Horizon 5",    color: "#60a5fa" },
    { id: "forza-horizon-6",    label: "Forza Horizon 6",    color: "#c084fc" },
    { id: "the-crew-motorfest", label: "The Crew Motorfest", color: "#fb923c" },
    { id: "nfs-unbound",        label: "NFS Unbound",        color: "#f87171" },
    { id: "tips",               label: "Tips & Tricks",      color: "#4ade80" },
    { id: "guide",              label: "Guide",              color: "#facc15" },
    { id: "news",               label: "News",               color: "#94a3b8" },
]

export function getBlogTag(id: string): BlogTag | undefined {
    return BLOG_TAGS.find((t) => t.id === id)
}
