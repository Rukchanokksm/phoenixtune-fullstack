"use client";
import Link from "next/link";
import styles from "./CarModelsGrid.module.css";

type Car = {
  id: string;
  make: string;
  model: string;
  year: number | null;
};

interface Props {
  cars: Car[];
  gameSlug: string;
  brandName: string;
  accent?: string;
}

export function CarModelsGrid({
  cars,
  gameSlug,
  brandName,
  accent = "#60a5fa",
}: Props) {
  if (cars.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🚗</div>
        <p className={styles.emptyText}>ยังไม่มีรุ่นรถในระบบ</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {cars.map((car) => (
        <Link
          key={car.id}
          href={`/games/${gameSlug}/${encodeURIComponent(brandName)}/${car.id}`}
          className={styles.card}
          style={
            {
              "--accent-hover": accent + "66",
              "--accent-text": accent,
              "--accent-bg": accent + "1a",
            } as React.CSSProperties
          }
        >
          <div className={styles.cardMeta}>
            {car.year && <span className={styles.cardYear}>{car.year}</span>}
            <span className={styles.cardLabel}>Model</span>
          </div>
          <div className={styles.cardTitle}>{car.model}</div>
        </Link>
      ))}
    </div>
  );
}
