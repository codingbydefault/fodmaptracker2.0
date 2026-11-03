"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function QuickAddMenu({ mealLabel, symptomLabel }: { mealLabel: string; symptomLabel: string }) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>("a")?.focus();
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  return <>
    <button className="quick-add-trigger" type="button" aria-label="Snel iets toevoegen" aria-expanded={open} onClick={() => setOpen(true)}>
      <span aria-hidden="true">＋</span>
    </button>
    {open && <div className="quick-add-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
      <div className="quick-add-panel" role="dialog" aria-modal="true" aria-labelledby="quick-add-title" ref={panel}>
        <div className="quick-add-handle" aria-hidden="true" />
        <div className="quick-add-heading">
          <div><div className="eyebrow">Snel toevoegen</div><h2 id="quick-add-title">Wat wil je doen?</h2></div>
          <button type="button" aria-label="Sluiten" onClick={() => setOpen(false)}>×</button>
        </div>
        <div className="quick-add-grid">
          <Link href="/voeding" onClick={() => setOpen(false)}><span aria-hidden="true">🍽</span><strong>{mealLabel} registreren</strong><small>Leg vast wat je hebt gegeten</small></Link>
          <Link href="/klachten" onClick={() => setOpen(false)}><span aria-hidden="true">♡</span><strong>{symptomLabel} registreren</strong><small>Noteer hoe je je voelt</small></Link>
          <Link href="/voedingswijzer#etiketcontrole" onClick={() => setOpen(false)}><span aria-hidden="true">▥</span><strong>Product scannen</strong><small>Controleer een etiket of barcode</small></Link>
          <Link href="/recepten/nieuw" onClick={() => setOpen(false)}><span aria-hidden="true">✎</span><strong>Recept maken</strong><small>Bewaar je eigen gerecht</small></Link>
        </div>
      </div>
    </div>}
  </>;
}
