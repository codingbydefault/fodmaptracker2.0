# Back-up- en restore-runbook

Status: procedure gereed, productie-uitvoering geblokkeerd door Free-plan
Laatst bijgewerkt: 6 november 2026

## Doelstellingen

RPO en RTO moeten vóór de praktijktest door de producteigenaar worden vastgesteld. Voorstel voor de testfase: maximaal 24 uur dataverlies (RPO) en herstel binnen 8 uur (RTO). Dit is pas een toezegging nadat het gekozen Supabase-plan dit aantoonbaar ondersteunt.

## Activering vóór echte patiëntgegevens

1. Upgrade het productieproject naar minimaal Supabase Pro; automatische dagelijkse databaseback-ups zijn niet beschikbaar op Free.
2. Controleer in **Database → Backups** dat een herstelpunt zichtbaar is en noteer retentie en tijdstip.
3. Leg vast wie een restore mag starten en vereis tweepersoonscontrole voor productieherstel.
4. Plan de eerste restoretest in een afzonderlijk Supabase-project met gepseudonimiseerde gegevens.
5. Maak voor Storage-bestanden een afzonderlijke export-/herstelprocedure; een databaseback-up bevat alleen Storage-metadata, niet de bestanden zelf.

Een onbeveiligde productiedump in GitHub Actions, buildlogs of CI-artifacts is voor deze applicatie niet toegestaan.

## Maandelijkse controle

1. Controleer in het juiste Supabase-project of automatische back-ups succesvol zijn.
2. Noteer plan, regio, back-uptype, retentie en laatste succesvolle back-up.
3. Controleer afzonderlijk hoe Storage-objecten worden hersteld; een databaseback-up dekt niet automatisch ieder bestandsscenario.
4. Leg bewijs en controleur vast in het release-/operationsregister.

## Kwartaalrestoretest

1. Gebruik een geïsoleerd testproject; herstel nooit over productie heen.
2. Neem een goedgekeurde back-up of logisch exportbestand.
3. Herstel schema en data in de testomgeving.
4. Gebruik uitsluitend testaccounts of gepseudonimiseerde data.
5. Controleer aantallen en referentiële integriteit van kernobjecten.
6. Controleer dat RLS, grants, functies, triggers en Storage-policies zijn meegekomen.
7. Test login, patiëntisolatie, diëtistkoppeling, export en verwijdering.
8. Meet werkelijke RPO/RTO en registreer afwijkingen.
9. Verwijder de tijdelijke herstelomgeving veilig na acceptatie.

## Registratie

| Datum | Back-up | Testomgeving | RPO | RTO | Resultaat | Controleur | Acties |
|---|---|---|---|---|---|---|---|
| … | … | … | … | … | … | … | … |

Een restoretest geldt alleen als geslaagd wanneer niet alleen data, maar ook autorisatie en verwijdering zijn gecontroleerd.
