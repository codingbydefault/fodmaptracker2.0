"use client";

import { useState } from "react";
import type { AppLanguage } from "@/lib/i18n";

type Period = "today" | "7d" | "30d";
type Stat = { average: number | null; count: number };

const copy={nl:{labels:{today:"Vandaag","7d":"Laatste 7 dagen","30d":"Laatste 30 dagen"},title:"Gem. ernst",one:"registratie",many:"registraties",aria:"Periode voor gemiddelde ernst"},en:{labels:{today:"Today","7d":"Last 7 days","30d":"Last 30 days"},title:"Avg. severity",one:"entry",many:"entries",aria:"Average severity period"},fr:{labels:{today:"Aujourd’hui","7d":"7 derniers jours","30d":"30 derniers jours"},title:"Gravité moy.",one:"entrée",many:"entrées",aria:"Période de gravité moyenne"},de:{labels:{today:"Heute","7d":"Letzte 7 Tage","30d":"Letzte 30 Tage"},title:"Ø Schweregrad",one:"Eintrag",many:"Einträge",aria:"Zeitraum für den durchschnittlichen Schweregrad"}};
export function SeverityStatCard({ stats,language="nl" }: { stats: Record<Period, Stat>;language?:AppLanguage }) {
 const text=copy[language];const labels=text.labels;
 const [period,setPeriod]=useState<Period>("today");
 const [expanded,setExpanded]=useState(false);
 const current=stats[period];
 return <div className={`card stat severity-stat${expanded?" is-expanded":""}`}>
  <button className="severity-stat-summary" type="button" aria-expanded={expanded} aria-controls="severity-periods" onClick={()=>setExpanded(value=>!value)}>
   <span><span className="subtle severity-stat-label">{text.title}</span><span className="stat-number severity-stat-number">{current.average===null?"—":current.average}{current.average!==null&&<span> / 10</span>}</span><span className="subtle severity-stat-detail">{labels[period]} · {current.count} {current.count===1?text.one:text.many}</span></span>
   <span className="severity-stat-chevron" aria-hidden="true">{expanded?"×":"⌄"}</span>
  </button>
  {expanded&&<div id="severity-periods" className="severity-periods" aria-label={text.aria}>{(Object.keys(labels) as Period[]).map(value=><button key={value} type="button" className={period===value?"active":""} aria-pressed={period===value} onClick={()=>setPeriod(value)}>{labels[value]}</button>)}</div>}
 </div>;
}
