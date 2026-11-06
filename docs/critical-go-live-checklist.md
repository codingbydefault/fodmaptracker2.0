# Kritieke go-livechecklist

Laatst bijgewerkt: 6 november 2026

Deze checklist scheidt technisch afgerond werk van acties die alleen door de producteigenaar, leverancier of jurist kunnen worden voltooid. De testomgeving mag geen echte patiëntgegevens verwerken zolang een blokkerende regel openstaat.

## Technisch afgerond

- [x] Authenticatie, routebescherming en eigenaarscontrole aanwezig.
- [x] RLS en patiënt-diëtistautorisatie transactioneel getest (26/26).
- [x] Same-origincontrole, begrensde request bodies, uploadlimieten en applicatie-rate-limits aanwezig.
- [x] Secretscan, dependency-audit, security-posture, coverage, typecheck, build en geïsoleerde databasetests in CI.
- [x] Expliciete toestemming voor gezondheidsgegevens en accountinzage, export en verwijdering aanwezig.
- [x] DPIA-werkdocument, incidentplan en back-up-/restore-runbook aanwezig.

## Blokkerend vóór echte patiëntgegevens

- [ ] **Back-ups:** Supabase Pro of hoger activeren en de eerste automatische back-up aantonen.
- [ ] **Restore:** kwartaalrestore in een geïsoleerd project uitvoeren en RPO/RTO registreren.
- [ ] **Storage:** afzonderlijk herstel voor geüploade foto's aantonen.
- [ ] **Juridisch:** privacyverklaring, DPIA, verwerkingsregister, bewaartermijnen en DPA/subverwerkers door een bevoegde jurist of privacyprofessional laten goedkeuren.
- [ ] **Externe security:** onafhankelijke penetratietest uitvoeren en bevindingen sluiten.

## Productiebeveiliging die accounttoegang vereist

- [ ] **Vercel WAF:** één brede API-regel eerst in `log`-modus publiceren en minimaal 24 uur controleren.
- [ ] **WAF aanscherpen:** na controle per route/methode een veilige limiet vastleggen en de actie naar HTTP 429 omzetten.
- [ ] **CSP:** report-only-telemetrie controleren en pas daarna afdwingend maken.
- [ ] **Branch protection:** securityworkflow en Vercel-productiedeploy als verplichte checks op `main` instellen.

### Voorgestelde eerste WAF-observatieregel

- Pad begint met `/api/`
- Omgeving is `production`
- Vast venster: 60 seconden
- Ruime observatielimiet: 300 requests per IP
- Actie: `log`

De observatielimiet is geen definitieve beveiligingslimiet. Gebruik gemeten legitiem verkeer om de uiteindelijke waarde per endpoint te bepalen. Vercel telt rate limits per regio; de applicatielimiter blijft daarom als tweede verdedigingslaag actief.
