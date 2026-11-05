export function siteUrl() {
  const raw = process.env.SITE_URL?.trim() || "https://fodmaptracker20.vercel.app";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

export const privatePaths = ["/dashboard", "/voeding", "/klachten", "/recepten", "/weekmenu", "/boodschappen", "/voedingswijzer", "/fases", "/herintroductie", "/profiel", "/begeleiding", "/koppelen", "/professional", "/admin", "/account/export"] as const;
