# Technische prioriteiten — actuele status

Bijgewerkt: 5 november 2026

Dit overzicht verwerkt de aangeleverde prioriteitenlijst. `Gereed` betekent technisch aantoonbaar aanwezig; het betekent niet automatisch dat juridische beoordeling of een professionele penetratietest is afgerond.

## Kritiek

### 1. AVG/GDPR voor gezondheidsgegevens — gedeeltelijk

- Gereed: privacyverklaring in concept, expliciete gezondheidstoestemming, inzage, correctie, export en accountverwijdering.
- Gereed: DPIA-werkdocument, incidentplan en technisch verwerkings-/releaseoverzicht.
- Open: juridische beoordeling, definitief verwerkingsregister, bewaartermijnen en DPA/subverwerkercontrole.

### 2. Security audit broncode — grotendeels technisch verwerkt

- Authenticatie en route protection aanwezig.
- RLS en patiënt-diëtistautorisatie: 26/26 transactionele tests plus geïsoleerde CI-test.
- Invoer: Zod-schema's, begrensde JSON-streams, uploadlimieten en parameterbinding via Supabase-client.
- API: same-origincontrole voor mutaties, private/no-store responses en eerste rate limits.
- Dependency-audit en secretscan blokkeren releases.
- Open: externe penetratietest en distributed rate limiting/WAF. De in-memory limiter werkt per Vercel-instantie en is geen volledige DDoS-bescherming.

### 3. Back-upstrategie — geblokkeerd

- Runbook en restoreprocedure zijn gereed.
- Supabase-project meldt `No backups` op het Free-plan.
- Open: geschikt plan/back-upmechanisme activeren en een geïsoleerde restore-test uitvoeren.

## Hoog

### 4. Performance — gedeeltelijk

- Productiebuild, WebP-beeldverwerking, caching en Vercel Speed Insights aanwezig.
- Open: Performance Advisor-waarschuwingen, Lighthouse-baseline en loadtest.

### 5. Error handling en monitoring — gereed als basis

- Technische client- en routefouten worden privacyvriendelijk geregistreerd.
- Adminmonitoring toont recente technische gebeurtenissen zonder klachtinhoud.
- Open: externe alerting/on-callkanaal voor SEV-1/SEV-2.

### 6. Testcoverage — gedeeltelijk

- 78 applicatietests en 26 database-autorisatietests.
- Open: browser-E2E, mobiele tests en expliciete coverage-drempel.

### 7. CI/CD-review — gereed als basis

- Iedere push/PR controleert secrets, security posture, dependencies, tests, typecheck, build en een verse Supabase-stack.
- Open: branch protection en vereiste deployment checks in GitHub/Vercel bevestigen.

### 8. Securityheaders — gedeeltelijk

- HSTS, nosniff, frame denial, referrer- en permissions-policy actief.
- CSP draait in report-only-modus; na observatie omzetten naar afdwingend.

## Middel

- SEO: sitemap, robots en publieke artikelen aanwezig; audit blijft open.
- Analytics: consentgestuurde GA4/GTM en Vercel Analytics aanwezig.
- PWA: manifest en iconen aanwezig; service worker en offline tracking ontbreken.
- Accessibility: basissemantiek aanwezig; formele WCAG 2.1 AA-audit ontbreekt.

## Laag

- Internationalisatie: Nederlands, Engels, Frans en Duits aanwezig; volledigheidscontrole blijft doorlopend.
- Dark mode: niet geïmplementeerd.
- API-documentatie: niet volledig uitgewerkt.
