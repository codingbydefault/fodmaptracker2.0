import type { Metadata } from "next";
import { NotFoundView } from "@/components/NotFoundView";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pagina niet gevonden · Fodmap-Tracker",
  description: "Dit adres hoort niet bij Fodmap-Tracker.",
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="nl">
      <body>
        <NotFoundView />
      </body>
    </html>
  );
}
