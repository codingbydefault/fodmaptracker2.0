# Security- en AVG-releasechecklist

Status: **niet vrijgegeven voor echte patiëntgegevens**
Eigenaar: CodedByDefault
Laatst bijgewerkt: 5 november 2026

Dit document is het technische go/no-go-register. Juridische onderdelen moeten vóór de praktijktest door een privacyjurist of FG worden beoordeeld.

## Go/no-go fase 1

- [x] Applicatieroutes vereisen een server-side geverifieerde gebruiker.
- [x] Gezondheidsgegevens hebben eigenaargebonden RLS-policies in de migraties.
- [x] Privébestanden gebruiken eigenaargebonden Storage-policies.
- [x] Accountgegevens kunnen worden ingezien en geëxporteerd.
- [x] Een gebruiker kan het eigen account en de bijbehorende gegevens verwijderen.
- [x] Gegevensdeling met een diëtist is expliciet, beperkt en intrekbaar.
- [x] Privileged databasefuncties hebben een lege `search_path` en expliciete EXECUTE-rechten.
- [x] De testlimiet weigert registratie wanneer 100 accounts bestaan, ook bij gelijktijdige registratie.
- [x] Beveiligingsmigratie van 5 november 2026 is uitgevoerd in productieproject `vwnbuaeepubfmrdjodbd`.
- [ ] Supabase Security Advisor en Performance Advisor geven geen onverklaarde waarschuwingen.
- [x] Transactionele allow- en deny-tests voor patiënt, diëtist, beheerder, authenticated en anon zijn opgenomen in CI.
- [x] De 26 database-autorisatietests zijn op 5 november 2026 transactioneel geslaagd tegen productie en volledig teruggedraaid.
- [ ] DPIA is beoordeeld en goedgekeurd.
- [ ] Verwerkersovereenkomsten en subverwerkers zijn gecontroleerd.
- [ ] Bewaar- en verwijdertermijnen zijn juridisch vastgesteld en gepubliceerd.

**Go-besluit:** alleen wanneer alle bovenstaande punten zijn afgevinkt en het besluit schriftelijk is vastgelegd.

## Technische bewijzen

Voor iedere release moeten de volgende opdrachten slagen:

```bash
npm ci
npm audit --audit-level=high
npm run security:check
npm run security:posture
npm test
npm run typecheck
npm run build
```

De CI voert dezelfde controles uit. Een productie-release mag niet buiten de beschermde `main`-workflow om plaatsvinden.

## Productiecontrole Supabase

1. Controleer dat het project-ID `vwnbuaeepubfmrdjodbd` is.
2. Vergelijk `supabase migration list` met de repository.
3. Voer Security Advisor uit en sla het resultaat met datum op bij de release.
4. Controleer dat iedere tabel in een blootgesteld schema RLS heeft.
5. Controleer grants én policies voor `anon` en `authenticated`.
6. Controleer alle `SECURITY DEFINER`-functies op eigenaarchecks, lege `search_path` en minimale EXECUTE-grants.
7. Test minimaal twee patiënten, twee diëtisten, één niet-geverifieerde diëtist en één beheerder.

### Controle 5 november 2026

- Health Advisor: 0 fouten, 0 waarschuwingen, 0 suggesties.
- Security Advisor: 0 fouten, 18 waarschuwingen, 4 informatieve meldingen.
- De 18 securitywaarschuwingen betreffen `SECURITY DEFINER`-RPC's. De migratie beperkt EXECUTE expliciet; iedere functie blijft afzonderlijk te beoordelen en met allow/deny-tests te bewijzen.
- De vier informatieve meldingen betreffen tabellen zonder policies die bewust alleen via streng gecontroleerde functies bereikbaar horen te zijn (`app_admins`, bezoekstatistieken en `care_audit_logs`). Rechtstreekse tabelgrants moeten tijdens iedere release worden gecontroleerd.
- Performance Advisor: 0 fouten, 18 waarschuwingen en 25 suggesties; deze zijn nog niet individueel afgehandeld.
- Projectoverzicht: Free-plan en **No backups**. Dit voldoet nog niet aan de eis voor patiëntgegevens.
- De SQL is via de Dashboard-editor uitgevoerd. De repositorymigratie blijft de bron voor herhaalbare omgevingen; controle van formele migratiehistorie blijft nodig.
- De pgTAP-autorisatieset heeft 26 van 26 controles doorlopen. De testtransactie eindigde met `rollback`, zodat geen testaccounts of testgezondheidsgegevens zijn bewaard.
- Gecontroleerd: patiënt A/B-isolatie, verbod op schrijven voor een andere patiënt, pending versus geverifieerde diëtist, afzonderlijke deeltoestemmingen, onmiddellijke intrekking, admin-RPC en anonieme toegang.

## Resterende fasen

### Betrouwbaarheid

- [ ] Back-upretentie en point-in-time recovery vastleggen; huidige dashboardstatus is `No backups`.
- [ ] Restore-test uitvoeren en bewijsmateriaal vastleggen.
- [x] Beheerdersmonitoring en foutregistratie aanwezig.
- [x] Basale securityheaders aanwezig.
- [x] CSP staat in report-only-modus; rapportage beoordelen voordat deze afdwingend wordt.
- [x] Dependency-audit blokkeert high/critical kwetsbaarheden in CI.
- [x] Incidentresponsprocedure gedocumenteerd.
- [x] API-mutaties blokkeren afwijkende browser-origins en begrenzen requestgroottes.
- [x] Publieke en kostbare API-routes hebben een eerste applicatielaag voor rate limiting.
- [ ] Distributed rate limiting via Vercel Firewall of gedeelde datastore instellen; de huidige in-memory limiet is alleen een eerste verdedigingslaag per serverinstantie.

### Testkwaliteit

- [x] Unit tests aanwezig.
- [x] Database-integratietests en geïsoleerde Supabase CI-job toegevoegd.
- [x] Eerste groene GitHub CI-uitvoering vastgelegd: run `42078606355`, 5 november 2026; databasejob 1m53s.
- [ ] Authenticatie- en sessietests automatiseren.
- [x] Autorisatie- en RLS-deny-tests geautomatiseerd.
- [x] Patiënt-diëtistkoppeling, scopes en intrekking op databaseniveau getest.
- [ ] Testaccountlimiet en toekomstige abonnementslimieten end-to-end testen.

### Mobiel en lancering

- [x] Responsive interface en PWA-manifest aanwezig.
- [ ] Service worker en gecontroleerde offlinefallback toevoegen.
- [ ] iOS-, Android- en tabletmatrix uitvoeren.
- [ ] Mobiele beveiligingstest uitvoeren.
- [ ] WCAG 2.1 AA-audit uitvoeren.
- [ ] Lighthouse-/Web Vitals-baseline vastleggen.
