import { isHalloweenToday } from "@/lib/seasonal";

export default function Loading() {
  const halloween = isHalloweenToday();
  return (
    <main className="startup-screen" aria-label="Fodmap-Tracker wordt geladen">
      <img src={halloween ? "/halloween/pumpkin-logo.webp" : "/brand/logo-192.webp"} alt="" width="96" height="96" />
      <div className="startup-wordmark">Fodmap-Tracker<span className="startup-dot">.</span></div>
      <p>Even je overzicht laden…</p>
      <div className="startup-track" aria-hidden="true"><span /></div>
    </main>
  );
}
