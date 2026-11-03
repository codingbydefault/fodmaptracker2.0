import type { AppLanguage } from "@/lib/i18n";

const copy: Record<AppLanguage, string[]> = {
  nl: [
    "Eerst veilig starten",
    "Een eliminatiefase is tijdelijk en wordt gevolgd door herintroductie. De gekozen teller is alleen een planningshulp; de passende duur is persoonlijk en ligt doorgaans binnen 2–6 weken. Doe dit bij voorkeur met een FODMAP-gespecialiseerde diëtist.",
    "Overleg vóór je start met een arts of diëtist als je jonger bent dan 18 jaar, zwanger bent, onbedoeld gewicht verliest, ondergewicht hebt of een eetstoornis hebt of hebt gehad.",
    "Neem eerst contact op met je huisarts bij bloedverlies via de anus, nachtelijke diarree, onbedoeld gewichtsverlies, een duidelijke verandering van je ontlasting die langer dan twee weken duurt, nieuwe klachten vanaf 50 jaar of relevante darmziekten in je familie.",
  ],
  en: [
    "Start safely",
    "The elimination phase is temporary and is followed by reintroduction. Your selected counter is only a planning aid; the appropriate duration is personal and usually falls within 2–6 weeks. Preferably work with a FODMAP-trained dietitian.",
    "Consult a doctor or dietitian before starting if you are under 18, pregnant, losing weight unintentionally, underweight, or have or have had an eating disorder.",
    "Contact your doctor first if you have rectal bleeding, night-time diarrhoea, unintended weight loss, a clear change in bowel habits lasting more than two weeks, new symptoms after age 50, or relevant bowel disease in your family.",
  ],
  fr: [
    "Commencer en toute sécurité",
    "La phase d’élimination est temporaire et suivie d’une réintroduction. Le compteur choisi est seulement une aide à la planification ; la durée adaptée est personnelle et se situe généralement entre 2 et 6 semaines. Faites-vous de préférence accompagner par un·e diététicien·ne formé·e aux FODMAP.",
    "Consultez un médecin ou un·e diététicien·ne avant de commencer si vous avez moins de 18 ans, êtes enceinte, perdez du poids involontairement, avez un poids insuffisant ou avez eu un trouble alimentaire.",
    "Contactez d’abord votre médecin en cas de saignement rectal, diarrhée nocturne, perte de poids involontaire, changement net du transit durant plus de deux semaines, nouveaux symptômes après 50 ans ou maladie intestinale familiale.",
  ],
  de: [
    "Sicher starten",
    "Die Eliminationsphase ist vorübergehend und wird von der Wiedereinführung gefolgt. Der gewählte Zähler ist nur eine Planungshilfe; die geeignete Dauer ist individuell und liegt meist zwischen 2 und 6 Wochen. Lass dich möglichst von einer FODMAP-geschulten Ernährungsfachkraft begleiten.",
    "Sprich vor Beginn mit einer Ärztin, einem Arzt oder einer Ernährungsfachkraft, wenn du unter 18, schwanger, untergewichtig bist, unbeabsichtigt abnimmst oder eine Essstörung hast oder hattest.",
    "Wende dich zuerst an deine Hausarztpraxis bei Blut im Stuhl, nächtlichem Durchfall, unbeabsichtigtem Gewichtsverlust, deutlicher Stuhlveränderung über mehr als zwei Wochen, neuen Beschwerden ab 50 oder relevanten Darmerkrankungen in deiner Familie.",
  ],
};

export function DietSafetyNotice({ language = "nl" }: { language?: AppLanguage }) {
  const [title, ...paragraphs] = copy[language];
  return (
    <section className="notice phase-note" aria-labelledby="diet-safety-title">
      <strong id="diet-safety-title">{title}</strong>
      {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    </section>
  );
}
