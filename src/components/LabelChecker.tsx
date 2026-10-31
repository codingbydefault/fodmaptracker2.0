"use client";

import { useRef, useState } from "react";
import { analyzeIngredientText, fodmapGroupNames } from "@/lib/fodmap-guide";

export function LabelChecker() {
  const [value, setValue] = useState("");
  const [checkedValue, setCheckedValue] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanError, setScanError] = useState<string | null>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const findings = checkedValue ? analyzeIngredientText(checkedValue) : [];
  async function scanLabel(file: File) {
    setScanning(true); setProgress(0); setScanError(null);
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("nld+eng", 1, {
        logger(message) {
          if (message.status === "recognizing text" && typeof message.progress === "number") setProgress(Math.round(message.progress * 100));
        },
      });
      try {
        const result = await worker.recognize(file);
        const text = result.data.text.replace(/\n{3,}/g, "\n\n").trim();
        if (!text) throw new Error("no-text");
        setValue(text); setCheckedValue(text);
      } finally { await worker.terminate(); }
    } catch {
      setScanError("De tekst kon niet betrouwbaar worden herkend. Maak een scherpe foto recht voor het etiket, met voldoende licht, en probeer opnieuw.");
    } finally { setScanning(false); setProgress(0); if (cameraInput.current) cameraInput.current.value=""; }
  }
  return (
    <section className="card" id="etiketcontrole">
      <h2 className="section-title">Etiketcontrole</h2>
      <p className="subtle">
        Fotografeer het ingrediëntenblok of plak de tekst. De foto wordt lokaal op dit toestel verwerkt en niet opgeslagen. We signaleren alleen bekende
        aandachtspunten; dit vervangt geen producttest of diëtist.
      </p>
      <div className="label-scan-actions">
        <button className="btn" type="button" disabled={scanning} onClick={()=>cameraInput.current?.click()}>
          {scanning ? `Tekst herkennen… ${progress}%` : "📷 Scan etiket met camera"}
        </button>
        <input ref={cameraInput} className="sr-only" type="file" accept="image/*" capture="environment" onChange={(event)=>{const file=event.target.files?.[0];if(file)void scanLabel(file)}} />
      </div>
      {scanning && <div className="scan-progress" role="status" aria-live="polite"><span style={{width:`${Math.max(progress,4)}%`}} /></div>}
      {scanError && <div className="notice notice-error">{scanError}</div>}
      <form onSubmit={(event) => { event.preventDefault(); setCheckedValue(value.trim()); }}>
        <textarea
          name="check"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={4000}
          required
          placeholder="De herkende ingrediënten verschijnen hier automatisch…"
          style={{ width: "100%", minHeight: 130 }}
        />
        <button className="btn" type="submit" style={{ marginTop: 10 }}>
          Tekst controleren
        </button>
      </form>
      {checkedValue !== null && (
        checkedValue.length === 0 ? (
          <div className="notice notice-error">Vul eerst een ingrediëntenlijst in.</div>
        ) : findings.length ? (
          <ul className="check-findings">
            {findings.map((finding, index) => (
              <li key={`${finding.label}-${index}`}>
                <span className="pill status-portie-telt">Let op</span>
                <strong>{finding.label}</strong>
                <small>{fodmapGroupNames[finding.group]}</small>
              </li>
            ))}
          </ul>
        ) : (
          <div className="notice">
            Geen ingebouwd signaal gevonden. Dat betekent niet automatisch dat
            het product geschikt is.
          </div>
        )
      )}
    </section>
  );
}
