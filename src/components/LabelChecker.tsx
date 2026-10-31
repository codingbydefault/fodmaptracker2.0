"use client";

import { useState } from "react";
import { analyzeIngredientText, fodmapGroupNames } from "@/lib/fodmap-guide";

export function LabelChecker() {
  const [value, setValue] = useState("");
  const [checkedValue, setCheckedValue] = useState<string | null>(null);
  const findings = checkedValue ? analyzeIngredientText(checkedValue) : [];
  return (
    <section className="card" id="etiketcontrole">
      <h2 className="section-title">Etiketcontrole</h2>
      <p className="subtle">
        Plak een ingrediëntenlijst. We signaleren alleen bekende
        aandachtspunten; dit vervangt geen producttest of diëtist.
      </p>
      <form onSubmit={(event) => { event.preventDefault(); setCheckedValue(value.trim()); }}>
        <textarea
          name="check"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={4000}
          required
          placeholder="Plak hier de ingrediënten van het etiket…"
          style={{ width: "100%", minHeight: 130 }}
        />
        <button className="btn" type="submit" style={{ marginTop: 10 }}>
          Controleren
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
