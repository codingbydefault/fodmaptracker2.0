export function siteUrl() {
  const raw = process.env.SITE_URL?.trim() || "https://fodmaptracker20.vercel.app";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

export const privatePaths = ["/dashboard", "/voeding", "/klachten", "/recepten", "/weekmenu", "/boodschappen", "/voedingswijzer", "/profiel", "/admin", "/account/export"] as const;
