"use client";
import { useEffect, useMemo, useState } from "react";
type Item = { id: string; line: string; recipe: string; date: string };
export function ShoppingList({ week, items }: { week: string; items: Item[] }) {
  const storageKey = `fodmap-shopping-${week}`;
  const [checked, setChecked] = useState<string[]>([]);
  useEffect(() => {
    try {
      setChecked(JSON.parse(localStorage.getItem(storageKey) ?? "[]"));
    } catch {
      setChecked([]);
    }
  }, [storageKey]);
  const selected = useMemo(() => new Set(checked), [checked]);
  function toggle(id: string) {
    const next = selected.has(id)
      ? checked.filter((x) => x !== id)
      : [...checked, id];
    setChecked(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }
  return (
    <div className="shopping-list">
      {items.map((item) => (
        <label
          className={
            selected.has(item.id) ? "shopping-item checked" : "shopping-item"
          }
          key={item.id}
        >
          <input
            type="checkbox"
            checked={selected.has(item.id)}
            onChange={() => toggle(item.id)}
          />
          <span>
            <strong>{item.line}</strong>
            <small>{item.recipe}</small>
          </span>
        </label>
      ))}
    </div>
  );
}
