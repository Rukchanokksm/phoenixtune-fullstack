"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AdUnit } from "@/components/ads/AdUnit"

// ─── Game config ─────────────────────────────────────────────────────────────

const GAME_OPTS = [
    {
        slug: "forza-horizon-5",
        name: "Forza Horizon 5",
        short: "FH5",
        accent: "#60a5fa",
        active: true,
        note: null,
    },
    {
        slug: "forza-horizon-6",
        name: "Forza Horizon 6",
        short: "FH6",
        accent: "#c084fc",
        active: true,
        note: "Same parameters as FH5",
    },
    {
        slug: "nfs-unbound",
        name: "NFS Unbound",
        short: "NFS",
        accent: "#f87171",
        active: true,
        note: null,
    },
    {
        slug: "the-crew-motorfest",
        name: "The Crew Motorfest",
        short: "TCM",
        accent: "#fb923c",
        active: true,
        note: null,
    },
]

// For car lookup: FH6 shares FH5 car pool
function carLookupSlug(gameSlug: string) {
    return gameSlug === "forza-horizon-6" ? "forza-horizon-5" : gameSlug
}

type CarBrand = { id: string; name: string }
type CarModel = {
    id: string
    year: number
    model: string
    label: string
    drivetrain: string
}

const CAR_CLASSES = [
    { id: "D", label: "D", color: "#a3e635" },
    { id: "C", label: "C", color: "#facc15" },
    { id: "B", label: "B", color: "#fb923c" },
    { id: "A", label: "A", color: "#f87171" },
    { id: "S1", label: "S1", color: "#c084fc" },
    { id: "S2", label: "S2", color: "#818cf8" },
    { id: "X", label: "X", color: "#60a5fa" },
]

/* ─── Helpers ────────────────────────────────────────────────── */
function clamp(val: string, min: number, max: number, dec: number): string {
    const n = parseFloat(val)
    if (isNaN(n)) return ""
    return Math.max(min, Math.min(max, n)).toFixed(dec)
}

/* ─── Style constants ────────────────────────────────────────── */
const S: Record<string, React.CSSProperties> = {
    card: {
        background: "#131620",
        border: "1px solid #1e2330",
        borderRadius: "16px",
        padding: "28px",
    },
    input: {
        width: "100%",
        padding: "10px 14px",
        borderRadius: "10px",
        background: "#0f1117",
        border: "1px solid #2a2f3f",
        color: "#f1f5f9",
        fontSize: "15px",
        outline: "none",
        boxSizing: "border-box",
    },
    label: {
        fontSize: "12px",
        color: "#64748b",
        fontWeight: 600,
        display: "block",
        marginBottom: "6px",
    },
    row: { display: "flex", gap: "16px", flexWrap: "wrap" },
    sub: { fontSize: "13px", fontWeight: 700, color: "#94a3b8" },
    hint: { fontSize: "11px", color: "#475569", marginLeft: "8px" },
}

/* ─── Sub-components ─────────────────────────────────────────── */
function SectionHeader({
    emoji,
    title,
    dot,
    enabled,
    onToggle,
}: {
    emoji: string
    title: string
    dot: string
    enabled: boolean
    onToggle: () => void
}) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "20px",
            }}
        >
            <span style={{ fontSize: "20px", marginRight: "10px" }}>
                {emoji}
            </span>
            <h3
                style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: 800,
                    color: "#f1f5f9",
                }}
            >
                {title}
            </h3>
            <div
                style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: enabled ? dot : "#374151",
                    margin: "0 10px",
                }}
            />
            <div
                style={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                }}
                onClick={onToggle}
            >
                <span
                    style={{
                        fontSize: "12px",
                        color: enabled ? "#94a3b8" : "#475569",
                    }}
                >
                    {enabled ? "ใส่มาด้วย" : "ไม่ได้ใส่"}
                </span>
                <div
                    style={{
                        width: "40px",
                        height: "22px",
                        borderRadius: "11px",
                        background: enabled ? dot : "#1e2330",
                        border: `1px solid ${enabled ? dot : "#2a2f3f"}`,
                        position: "relative",
                        transition: "all 0.2s",
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            top: "3px",
                            left: enabled ? "21px" : "3px",
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            background: enabled ? "#fff" : "#475569",
                            transition: "left 0.2s",
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

function NumInput({
    label,
    value,
    onChange,
    onBlur,
    min,
    max,
    step = 0.1,
    unit,
    disabled = false,
}: {
    label?: string
    value: string
    onChange: (v: string) => void
    onBlur?: () => void
    min: number
    max: number
    step?: number
    unit?: string
    disabled?: boolean
}) {
    return (
        <div style={{ flex: 1, minWidth: "140px" }}>
            {label && <label style={S.label}>{label}</label>}
            <div style={{ position: "relative" }}>
                <input
                    type="number"
                    step={step}
                    min={min}
                    max={max}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    style={{
                        ...S.input,
                        paddingRight: unit ? "46px" : "14px",
                        opacity: disabled ? 0.35 : 1,
                    }}
                />
                {unit && (
                    <span
                        style={{
                            position: "absolute",
                            right: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: "11px",
                            color: "#475569",
                        }}
                    >
                        {unit}
                    </span>
                )}
            </div>
        </div>
    )
}

function SubToggle({
    label,
    enabled,
    onToggle,
}: {
    label: string
    enabled: boolean
    onToggle: () => void
}) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                fontSize: "12px",
                color: "#64748b",
                marginLeft: "auto",
            }}
            onClick={onToggle}
        >
            <div
                style={{
                    width: "32px",
                    height: "18px",
                    borderRadius: "9px",
                    background: enabled ? "#6366f1" : "#1e2330",
                    border: `1px solid ${enabled ? "#6366f1" : "#2a2f3f"}`,
                    position: "relative",
                    transition: "all 0.2s",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        top: "2px",
                        left: enabled ? "16px" : "2px",
                        width: "14px",
                        height: "14px",
                        borderRadius: "50%",
                        background: enabled ? "#fff" : "#475569",
                        transition: "left 0.2s",
                    }}
                />
            </div>
            <span>{label}</span>
        </div>
    )
}

function Chip({
    label,
    active,
    onClick,
    color,
}: {
    label: string
    active: boolean
    onClick: () => void
    color: string
}) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: "8px 18px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                background: active ? color : "#1a1d24",
                color: active ? "#0d0f14" : color,
                border: `1px solid ${active ? color : color + "44"}`,
            }}
        >
            {label}
        </button>
    )
}

/* ─── Game Picker (Step 0) ───────────────────────────────────── */
function GamePickerStep({ onSelect }: { onSelect: (slug: string) => void }) {
    return (
        <div
            style={{
                maxWidth: "800px",
                margin: "0 auto",
                padding: "40px 24px",
            }}
        >
            <div style={{ marginBottom: "32px" }}>
                <h2
                    style={{
                        margin: "0 0 8px",
                        fontSize: "22px",
                        fontWeight: 900,
                        color: "#f1f5f9",
                    }}
                >
                    เลือกเกมที่ต้องการสร้าง tune
                </h2>
                <p style={{ margin: 0, fontSize: "14px", color: "#475569" }}>
                    แต่ละเกมมีระบบ tune และรายการรถที่แตกต่างกัน
                </p>
            </div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
                    gap: "12px",
                }}
            >
                {GAME_OPTS.map((game) => (
                    <button
                        key={game.slug}
                        onClick={() => onSelect(game.slug)}
                        style={{
                            background: "#131620",
                            border: `1px solid ${game.accent}44`,
                            borderRadius: "12px",
                            padding: "20px 16px",
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                            ;(
                                e.currentTarget as HTMLElement
                            ).style.borderColor = game.accent + "aa"
                        }}
                        onMouseLeave={(e) => {
                            ;(
                                e.currentTarget as HTMLElement
                            ).style.borderColor = game.accent + "44"
                        }}
                    >
                        <div
                            style={{
                                display: "inline-block",
                                fontSize: "10px",
                                fontWeight: 800,
                                letterSpacing: "0.1em",
                                padding: "2px 8px",
                                borderRadius: "5px",
                                background: game.accent + "22",
                                color: game.accent,
                                border: `1px solid ${game.accent}44`,
                                marginBottom: "10px",
                            }}
                        >
                            {game.short}
                        </div>
                        <div
                            style={{
                                fontSize: "14px",
                                fontWeight: 800,
                                color: "#f1f5f9",
                                lineHeight: 1.3,
                                marginBottom: "4px",
                            }}
                        >
                            {game.name}
                        </div>
                        {game.note && (
                            <div style={{ fontSize: "11px", color: "#475569" }}>
                                {game.note}
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}

/* ─── Inner Page (needs useSearchParams) ────────────────────── */
function ShareTunePageInner() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const gameParam = searchParams.get("game") ?? ""

    const [selectedGame, setSelectedGame] = useState(gameParam)
    const gameOpt = GAME_OPTS.find((g) => g.slug === selectedGame)

    function handleSelectGame(slug: string) {
        setSelectedGame(slug)
        // Update URL so back/refresh preserves selection
        router.replace(`/tunes/new?game=${slug}`, { scroll: false })
    }

    // Car data from API
    const [brands, setBrands] = useState<CarBrand[]>([])
    const [modelsByBrand, setModelsByBrand] = useState<
        Record<string, CarModel[]>
    >({})
    const [carsLoading, setCarsLoading] = useState(false)

    useEffect(() => {
        if (!selectedGame) return
        setCarsLoading(true)
        setBrands([])
        setModelsByBrand({})
        fetch(`/api/cars?game=${carLookupSlug(selectedGame)}`)
            .then((r) => r.json())
            .then((data) => {
                setBrands(data.brands ?? [])
                setModelsByBrand(data.modelsByBrand ?? {})
            })
            .catch(console.error)
            .finally(() => setCarsLoading(false))
    }, [selectedGame])

    const [brand, setBrand] = useState("")
    const [modelId, setModelId] = useState("")
    const [carClass, setCarClass] = useState("")
    const carSelected = !!(brand && modelId && carClass)
    // find make name from brand id, then get models
    const selectedBrandName = brands.find((b) => b.id === brand)?.name ?? ""
    const models: CarModel[] = modelsByBrand[selectedBrandName] ?? []

    const [tF, setTF] = useState("")
    const [tR, setTR] = useState("")

    const [gearOn, setGearOn] = useState(false)
    const [gearType, setGearType] = useState<"final" | "full">("final")
    const [gearCount, setGearCount] = useState(6)
    const [gearFinal, setGearFinal] = useState("")
    const [gears, setGears] = useState<string[]>(Array(10).fill(""))
    const setGear = (i: number, v: string) => {
        const g = [...gears]
        g[i] = v
        setGears(g)
    }

    const [alignOn, setAlignOn] = useState(false)
    const [camberOn, setCamberOn] = useState(true)
    const [cF, setCF] = useState("")
    const [cR, setCR] = useState("")
    const [toeOn, setToeOn] = useState(true)
    const [toF, setToF] = useState("")
    const [toR, setToR] = useState("")
    const [castOn, setCastOn] = useState(true)
    const [cast, setCast] = useState("")

    const [arbOn, setArbOn] = useState(false)
    const [aF, setAF] = useState("")
    const [aR, setAR] = useState("")

    const [springOn, setSpringOn] = useState(false)
    const [spF, setSpF] = useState("")
    const [spR, setSpR] = useState("")
    const [rhF, setRhF] = useState("")
    const [rhR, setRhR] = useState("")

    const [dampOn, setDampOn] = useState(false)
    const [rbF, setRbF] = useState("")
    const [rbR, setRbR] = useState("")
    const [buF, setBuF] = useState("")
    const [buR, setBuR] = useState("")

    const [aeroOn, setAeroOn] = useState(false)
    const [arF, setArF] = useState("")
    const [arR, setArR] = useState("")

    const [brakeOn, setBrakeOn] = useState(false)
    const [bBal, setBBal] = useState("50")
    const [bPre, setBPre] = useState("")

    const [diffOn, setDiffOn] = useState(false)

    const [aeroFrontOn, setAeroFrontOn] = useState(true)
    const [aeroRearOn, setAeroRearOn] = useState(true)

    // Tune meta
    const [tuneTitle, setTuneTitle] = useState("")
    const [tuneDesc, setTuneDesc] = useState("")
    const [discipline, setDiscipline] = useState("")
    const [shareCode, setShareCode] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState("")

    // Map carClass chip id -> pi_class enum
    const piClassMap: Record<string, string> = {
        D: "D",
        C: "C",
        B: "B",
        A: "A",
        S1: "S1",
        S2: "S2",
        X: "X",
    }

    async function handleSubmit() {
        if (!discipline) {
            setSubmitError("กรุณาเลือก Discipline")
            return
        }
        if (!tuneTitle.trim()) {
            setSubmitError("กรุณาใส่ชื่อ Tune")
            return
        }
        setSubmitting(true)
        setSubmitError("")

        const selectedModel = models.find((m) => m.id === modelId)
        const selectedBrand = brands.find((b) => b.id === brand)

        const parameters: Record<string, unknown> = {}
        if (tF) parameters.tirePressureF = parseFloat(tF)
        if (tR) parameters.tirePressureR = parseFloat(tR)
        if (springOn) {
            if (spF) parameters.springRateF = parseFloat(spF)
            if (spR) parameters.springRateR = parseFloat(spR)
            if (rhF) parameters.rideHeightF = parseFloat(rhF)
            if (rhR) parameters.rideHeightR = parseFloat(rhR)
        }
        if (dampOn) {
            if (rbF) parameters.reboundF = parseFloat(rbF)
            if (rbR) parameters.reboundR = parseFloat(rbR)
            if (buF) parameters.bumpF = parseFloat(buF)
            if (buR) parameters.bumpR = parseFloat(buR)
        }
        if (alignOn) {
            if (camberOn) {
                if (cF) parameters.camberF = parseFloat(cF)
                if (cR) parameters.camberR = parseFloat(cR)
            }
            if (toeOn) {
                if (toF) parameters.toeF = parseFloat(toF)
                if (toR) parameters.toeR = parseFloat(toR)
            }
            if (castOn && cast) parameters.caster = parseFloat(cast)
        }
        if (arbOn) {
            if (aF) parameters.arbF = parseFloat(aF)
            if (aR) parameters.arbR = parseFloat(aR)
        }
        if (diffOn) {
            if (diffType === "AWD") {
                if (dFrontAccel)
                    parameters.diffFrontAccel = parseFloat(dFrontAccel)
                if (dFrontDecel)
                    parameters.diffFrontDecel = parseFloat(dFrontDecel)
                if (dRearAccel)
                    parameters.diffRearAccel = parseFloat(dRearAccel)
                if (dRearDecel)
                    parameters.diffRearDecel = parseFloat(dRearDecel)
                if (dCenter) parameters.diffCenter = parseFloat(dCenter)
            } else {
                if (dAccel) parameters.diffAccel = parseFloat(dAccel)
                if (dDecel) parameters.diffDecel = parseFloat(dDecel)
            }
        }
        if (aeroOn) {
            if (aeroFrontOn && arF) parameters.aeroF = parseFloat(arF)
            if (aeroRearOn && arR) parameters.aeroR = parseFloat(arR)
        }
        if (brakeOn) {
            parameters.brakeBias = parseFloat(bBal)
            if (bPre) parameters.brakePressure = parseFloat(bPre)
        }
        if (gearOn) {
            if (gearFinal) parameters.finalDrive = parseFloat(gearFinal)
            if (gearType === "full") {
                gears.slice(0, gearCount).forEach((v, i) => {
                    if (v) parameters["gear" + (i + 1)] = parseFloat(v)
                })
            }
        }

        if (Object.keys(parameters).length === 0) {
            setSubmitError(
                "กรุณากรอกค่า tune อย่างน้อย 1 ค่า (เช่น ความดันยาง หรือ ค่า suspension)",
            )
            setSubmitting(false)
            return
        }

        try {
            const res = await fetch("/api/tunes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: tuneTitle.trim(),
                    discipline,
                    description: tuneDesc.trim() || undefined,
                    shareCode: shareCode.trim() || undefined,
                    parameters,
                    gameSlug: selectedGame,
                    carMake: selectedBrand?.name ?? brand,
                    carModel: selectedModel?.model ?? modelId,
                    carYear: selectedModel?.year,
                    piClass: piClassMap[carClass] ?? "A",
                    drivetrain: diffOn
                        ? diffType
                        : (models.find((m) => m.id === modelId)?.drivetrain ??
                          "RWD"),
                }),
            })
            const json = await res.json()
            if (!res.ok) {
                setSubmitError(json.error ?? "เกิดข้อผิดพลาด")
                return
            }
            const gameSlug = json.game?.slug ?? "forza-horizon-5"
            const carMake = json.car?.make ?? selectedBrand?.name ?? brand
            const carUUID = json.car?.id ?? ""
            router.push(
                `/games/${gameSlug}/${encodeURIComponent(carMake)}/${carUUID}`,
            )
        } catch {
            setSubmitError("เกิดข้อผิดพลาด กรุณาลองใหม่")
        } finally {
            setSubmitting(false)
        }
    }
    const [diffType, setDiffType] = useState<"AWD" | "RWD" | "FWD">("RWD")
    // RWD / FWD
    const [dAccel, setDAccel] = useState("")
    const [dDecel, setDDecel] = useState("")
    // AWD only
    const [dFrontAccel, setDFrontAccel] = useState("")
    const [dFrontDecel, setDFrontDecel] = useState("")
    const [dRearAccel, setDRearAccel] = useState("")
    const [dRearDecel, setDRearDecel] = useState("")
    const [dCenter, setDCenter] = useState("")

    return (
        <div
            style={{
                background: "#0d0f14",
                minHeight: "100vh",
                color: "#e2e8f0",
            }}
        >
            <div
                style={{
                    borderBottom: "1px solid #1e2330",
                    background: "#0f1117",
                }}
            >
                <div
                    style={{
                        maxWidth: "800px",
                        margin: "0 auto",
                        padding: "20px 24px",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        flexWrap: "wrap",
                    }}
                >
                    <button
                        onClick={() => router.back()}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#64748b",
                            fontSize: "13px",
                            cursor: "pointer",
                            padding: 0,
                        }}
                    >
                        ← กลับ
                    </button>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: "22px",
                            fontWeight: 900,
                            color: "#f1f5f9",
                        }}
                    >
                        Share Your Tune
                    </h1>
                    {gameOpt && (
                        <span
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "11px",
                                fontWeight: 800,
                                letterSpacing: "0.08em",
                                padding: "3px 10px",
                                borderRadius: "6px",
                                background: gameOpt.accent + "22",
                                color: gameOpt.accent,
                                border: `1px solid ${gameOpt.accent}44`,
                            }}
                        >
                            {gameOpt.short} · {gameOpt.name}
                        </span>
                    )}
                    {selectedGame && (
                        <button
                            onClick={() => {
                                setSelectedGame("")
                                router.replace("/tunes/new", { scroll: false })
                            }}
                            style={{
                                marginLeft: "auto",
                                background: "none",
                                border: "none",
                                color: "#475569",
                                fontSize: "12px",
                                cursor: "pointer",
                                padding: 0,
                            }}
                        >
                            เปลี่ยนเกม
                        </button>
                    )}
                    {!selectedGame && (
                        <span
                            style={{
                                marginLeft: "auto",
                                fontSize: "12px",
                                color: "#475569",
                            }}
                        >
                            แบ่งปัน tune setup ของคุณให้กับชุมชน
                        </span>
                    )}
                </div>
            </div>

            {/* Step 0 — Game selection */}
            {!selectedGame && <GamePickerStep onSelect={handleSelectGame} />}

            {selectedGame && (
                <div
                    style={{
                        maxWidth: "800px",
                        margin: "0 auto",
                        padding: "32px 24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                    }}
                >
                    <AdUnit slot="tunes-new-top" format="horizontal" />

                    {/* Car Selection */}
                    <div style={S.card}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                marginBottom: "20px",
                            }}
                        >
                            <span style={{ fontSize: "20px" }}>🚗</span>
                            <h3
                                style={{
                                    margin: 0,
                                    fontSize: "16px",
                                    fontWeight: 800,
                                    color: "#f1f5f9",
                                }}
                            >
                                เลือกรถ
                            </h3>
                        </div>
                        <div style={S.row}>
                            <div style={{ flex: 1, minWidth: "180px" }}>
                                <label style={S.label}>Brand</label>
                                <select
                                    value={brand}
                                    onChange={(e) => {
                                        setBrand(e.target.value)
                                        setModelId("")
                                    }}
                                    style={{ ...S.input, cursor: "pointer" }}
                                    disabled={carsLoading}
                                >
                                    <option value="">
                                        {carsLoading
                                            ? "⏳ กำลังโหลด..."
                                            : "-- เลือก Brand --"}
                                    </option>
                                    {brands.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ flex: 2, minWidth: "220px" }}>
                                <label style={S.label}>รุ่น</label>
                                <select
                                    value={modelId}
                                    onChange={(e) => setModelId(e.target.value)}
                                    disabled={!brand || carsLoading}
                                    style={{
                                        ...S.input,
                                        cursor: brand
                                            ? "pointer"
                                            : "not-allowed",
                                        opacity: brand ? 1 : 0.4,
                                    }}
                                >
                                    <option value="">-- เลือกรุ่น --</option>
                                    {models.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div
                            style={{
                                marginTop: "20px",
                                paddingTop: "20px",
                                borderTop: "1px solid #1e2330",
                            }}
                        >
                            <label style={{ ...S.label, marginBottom: "12px" }}>
                                Class / PI
                            </label>
                            <div
                                style={{
                                    display: "flex",
                                    gap: "8px",
                                    flexWrap: "wrap",
                                }}
                            >
                                {CAR_CLASSES.map((cls) => {
                                    const active = carClass === cls.id
                                    return (
                                        <button
                                            key={cls.id}
                                            onClick={() =>
                                                setCarClass(
                                                    active ? "" : cls.id,
                                                )
                                            }
                                            style={{
                                                padding: "8px 18px",
                                                borderRadius: "8px",
                                                fontSize: "14px",
                                                fontWeight: 800,
                                                cursor: "pointer",
                                                transition: "all 0.15s",
                                                background: active
                                                    ? cls.color
                                                    : "#0f1117",
                                                color: active
                                                    ? "#0d0f14"
                                                    : cls.color,
                                                border: `1.5px solid ${active ? cls.color : cls.color + "44"}`,
                                                boxShadow: active
                                                    ? `0 0 12px ${cls.color}55`
                                                    : "none",
                                            }}
                                        >
                                            {cls.label}
                                        </button>
                                    )
                                })}
                            </div>
                            {!carClass && brand && modelId && (
                                <p
                                    style={{
                                        margin: "10px 0 0",
                                        fontSize: "12px",
                                        color: "#f87171",
                                    }}
                                >
                                    ⚠ กรุณาเลือก Class ก่อน
                                </p>
                            )}
                        </div>
                    </div>

                    {carSelected && (
                        <>
                            {/* Tires */}
                            <div style={S.card}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        marginBottom: "20px",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: "20px",
                                            marginRight: "10px",
                                        }}
                                    >
                                        🔴
                                    </span>
                                    <h3
                                        style={{
                                            margin: 0,
                                            fontSize: "16px",
                                            fontWeight: 800,
                                            color: "#f1f5f9",
                                        }}
                                    >
                                        Tires
                                    </h3>
                                    <div
                                        style={{
                                            width: "6px",
                                            height: "6px",
                                            borderRadius: "50%",
                                            background: "#60a5fa",
                                            margin: "0 10px",
                                        }}
                                    />
                                    <span
                                        style={{
                                            marginLeft: "auto",
                                            fontSize: "12px",
                                            color: "#475569",
                                        }}
                                    >
                                        หน่วย: bar (1.0 – 3.8)
                                    </span>
                                </div>
                                <div style={S.row}>
                                    <NumInput
                                        label="Front"
                                        value={tF}
                                        unit="bar"
                                        min={1.0}
                                        max={3.8}
                                        step={0.1}
                                        onChange={setTF}
                                        onBlur={() =>
                                            setTF(clamp(tF, 1.0, 3.8, 1))
                                        }
                                    />
                                    <NumInput
                                        label="Rear"
                                        value={tR}
                                        unit="bar"
                                        min={1.0}
                                        max={3.8}
                                        step={0.1}
                                        onChange={setTR}
                                        onBlur={() =>
                                            setTR(clamp(tR, 1.0, 3.8, 1))
                                        }
                                    />
                                </div>
                            </div>

                            {/* Gearing */}
                            <div style={S.card}>
                                <SectionHeader
                                    emoji="⚙️"
                                    title="Gearing"
                                    dot="#f59e0b"
                                    enabled={gearOn}
                                    onToggle={() => setGearOn((p) => !p)}
                                />
                                {gearOn && (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "20px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: "10px",
                                            }}
                                        >
                                            <Chip
                                                label="Final Drive Only"
                                                active={gearType === "final"}
                                                color="#f59e0b"
                                                onClick={() =>
                                                    setGearType("final")
                                                }
                                            />
                                            <Chip
                                                label="Full Gearing"
                                                active={gearType === "full"}
                                                color="#f59e0b"
                                                onClick={() =>
                                                    setGearType("full")
                                                }
                                            />
                                        </div>
                                        <div style={{ maxWidth: "200px" }}>
                                            <NumInput
                                                label="Final Drive  (0.00 – 6.10)"
                                                value={gearFinal}
                                                min={0}
                                                max={6.1}
                                                step={0.01}
                                                onChange={setGearFinal}
                                                onBlur={() =>
                                                    setGearFinal(
                                                        clamp(
                                                            gearFinal,
                                                            0,
                                                            6.1,
                                                            2,
                                                        ),
                                                    )
                                                }
                                            />
                                        </div>
                                        {gearType === "full" && (
                                            <>
                                                <div>
                                                    <label style={S.label}>
                                                        จำนวนเกียร์
                                                    </label>
                                                    <select
                                                        value={gearCount}
                                                        onChange={(e) =>
                                                            setGearCount(
                                                                parseInt(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        style={{
                                                            ...S.input,
                                                            width: "auto",
                                                            minWidth: "130px",
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        {Array.from(
                                                            { length: 9 },
                                                            (_, i) => i + 2,
                                                        ).map((n) => (
                                                            <option
                                                                key={n}
                                                                value={n}
                                                            >
                                                                {n} speed
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        flexWrap: "wrap",
                                                        gap: "12px",
                                                    }}
                                                >
                                                    {Array.from(
                                                        { length: gearCount },
                                                        (_, i) => i,
                                                    ).map((i) => (
                                                        <div
                                                            key={i}
                                                            style={{
                                                                flex: "0 0 calc(25% - 9px)",
                                                                minWidth:
                                                                    "100px",
                                                            }}
                                                        >
                                                            <NumInput
                                                                label={`Gear ${i + 1}  (0.00–6.00)`}
                                                                value={gears[i]}
                                                                min={0}
                                                                max={6.0}
                                                                step={0.01}
                                                                onChange={(v) =>
                                                                    setGear(
                                                                        i,
                                                                        v,
                                                                    )
                                                                }
                                                                onBlur={() =>
                                                                    setGear(
                                                                        i,
                                                                        clamp(
                                                                            gears[
                                                                                i
                                                                            ],
                                                                            0,
                                                                            6.0,
                                                                            2,
                                                                        ),
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Alignment */}
                            <div style={S.card}>
                                <SectionHeader
                                    emoji="📐"
                                    title="Alignment"
                                    dot="#a78bfa"
                                    enabled={alignOn}
                                    onToggle={() => setAlignOn((p) => !p)}
                                />
                                {alignOn && (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "24px",
                                        }}
                                    >
                                        <div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    marginBottom: "12px",
                                                }}
                                            >
                                                <span style={S.sub}>
                                                    Camber
                                                </span>
                                                <span style={S.hint}>
                                                    (°) −5.0 ~ 5.0
                                                </span>
                                                <SubToggle
                                                    label="ใส่มาด้วย"
                                                    enabled={camberOn}
                                                    onToggle={() =>
                                                        setCamberOn((p) => !p)
                                                    }
                                                />
                                            </div>
                                            <div style={S.row}>
                                                <NumInput
                                                    label="Front"
                                                    value={cF}
                                                    unit="°"
                                                    min={-5}
                                                    max={5}
                                                    step={0.1}
                                                    disabled={!camberOn}
                                                    onChange={setCF}
                                                    onBlur={() =>
                                                        setCF(
                                                            clamp(cF, -5, 5, 1),
                                                        )
                                                    }
                                                />
                                                <NumInput
                                                    label="Rear"
                                                    value={cR}
                                                    unit="°"
                                                    min={-5}
                                                    max={5}
                                                    step={0.1}
                                                    disabled={!camberOn}
                                                    onChange={setCR}
                                                    onBlur={() =>
                                                        setCR(
                                                            clamp(cR, -5, 5, 1),
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    marginBottom: "12px",
                                                }}
                                            >
                                                <span style={S.sub}>Toe</span>
                                                <span style={S.hint}>
                                                    (°) −5.0 ~ 5.0
                                                </span>
                                                <SubToggle
                                                    label="ใส่มาด้วย"
                                                    enabled={toeOn}
                                                    onToggle={() =>
                                                        setToeOn((p) => !p)
                                                    }
                                                />
                                            </div>
                                            <div style={S.row}>
                                                <NumInput
                                                    label="Front"
                                                    value={toF}
                                                    unit="°"
                                                    min={-5}
                                                    max={5}
                                                    step={0.1}
                                                    disabled={!toeOn}
                                                    onChange={setToF}
                                                    onBlur={() =>
                                                        setToF(
                                                            clamp(
                                                                toF,
                                                                -5,
                                                                5,
                                                                1,
                                                            ),
                                                        )
                                                    }
                                                />
                                                <NumInput
                                                    label="Rear"
                                                    value={toR}
                                                    unit="°"
                                                    min={-5}
                                                    max={5}
                                                    step={0.1}
                                                    disabled={!toeOn}
                                                    onChange={setToR}
                                                    onBlur={() =>
                                                        setToR(
                                                            clamp(
                                                                toR,
                                                                -5,
                                                                5,
                                                                1,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    marginBottom: "12px",
                                                }}
                                            >
                                                <span style={S.sub}>
                                                    Front Caster
                                                </span>
                                                <span style={S.hint}>
                                                    (°) 1.0 ~ 7.0
                                                </span>
                                                <SubToggle
                                                    label="ใส่มาด้วย"
                                                    enabled={castOn}
                                                    onToggle={() =>
                                                        setCastOn((p) => !p)
                                                    }
                                                />
                                            </div>
                                            <div style={{ maxWidth: "200px" }}>
                                                <NumInput
                                                    value={cast}
                                                    unit="°"
                                                    min={1}
                                                    max={7}
                                                    step={0.1}
                                                    disabled={!castOn}
                                                    onChange={setCast}
                                                    onBlur={() =>
                                                        setCast(
                                                            clamp(
                                                                cast,
                                                                1,
                                                                7,
                                                                1,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Anti-Roll Bars */}
                            <div style={S.card}>
                                <SectionHeader
                                    emoji="🔧"
                                    title="Anti-Roll Bars"
                                    dot="#38bdf8"
                                    enabled={arbOn}
                                    onToggle={() => setArbOn((p) => !p)}
                                />
                                {arbOn && (
                                    <div style={S.row}>
                                        <NumInput
                                            label="Front  (1 – 65)"
                                            value={aF}
                                            min={1}
                                            max={65}
                                            step={0.01}
                                            onChange={setAF}
                                            onBlur={() =>
                                                setAF(clamp(aF, 1, 65, 2))
                                            }
                                        />
                                        <NumInput
                                            label="Rear  (1 – 65)"
                                            value={aR}
                                            min={1}
                                            max={65}
                                            step={0.01}
                                            onChange={setAR}
                                            onBlur={() =>
                                                setAR(clamp(aR, 1, 65, 2))
                                            }
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Springs & Ride Height */}
                            <div style={S.card}>
                                <SectionHeader
                                    emoji="🌀"
                                    title="Springs & Ride Height"
                                    dot="#fb923c"
                                    enabled={springOn}
                                    onToggle={() => setSpringOn((p) => !p)}
                                />
                                {springOn && (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "24px",
                                        }}
                                    >
                                        <div>
                                            <div
                                                style={{ marginBottom: "12px" }}
                                            >
                                                <span style={S.sub}>
                                                    Spring Rate
                                                </span>
                                                <span style={S.hint}>
                                                    N/MM (0 – 9999.9)
                                                </span>
                                            </div>
                                            <div style={S.row}>
                                                <NumInput
                                                    label="Front"
                                                    value={spF}
                                                    unit="N/MM"
                                                    min={0}
                                                    max={9999.9}
                                                    step={0.1}
                                                    onChange={setSpF}
                                                    onBlur={() =>
                                                        setSpF(
                                                            clamp(
                                                                spF,
                                                                0,
                                                                9999.9,
                                                                1,
                                                            ),
                                                        )
                                                    }
                                                />
                                                <NumInput
                                                    label="Rear"
                                                    value={spR}
                                                    unit="N/MM"
                                                    min={0}
                                                    max={9999.9}
                                                    step={0.1}
                                                    onChange={setSpR}
                                                    onBlur={() =>
                                                        setSpR(
                                                            clamp(
                                                                spR,
                                                                0,
                                                                9999.9,
                                                                1,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div
                                                style={{ marginBottom: "12px" }}
                                            >
                                                <span style={S.sub}>
                                                    Ride Height
                                                </span>
                                                <span style={S.hint}>
                                                    CM (0 – 99.9)
                                                </span>
                                            </div>
                                            <div style={S.row}>
                                                <NumInput
                                                    label="Front"
                                                    value={rhF}
                                                    unit="CM"
                                                    min={0}
                                                    max={99.9}
                                                    step={0.1}
                                                    onChange={setRhF}
                                                    onBlur={() =>
                                                        setRhF(
                                                            clamp(
                                                                rhF,
                                                                0,
                                                                99.9,
                                                                1,
                                                            ),
                                                        )
                                                    }
                                                />
                                                <NumInput
                                                    label="Rear"
                                                    value={rhR}
                                                    unit="CM"
                                                    min={0}
                                                    max={99.9}
                                                    step={0.1}
                                                    onChange={setRhR}
                                                    onBlur={() =>
                                                        setRhR(
                                                            clamp(
                                                                rhR,
                                                                0,
                                                                99.9,
                                                                1,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Damping */}
                            <div style={S.card}>
                                <SectionHeader
                                    emoji="💧"
                                    title="Damping"
                                    dot="#c084fc"
                                    enabled={dampOn}
                                    onToggle={() => setDampOn((p) => !p)}
                                />
                                {dampOn && (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "24px",
                                        }}
                                    >
                                        {(
                                            [
                                                [
                                                    "Rebound Stiffness",
                                                    rbF,
                                                    setRbF,
                                                    rbR,
                                                    setRbR,
                                                ],
                                                [
                                                    "Bump Stiffness",
                                                    buF,
                                                    setBuF,
                                                    buR,
                                                    setBuR,
                                                ],
                                            ] as const
                                        ).map(([title, fv, fs, rv, rs]) => (
                                            <div key={title}>
                                                <div
                                                    style={{
                                                        marginBottom: "12px",
                                                    }}
                                                >
                                                    <span style={S.sub}>
                                                        {title}
                                                    </span>
                                                    <span style={S.hint}>
                                                        1.0 – 20.0
                                                    </span>
                                                </div>
                                                <div style={S.row}>
                                                    <NumInput
                                                        label="Front"
                                                        value={fv}
                                                        min={1}
                                                        max={20}
                                                        step={0.1}
                                                        onChange={(v) => fs(v)}
                                                        onBlur={() =>
                                                            fs(
                                                                clamp(
                                                                    fv,
                                                                    1,
                                                                    20,
                                                                    1,
                                                                ),
                                                            )
                                                        }
                                                    />
                                                    <NumInput
                                                        label="Rear"
                                                        value={rv}
                                                        min={1}
                                                        max={20}
                                                        step={0.1}
                                                        onChange={(v) => rs(v)}
                                                        onBlur={() =>
                                                            rs(
                                                                clamp(
                                                                    rv,
                                                                    1,
                                                                    20,
                                                                    1,
                                                                ),
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Aero */}
                            <div style={S.card}>
                                <SectionHeader
                                    emoji="💨"
                                    title="Aero — Downforce"
                                    dot="#34d399"
                                    enabled={aeroOn}
                                    onToggle={() => setAeroOn((p) => !p)}
                                />
                                {aeroOn && (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "20px",
                                        }}
                                    >
                                        {/* Front */}
                                        <div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    marginBottom: "12px",
                                                }}
                                            >
                                                <span style={S.sub}>
                                                    Front Downforce
                                                </span>
                                                <span style={S.hint}>
                                                    (0 – 999)
                                                </span>
                                                <SubToggle
                                                    label="ใส่มาด้วย"
                                                    enabled={aeroFrontOn}
                                                    onToggle={() =>
                                                        setAeroFrontOn(
                                                            (p) => !p,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div style={{ maxWidth: "200px" }}>
                                                <NumInput
                                                    value={arF}
                                                    unit="df"
                                                    min={0}
                                                    max={999}
                                                    step={1}
                                                    disabled={!aeroFrontOn}
                                                    onChange={setArF}
                                                    onBlur={() =>
                                                        setArF(
                                                            clamp(
                                                                arF,
                                                                0,
                                                                999,
                                                                0,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                        {/* Rear */}
                                        <div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    marginBottom: "12px",
                                                }}
                                            >
                                                <span style={S.sub}>
                                                    Rear Downforce
                                                </span>
                                                <span style={S.hint}>
                                                    (0 – 999)
                                                </span>
                                                <SubToggle
                                                    label="ใส่มาด้วย"
                                                    enabled={aeroRearOn}
                                                    onToggle={() =>
                                                        setAeroRearOn((p) => !p)
                                                    }
                                                />
                                            </div>
                                            <div style={{ maxWidth: "200px" }}>
                                                <NumInput
                                                    value={arR}
                                                    unit="df"
                                                    min={0}
                                                    max={999}
                                                    step={1}
                                                    disabled={!aeroRearOn}
                                                    onChange={setArR}
                                                    onBlur={() =>
                                                        setArR(
                                                            clamp(
                                                                arR,
                                                                0,
                                                                999,
                                                                0,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Brake */}
                            <div style={S.card}>
                                <SectionHeader
                                    emoji="🛑"
                                    title="Brake"
                                    dot="#f87171"
                                    enabled={brakeOn}
                                    onToggle={() => setBrakeOn((p) => !p)}
                                />
                                {brakeOn && (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "24px",
                                        }}
                                    >
                                        <div>
                                            <div
                                                style={{ marginBottom: "12px" }}
                                            >
                                                <span style={S.sub}>
                                                    Braking Balance
                                                </span>
                                                <span style={S.hint}>
                                                    0 = Full Front → 100 = Full
                                                    Rear
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    maxWidth: "300px",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: "8px",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "10px",
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontSize: "11px",
                                                            color: "#60a5fa",
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        F
                                                    </span>
                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={100}
                                                        value={bBal}
                                                        onChange={(e) =>
                                                            setBBal(
                                                                e.target.value,
                                                            )
                                                        }
                                                        style={{
                                                            flex: 1,
                                                            accentColor:
                                                                "#f87171",
                                                        }}
                                                    />
                                                    <span
                                                        style={{
                                                            fontSize: "11px",
                                                            color: "#f87171",
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        R
                                                    </span>
                                                </div>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "8px",
                                                    }}
                                                >
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        step={1}
                                                        value={bBal}
                                                        onChange={(e) =>
                                                            setBBal(
                                                                e.target.value,
                                                            )
                                                        }
                                                        onBlur={() =>
                                                            setBBal(
                                                                clamp(
                                                                    bBal,
                                                                    0,
                                                                    100,
                                                                    0,
                                                                ),
                                                            )
                                                        }
                                                        style={{
                                                            ...S.input,
                                                            width: "80px",
                                                            textAlign: "center",
                                                        }}
                                                    />
                                                    <span
                                                        style={{
                                                            fontSize: "13px",
                                                            color: "#475569",
                                                        }}
                                                    >
                                                        %
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontSize: "12px",
                                                            color: "#374151",
                                                            marginLeft: "4px",
                                                        }}
                                                    >
                                                        {parseInt(bBal) <= 50
                                                            ? "← Front biased"
                                                            : "Rear biased →"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div
                                                style={{ marginBottom: "12px" }}
                                            >
                                                <span style={S.sub}>
                                                    Braking Pressure
                                                </span>
                                                <span style={S.hint}>
                                                    % (0 – 200)
                                                </span>
                                            </div>
                                            <div style={{ maxWidth: "160px" }}>
                                                <NumInput
                                                    value={bPre}
                                                    unit="%"
                                                    min={0}
                                                    max={200}
                                                    step={1}
                                                    onChange={setBPre}
                                                    onBlur={() =>
                                                        setBPre(
                                                            clamp(
                                                                bPre,
                                                                0,
                                                                200,
                                                                0,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Differential */}
                            <div style={S.card}>
                                <SectionHeader
                                    emoji="🔩"
                                    title="Differential"
                                    dot="#fbbf24"
                                    enabled={diffOn}
                                    onToggle={() => setDiffOn((p) => !p)}
                                />
                                {diffOn && (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "24px",
                                        }}
                                    >
                                        {/* Drivetrain selector */}
                                        <div>
                                            <label style={S.label}>
                                                Drivetrain
                                            </label>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "10px",
                                                }}
                                            >
                                                {(
                                                    [
                                                        "AWD",
                                                        "RWD",
                                                        "FWD",
                                                    ] as const
                                                ).map((t) => (
                                                    <Chip
                                                        key={t}
                                                        label={t}
                                                        active={diffType === t}
                                                        color="#fbbf24"
                                                        onClick={() =>
                                                            setDiffType(t)
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* RWD / FWD — 2 fields */}
                                        {diffType !== "AWD" && (
                                            <div>
                                                <div
                                                    style={{
                                                        marginBottom: "12px",
                                                    }}
                                                >
                                                    <span style={S.sub}>
                                                        {diffType} Differential
                                                    </span>
                                                    <span style={S.hint}>
                                                        0 – 100 %
                                                    </span>
                                                </div>
                                                <div style={S.row}>
                                                    <NumInput
                                                        label="Acceleration"
                                                        value={dAccel}
                                                        unit="%"
                                                        min={0}
                                                        max={100}
                                                        step={1}
                                                        onChange={setDAccel}
                                                        onBlur={() =>
                                                            setDAccel(
                                                                clamp(
                                                                    dAccel,
                                                                    0,
                                                                    100,
                                                                    0,
                                                                ),
                                                            )
                                                        }
                                                    />
                                                    <NumInput
                                                        label="Deceleration"
                                                        value={dDecel}
                                                        unit="%"
                                                        min={0}
                                                        max={100}
                                                        step={1}
                                                        onChange={setDDecel}
                                                        onBlur={() =>
                                                            setDDecel(
                                                                clamp(
                                                                    dDecel,
                                                                    0,
                                                                    100,
                                                                    0,
                                                                ),
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* AWD — 5 fields: Front, Rear, Center */}
                                        {diffType === "AWD" && (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: "20px",
                                                }}
                                            >
                                                {/* Front diff */}
                                                <div>
                                                    <div
                                                        style={{
                                                            marginBottom:
                                                                "12px",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                ...S.sub,
                                                                color: "#60a5fa",
                                                            }}
                                                        >
                                                            Front Differential
                                                        </span>
                                                        <span style={S.hint}>
                                                            0 – 100 %
                                                        </span>
                                                    </div>
                                                    <div style={S.row}>
                                                        <NumInput
                                                            label="Acceleration"
                                                            value={dFrontAccel}
                                                            unit="%"
                                                            min={0}
                                                            max={100}
                                                            step={1}
                                                            onChange={
                                                                setDFrontAccel
                                                            }
                                                            onBlur={() =>
                                                                setDFrontAccel(
                                                                    clamp(
                                                                        dFrontAccel,
                                                                        0,
                                                                        100,
                                                                        0,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                        <NumInput
                                                            label="Deceleration"
                                                            value={dFrontDecel}
                                                            unit="%"
                                                            min={0}
                                                            max={100}
                                                            step={1}
                                                            onChange={
                                                                setDFrontDecel
                                                            }
                                                            onBlur={() =>
                                                                setDFrontDecel(
                                                                    clamp(
                                                                        dFrontDecel,
                                                                        0,
                                                                        100,
                                                                        0,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                {/* Rear diff */}
                                                <div>
                                                    <div
                                                        style={{
                                                            marginBottom:
                                                                "12px",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                ...S.sub,
                                                                color: "#fb923c",
                                                            }}
                                                        >
                                                            Rear Differential
                                                        </span>
                                                        <span style={S.hint}>
                                                            0 – 100 %
                                                        </span>
                                                    </div>
                                                    <div style={S.row}>
                                                        <NumInput
                                                            label="Acceleration"
                                                            value={dRearAccel}
                                                            unit="%"
                                                            min={0}
                                                            max={100}
                                                            step={1}
                                                            onChange={
                                                                setDRearAccel
                                                            }
                                                            onBlur={() =>
                                                                setDRearAccel(
                                                                    clamp(
                                                                        dRearAccel,
                                                                        0,
                                                                        100,
                                                                        0,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                        <NumInput
                                                            label="Deceleration"
                                                            value={dRearDecel}
                                                            unit="%"
                                                            min={0}
                                                            max={100}
                                                            step={1}
                                                            onChange={
                                                                setDRearDecel
                                                            }
                                                            onBlur={() =>
                                                                setDRearDecel(
                                                                    clamp(
                                                                        dRearDecel,
                                                                        0,
                                                                        100,
                                                                        0,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                {/* Center balance */}
                                                <div>
                                                    <div
                                                        style={{
                                                            marginBottom:
                                                                "12px",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                ...S.sub,
                                                                color: "#c084fc",
                                                            }}
                                                        >
                                                            Center Balance
                                                        </span>
                                                        <span style={S.hint}>
                                                            0 = Full Front · 100
                                                            = Full Rear
                                                        </span>
                                                    </div>
                                                    <div
                                                        style={{
                                                            maxWidth: "200px",
                                                        }}
                                                    >
                                                        <NumInput
                                                            value={dCenter}
                                                            unit="%"
                                                            min={0}
                                                            max={100}
                                                            step={1}
                                                            onChange={
                                                                setDCenter
                                                            }
                                                            onBlur={() =>
                                                                setDCenter(
                                                                    clamp(
                                                                        dCenter,
                                                                        0,
                                                                        100,
                                                                        0,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Upgrades */}
                            <div style={S.card}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        marginBottom: "8px",
                                    }}
                                >
                                    <span style={{ fontSize: "20px" }}>🔩</span>
                                    <h3
                                        style={{
                                            margin: 0,
                                            fontSize: "16px",
                                            fontWeight: 800,
                                            color: "#f1f5f9",
                                        }}
                                    >
                                        Upgrades
                                    </h3>
                                    <span
                                        style={{
                                            fontSize: "12px",
                                            color: "#475569",
                                            marginLeft: "4px",
                                        }}
                                    >
                                        optional — บอกว่าใส่ของแต่งอะไรมาบ้าง
                                    </span>
                                </div>
                                <p
                                    style={{
                                        margin: "0 0 16px",
                                        fontSize: "13px",
                                        color: "#475569",
                                    }}
                                >
                                    ระบุ upgrade ที่ใช้ใน tune นี้
                                    (รายละเอียดเร็วๆ นี้)
                                </p>
                                <div
                                    style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: "10px",
                                    }}
                                >
                                    {[
                                        "Engine",
                                        "Platform & Handling",
                                        "Drivetrain",
                                        "Tires",
                                        "Aero & Appearance",
                                        "Conversion",
                                    ].map((cat) => (
                                        <div
                                            key={cat}
                                            style={{
                                                padding: "10px 16px",
                                                borderRadius: "10px",
                                                background: "#0f1117",
                                                border: "1px solid #1e2330",
                                                fontSize: "13px",
                                                color: "#475569",
                                                fontWeight: 600,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                            }}
                                        >
                                            {cat}
                                            <span
                                                style={{
                                                    fontSize: "10px",
                                                    color: "#2a2f3f",
                                                    background: "#1a1d24",
                                                    padding: "2px 7px",
                                                    borderRadius: "6px",
                                                }}
                                            >
                                                เร็วๆ นี้
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tune Info */}
                            <div style={S.card}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        marginBottom: "20px",
                                    }}
                                >
                                    <span style={{ fontSize: "20px" }}>📝</span>
                                    <h3
                                        style={{
                                            margin: 0,
                                            fontSize: "16px",
                                            fontWeight: 800,
                                            color: "#f1f5f9",
                                        }}
                                    >
                                        ข้อมูล Tune
                                    </h3>
                                </div>

                                {/* Discipline */}
                                <div style={{ marginBottom: "20px" }}>
                                    <label style={S.label}>Discipline *</label>
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "8px",
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        {(
                                            [
                                                "street",
                                                "track",
                                                "drift",
                                                "rally",
                                                "offroad",
                                                "drag",
                                            ] as const
                                        ).map((d) => {
                                            const colors: Record<
                                                string,
                                                string
                                            > = {
                                                street: "#c084fc",
                                                track: "#60a5fa",
                                                drift: "#facc15",
                                                rally: "#fb923c",
                                                offroad: "#4ade80",
                                                drag: "#f87171",
                                            }
                                            return (
                                                <Chip
                                                    key={d}
                                                    label={
                                                        d
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                        d.slice(1)
                                                    }
                                                    active={discipline === d}
                                                    color={colors[d]}
                                                    onClick={() =>
                                                        setDiscipline(
                                                            discipline === d
                                                                ? ""
                                                                : d,
                                                        )
                                                    }
                                                />
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Title */}
                                <div style={{ marginBottom: "16px" }}>
                                    <label style={S.label}>ชื่อ Tune *</label>
                                    <input
                                        value={tuneTitle}
                                        onChange={(e) =>
                                            setTuneTitle(e.target.value)
                                        }
                                        placeholder="เช่น: RWD Drift Setup — S1 900 Drift Build"
                                        maxLength={120}
                                        style={{ ...S.input }}
                                    />
                                </div>

                                {/* Description */}
                                <div style={{ marginBottom: "16px" }}>
                                    <label style={S.label}>
                                        คำอธิบาย (optional)
                                    </label>
                                    <textarea
                                        value={tuneDesc}
                                        onChange={(e) =>
                                            setTuneDesc(e.target.value)
                                        }
                                        placeholder="บอกรายละเอียด tune เพิ่มเติม เช่น สภาพถนนที่เหมาะสม, upgrade ที่ต้องใส่..."
                                        rows={3}
                                        style={{
                                            ...S.input,
                                            resize: "vertical",
                                            fontFamily: "inherit",
                                            lineHeight: 1.5,
                                        }}
                                    />
                                </div>

                                {/* Share Code */}
                                <div>
                                    <label style={S.label}>
                                        Share Code (optional)
                                    </label>
                                    <input
                                        value={shareCode}
                                        onChange={(e) =>
                                            setShareCode(
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                        placeholder="เช่น: 123 456 789"
                                        maxLength={20}
                                        style={{
                                            ...S.input,
                                            fontFamily: "monospace",
                                            letterSpacing: "0.08em",
                                            maxWidth: "220px",
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <AdUnit
                                slot="tunes-new-bottom"
                                format="horizontal"
                            />
                            {submitError && (
                                <div
                                    style={{
                                        padding: "12px 16px",
                                        borderRadius: "10px",
                                        background: "rgba(248,113,113,0.1)",
                                        border: "1px solid rgba(248,113,113,0.3)",
                                        color: "#f87171",
                                        fontSize: "13px",
                                    }}
                                >
                                    {submitError}
                                </div>
                            )}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: "12px",
                                    padding: "8px 0 16px",
                                }}
                            >
                                <button
                                    onClick={() => router.back()}
                                    style={{
                                        padding: "13px 28px",
                                        borderRadius: "10px",
                                        fontSize: "14px",
                                        fontWeight: 700,
                                        background: "none",
                                        border: "1px solid #2a2f3f",
                                        color: "#64748b",
                                        cursor: "pointer",
                                    }}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || !carSelected}
                                    style={{
                                        padding: "13px 32px",
                                        borderRadius: "10px",
                                        fontSize: "14px",
                                        fontWeight: 700,
                                        background: carSelected
                                            ? "#6366f1"
                                            : "#1e2330",
                                        color: carSelected ? "#fff" : "#475569",
                                        border: "none",
                                        cursor: carSelected
                                            ? "pointer"
                                            : "not-allowed",
                                        opacity: submitting ? 0.6 : 1,
                                    }}
                                >
                                    {submitting
                                        ? "⏳ กำลัง Upload..."
                                        : "🚀 Share Tune"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Page export (Suspense required for useSearchParams) ─────────────────────

export default function ShareTunePage() {
    return (
        <Suspense
            fallback={
                <div
                    style={{
                        background: "#0d0f14",
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div style={{ color: "#475569", fontSize: "14px" }}>
                        Loading...
                    </div>
                </div>
            }
        >
            <ShareTunePageInner />
        </Suspense>
    )
}
