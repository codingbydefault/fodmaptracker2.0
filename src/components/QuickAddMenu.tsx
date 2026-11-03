"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { appCopy } from "@/lib/app-copy";
import type { AppLanguage } from "@/lib/i18n";

export function QuickAddMenu({ language }: { language: AppLanguage }) {
  const [open, setOpen] = useState(false);
  const text=appCopy[language].quick;
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>("a")?.focus();
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  return <>
    <button className="quick-add-trigger" type="button" aria-label={text.eyebrow} aria-expanded={open} onClick={() => setOpen(true)}>
      <span aria-hidden="true">＋</span>
    </button>
    {open && <div className="quick-add-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
      <div className="quick-add-panel" role="dialog" aria-modal="true" aria-labelledby="quick-add-title" ref={panel}>
        <div className="quick-add-handle" aria-hidden="true" />
        <div className="quick-add-heading">
          <div><div className="eyebrow">{text.eyebrow}</div><h2 id="quick-add-title">{text.title}</h2></div>
          <button type="button" aria-label={text.close} onClick={() => setOpen(false)}>×</button>
        </div>
        <div className="quick-add-grid">
          <Link href="/voeding" onClick={() => setOpen(false)}><span aria-hidden="true">🍽</span><strong>{text.meal}</strong><small>{text.mealDetail}</small></Link>
          <Link href="/klachten" onClick={() => setOpen(false)}><span aria-hidden="true">♡</span><strong>{text.symptom}</strong><small>{text.symptomDetail}</small></Link>
          <Link href="/voedingswijzer#etiketcontrole" onClick={() => setOpen(false)}><span aria-hidden="true">▥</span><strong>{text.scan}</strong><small>{text.scanDetail}</small></Link>
          <Link href="/recepten/nieuw" onClick={() => setOpen(false)}><span aria-hidden="true">✎</span><strong>{text.recipe}</strong><small>{text.recipeDetail}</small></Link>
        </div>
      </div>
    </div>}
  </>;
}
