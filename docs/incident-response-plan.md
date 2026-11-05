# Incidentresponsplan

Eigenaar: CodedByDefault
Versie: 1.0 — 5 november 2026

## Prioriteiten

1. Bescherm betrokkenen en stop verdere blootstelling.
2. Bewaar bruikbaar bewijs zonder gezondheidsgegevens onnodig te kopiëren.
3. Beoordeel omvang, categorieën, betrokkenen en risico.
4. Herstel veilig en controleer dat de oorzaak werkelijk is weggenomen.
5. Voldoe aan contractuele en wettelijke meldplichten.

## Ernst

- **SEV-1:** bevestigde of waarschijnlijke blootstelling van gezondheidsgegevens, actieve accountovername, ongeautoriseerde bulkexport of destructieve databaseactie.
- **SEV-2:** beperkte ongeautoriseerde toegang, uitval van essentiële functies, mislukte back-up of kwetsbaarheid met reële exploitatiemogelijkheid.
- **SEV-3:** fout zonder aangetoonde gegevensblootstelling of laagrisico beveiligingsafwijking.

## Eerste 60 minuten

- Registreer tijd, melder, systemen en waarnemingen in een afgeschermd incidentdossier.
- Wijs incidentleider en technisch uitvoerder aan.
- Trek gecompromitteerde sleutels/sessies in en roteer secrets waar nodig.
- Schakel getroffen route, integratie of deployment uit als dat schade beperkt.
- Maak geen productiedump naar onbeheerde laptops of chatkanalen.
- Bewaar relevante Vercel-, Supabase-, auth- en auditlogs met toegangsbeperking.
- Informeer de privacyverantwoordelijke bij mogelijke persoonsgegevens.

## Beoordeling datalek

Leg vast welke gegevens, hoeveel betrokkenen, welke ontvangers en welk waarschijnlijk gevolg aan de orde zijn. De privacyverantwoordelijke bepaalt met juridisch advies of melding aan de Autoriteit Persoonsgegevens binnen 72 uur nodig is en of betrokkenen moeten worden geïnformeerd. Ook een besluit om niet te melden wordt gemotiveerd vastgelegd.

## Herstel

- Herstel via gereviewde wijziging en vier-ogencontrole.
- Test authenticatie, RLS, export, verwijdering en getroffen gebruikersflow.
- Controleer logs op herhaling.
- Heropen toegang pas na expliciet besluit van incidentleider.

## Na afloop

Binnen vijf werkdagen: tijdlijn, oorzaak, impact, communicatie, verbeteracties, eigenaar en deadline. Voeg regressietests toe en werk DPIA, procedures en monitoring bij.

## Contactlijst — vóór praktijktest invullen

- Incidentleider: …
- Technisch verantwoordelijke: …
- Privacy/AVG: …
- Juridisch adviseur/FG: …
- Supabase supportpad: …
- Vercel supportpad: …
- Autoriteit Persoonsgegevens-procedure: …
