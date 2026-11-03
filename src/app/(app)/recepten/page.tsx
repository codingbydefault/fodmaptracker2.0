import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { SubmitButton } from "@/components/SubmitButton";
import { RecipeCarousel } from "@/components/RecipeCarousel";
import {
  getCuratedRecipes,
  getPublicRecipes,
  getRecipes,
  requireUser,
} from "@/lib/data";
import { type MenuMealType } from "@/lib/types";
import { localizedMenuMealNames } from "@/lib/i18n";
import { getRequestLanguage } from "@/lib/request-language";
import { appCopy } from "@/lib/app-copy";

export const metadata = { title: "Recepten" };

type RecipeSearchParams = {
  q?: string;
  fase?: string;
  categorie?: string;
  bron?: string;
  message?: string;
  error?: string;
};
export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<RecipeSearchParams>;
}) {
  const [{ user }, params, language] = await Promise.all([
    requireUser(),
    searchParams,
    getRequestLanguage(),
  ]);
  const pageText = appCopy[language].pages;
  const categories = Object.entries(localizedMenuMealNames[language]) as [
    MenuMealType,
    string,
  ][];
  const ui =
    language === "en"
      ? {
          deleted: "Recipe deleted.",
          failed: "The action failed. Please try again.",
          search: "Search",
          placeholder: "E.g. chicken, breakfast or chocolate…",
          category: "Category",
          allCategories: "All categories",
          source: "Source",
          allSources: "All sources",
          elimination: "Suitable for elimination phase",
          results: "Show results",
          clear: "Clear filters",
          allSource: "All Fodmap-Tracker recipes",
          recipe: "recipe",
          recipes: "recipes",
          scroll: "Scroll to see all",
          none: "No recipes match these filters.",
          viewAll: "View all recipes",
          community: "From the community",
          shared: "shared recipe",
          sharedMany: "shared recipes",
          noCommunity: "No recipes have been shared by other users yet.",
          collection: "Your collection",
          own: "personal recipe",
          ownMany: "personal recipes",
          newRecipe: "New recipe",
          noOwnSearch: "No personal recipes found for this search.",
          noOwn: "You have not saved any personal recipes yet.",
          first: "Create your first recipe",
          footer:
            "Personal recipes are personal notes. Source adaptations are not medical advice; portion size and individual tolerance remain important.",
        }
      : language === "fr"
        ? {
            deleted: "Recette supprimée.",
            failed: "L’action a échoué. Réessayez.",
            search: "Rechercher",
            placeholder: "Ex. poulet, petit-déjeuner ou chocolat…",
            category: "Catégorie",
            allCategories: "Toutes les catégories",
            source: "Source",
            allSources: "Toutes les sources",
            elimination: "Adaptée à la phase d’élimination",
            results: "Afficher les résultats",
            clear: "Effacer les filtres",
            allSource: "Toutes les recettes Fodmap-Tracker",
            recipe: "recette",
            recipes: "recettes",
            scroll: "Faites défiler pour tout voir",
            none: "Aucune recette ne correspond aux filtres.",
            viewAll: "Voir toutes les recettes",
            community: "De la communauté",
            shared: "recette partagée",
            sharedMany: "recettes partagées",
            noCommunity:
              "Aucune recette n’a encore été partagée par d’autres utilisateurs.",
            collection: "Votre collection",
            own: "recette personnelle",
            ownMany: "recettes personnelles",
            newRecipe: "Nouvelle recette",
            noOwnSearch: "Aucune recette personnelle trouvée.",
            noOwn: "Vous n’avez pas encore enregistré de recette personnelle.",
            first: "Créer votre première recette",
            footer:
              "Les recettes personnelles sont des notes. Les adaptations ne sont pas un avis médical ; la portion et la tolérance individuelle restent importantes.",
          }
        : language === "de"
          ? {
              deleted: "Rezept gelöscht.",
              failed: "Die Aktion ist fehlgeschlagen. Bitte erneut versuchen.",
              search: "Suchen",
              placeholder: "Z. B. Hähnchen, Frühstück oder Schokolade…",
              category: "Kategorie",
              allCategories: "Alle Kategorien",
              source: "Quelle",
              allSources: "Alle Quellen",
              elimination: "Für die Eliminationsphase geeignet",
              results: "Ergebnisse anzeigen",
              clear: "Filter löschen",
              allSource: "Alle Fodmap-Tracker-Rezepte",
              recipe: "Rezept",
              recipes: "Rezepte",
              scroll: "Scrollen, um alles anzusehen",
              none: "Keine Rezepte entsprechen den Filtern.",
              viewAll: "Alle Rezepte ansehen",
              community: "Aus der Community",
              shared: "geteiltes Rezept",
              sharedMany: "geteilte Rezepte",
              noCommunity: "Andere Nutzer haben noch keine Rezepte geteilt.",
              collection: "Deine Sammlung",
              own: "eigenes Rezept",
              ownMany: "eigene Rezepte",
              newRecipe: "Neues Rezept",
              noOwnSearch: "Keine eigenen Rezepte gefunden.",
              noOwn: "Du hast noch keine eigenen Rezepte gespeichert.",
              first: "Erstes Rezept erstellen",
              footer:
                "Eigene Rezepte sind persönliche Notizen. Quellenadaptationen sind keine medizinische Beratung; Portion und individuelle Verträglichkeit bleiben wichtig.",
            }
          : {
              deleted: "Het recept is verwijderd.",
              failed: "De actie is niet gelukt. Probeer het opnieuw.",
              search: "Zoeken",
              placeholder: "Bijv. kip, ontbijt of chocolade…",
              category: "Categorie",
              allCategories: "Alle categorieën",
              source: "Bron",
              allSources: "Alle bronnen",
              elimination: "Geschikt voor eliminatiefase",
              results: "Resultaten tonen",
              clear: "Filters wissen",
              allSource: "Alle bronrecepten",
              recipe: "recept",
              recipes: "recepten",
              scroll: "Scroll om alles te bekijken",
              none: "Geen recepten passen bij deze filters.",
              viewAll: "Bekijk alle recepten",
              community: "Van de community",
              shared: "gedeeld recept",
              sharedMany: "gedeelde recepten",
              noCommunity:
                "Er zijn nog geen recepten door andere gebruikers gedeeld.",
              collection: "Jouw verzameling",
              own: "eigen recept",
              ownMany: "eigen recepten",
              newRecipe: "Nieuw recept",
              noOwnSearch: "Geen eigen recepten gevonden met deze zoekterm.",
              noOwn: "Je hebt nog geen eigen recepten opgeslagen.",
              first: "Maak je eerste recept",
              footer:
                "Eigen recepten zijn persoonlijke notities. Bronadaptaties zijn geen medisch advies; portiegrootte en individuele tolerantie blijven bepalend.",
            };
  const query = (params.q ?? "").slice(0, 120);
  const normalizedQuery = query.toLocaleLowerCase("nl-NL");
  const eliminationOnly = params.fase === "eliminatie";
  const category = categories.some(([value]) => value === params.categorie)
    ? (params.categorie as MenuMealType)
    : "";
  const source = (params.bron ?? "").slice(0, 100);
  const [recipes, community, curated] = await Promise.all([
    getRecipes(query),
    getPublicRecipes(query),
    getCuratedRecipes(),
  ]);
  const sources = [
    ...new Set(curated.map((recipe) => recipe.source_name)),
  ].sort((a, b) => a.localeCompare(b, "nl-NL"));
  const suggestions = curated.filter(
    (recipe) =>
      (!query ||
        `${recipe.title} ${recipe.summary}`
          .toLocaleLowerCase("nl-NL")
          .includes(normalizedQuery)) &&
      (!eliminationOnly || recipe.suitable_for_elimination) &&
      (!category || recipe.category === category) &&
      (!source || recipe.source_name === source),
  );
  const hasFilters = Boolean(query || eliminationOnly || category || source);

  return (
    <AppShell active="recepten" email={user.email ?? "Account"}>
      <header style={{ marginBottom: 20 }}>
        <div className="eyebrow">{pageText.recipesEyebrow}</div>
        <h1 className="page-title">{pageText.recipesTitle}</h1>
        <p className="subtle">{pageText.recipesIntro}</p>
      </header>
      {params.message && <div className="notice">{ui.deleted}</div>}
      {params.error && <div className="notice notice-error">{ui.failed}</div>}

      <section className="card recipe-filter-card">
        <form className="recipe-filter-grid" action="/recepten">
          <div className="field recipe-search-field">
            <label htmlFor="q">{ui.search}</label>
            <input
              id="q"
              name="q"
              defaultValue={query}
              maxLength={120}
              placeholder={ui.placeholder}
            />
          </div>
          <div className="field">
            <label htmlFor="categorie">{ui.category}</label>
            <select id="categorie" name="categorie" defaultValue={category}>
              <option value="">{ui.allCategories}</option>
              {categories.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="bron">{ui.source}</label>
            <select id="bron" name="bron" defaultValue={source}>
              <option value="">{ui.allSources}</option>
              {sources.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <label className="filter-check">
            <input
              type="checkbox"
              name="fase"
              value="eliminatie"
              defaultChecked={eliminationOnly}
            />{" "}
            {ui.elimination}
          </label>
          <div className="recipe-filter-actions">
            <SubmitButton className="btn">{ui.results}</SubmitButton>
            {hasFilters && (
              <Link className="btn btn-secondary" href="/recepten">
                {ui.clear}
              </Link>
            )}
          </div>
        </form>
      </section>

      <div className="section-heading recipe-section-heading">
        <div>
          <div className="eyebrow">{ui.allSource}</div>
          <h2 className="page-title" style={{ fontSize: 27 }}>
            {suggestions.length}{" "}
            {suggestions.length === 1 ? ui.recipe : ui.recipes}
          </h2>
        </div>
        <span className="subtle">{ui.scroll}</span>
      </div>
      {suggestions.length === 0 ? (
        <section className="card empty">
          <p>{ui.none}</p>
          <Link
            href="/recepten"
            style={{ color: "var(--green)", fontWeight: 700 }}
          >
            {ui.viewAll} →
          </Link>
        </section>
      ) : (
        <RecipeCarousel
          kind="curated"
          recipes={suggestions}
          label="Alle bronrecepten"
          language={language}
        />
      )}

      <div className="section-heading own-recipes-heading">
        <div>
          <div className="eyebrow">{ui.community}</div>
          <h2 className="page-title" style={{ fontSize: 27 }}>
            {community.length}{" "}
            {community.length === 1 ? ui.shared : ui.sharedMany}
          </h2>
        </div>
      </div>
      {community.length === 0 ? (
        <section className="card empty">{ui.noCommunity}</section>
      ) : (
        <RecipeCarousel
          kind="community"
          recipes={community}
          label="Door gebruikers gedeelde recepten"
          language={language}
        />
      )}

      <div className="section-heading own-recipes-heading">
        <div>
          <div className="eyebrow">{ui.collection}</div>
          <h2 className="page-title" style={{ fontSize: 27 }}>
            {recipes.length} {recipes.length === 1 ? ui.own : ui.ownMany}
          </h2>
        </div>
        <Link className="btn" href="/recepten/nieuw">
          + {ui.newRecipe}
        </Link>
      </div>
      {recipes.length === 0 ? (
        <section className="card empty">
          <p>{query ? ui.noOwnSearch : ui.noOwn}</p>
          <Link
            href="/recepten/nieuw"
            style={{ color: "var(--green)", fontWeight: 700 }}
          >
            {ui.first} →
          </Link>
        </section>
      ) : (
        <RecipeCarousel
          kind="own"
          recipes={recipes}
          label="Jouw eigen recepten"
          language={language}
        />
      )}
      <p className="footer-note">{ui.footer}</p>
    </AppShell>
  );
}
