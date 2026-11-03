import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { SubmitButton } from "@/components/SubmitButton";
import { RecipeCarousel } from "@/components/RecipeCarousel";
import { getCuratedRecipes, getPublicRecipes, getRecipes, requireUser } from "@/lib/data";
import { menuMealNames, type MenuMealType } from "@/lib/types";
import { getRequestLanguage } from "@/lib/request-language";
import { appCopy } from "@/lib/app-copy";

export const metadata={title:"Recepten"};

type RecipeSearchParams={q?:string;fase?:string;categorie?:string;bron?:string;message?:string;error?:string};
const categories=Object.entries(menuMealNames) as [MenuMealType,string][];

export default async function RecipesPage({searchParams}:{searchParams:Promise<RecipeSearchParams>}){
 const [{user},params,language]=await Promise.all([requireUser(),searchParams,getRequestLanguage()]);const pageText=appCopy[language].pages;
 const query=(params.q??"").slice(0,120);
 const normalizedQuery=query.toLocaleLowerCase("nl-NL");
 const eliminationOnly=params.fase==="eliminatie";
 const category=categories.some(([value])=>value===params.categorie)?params.categorie as MenuMealType:"";
 const source=(params.bron??"").slice(0,100);
 const [recipes,community,curated]=await Promise.all([getRecipes(query),getPublicRecipes(query),getCuratedRecipes()]);
 const sources=[...new Set(curated.map(recipe=>recipe.source_name))].sort((a,b)=>a.localeCompare(b,"nl-NL"));
 const suggestions=curated.filter(recipe=>(!query||`${recipe.title} ${recipe.summary}`.toLocaleLowerCase("nl-NL").includes(normalizedQuery))&&(!eliminationOnly||recipe.suitable_for_elimination)&&(!category||recipe.category===category)&&(!source||recipe.source_name===source));
 const hasFilters=Boolean(query||eliminationOnly||category||source);

 return <AppShell active="recepten" email={user.email??"Account"}>
  <header style={{marginBottom:20}}><div className="eyebrow">{pageText.recipesEyebrow}</div><h1 className="page-title">{pageText.recipesTitle}</h1><p className="subtle">{pageText.recipesIntro}</p></header>
  {params.message&&<div className="notice">Het recept is verwijderd.</div>}{params.error&&<div className="notice notice-error">De actie is niet gelukt. Probeer het opnieuw.</div>}

  <section className="card recipe-filter-card">
   <form className="recipe-filter-grid" action="/recepten">
    <div className="field recipe-search-field"><label htmlFor="q">Zoeken</label><input id="q" name="q" defaultValue={query} maxLength={120} placeholder="Bijv. kip, ontbijt of chocolade…"/></div>
    <div className="field"><label htmlFor="categorie">Categorie</label><select id="categorie" name="categorie" defaultValue={category}><option value="">Alle categorieën</option>{categories.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div>
    <div className="field"><label htmlFor="bron">Bron</label><select id="bron" name="bron" defaultValue={source}><option value="">Alle bronnen</option>{sources.map(name=><option key={name} value={name}>{name}</option>)}</select></div>
    <label className="filter-check"><input type="checkbox" name="fase" value="eliminatie" defaultChecked={eliminationOnly}/> Geschikt voor eliminatiefase</label>
    <div className="recipe-filter-actions"><SubmitButton className="btn">Resultaten tonen</SubmitButton>{hasFilters&&<Link className="btn btn-secondary" href="/recepten">Filters wissen</Link>}</div>
   </form>
  </section>

  <div className="section-heading recipe-section-heading"><div><div className="eyebrow">Alle bronrecepten</div><h2 className="page-title" style={{fontSize:27}}>{suggestions.length} recept{suggestions.length===1?"":"en"}</h2></div><span className="subtle">Scroll om alles te bekijken</span></div>
  {suggestions.length===0?<section className="card empty"><p>Geen recepten passen bij deze filters.</p><Link href="/recepten" style={{color:"var(--green)",fontWeight:700}}>Bekijk alle recepten →</Link></section>:<RecipeCarousel kind="curated" recipes={suggestions} label="Alle bronrecepten" language={language}/>}

  <div className="section-heading own-recipes-heading"><div><div className="eyebrow">Van de community</div><h2 className="page-title" style={{fontSize:27}}>{community.length} gedeeld{community.length===1?" recept":"e recepten"}</h2></div></div>
  {community.length===0?<section className="card empty">Er zijn nog geen recepten door andere gebruikers gedeeld.</section>:<RecipeCarousel kind="community" recipes={community} label="Door gebruikers gedeelde recepten" language={language}/>}

  <div className="section-heading own-recipes-heading"><div><div className="eyebrow">Jouw verzameling</div><h2 className="page-title" style={{fontSize:27}}>{recipes.length} eigen recept{recipes.length===1?"":"en"}</h2></div><Link className="btn" href="/recepten/nieuw">+ Nieuw recept</Link></div>
  {recipes.length===0?<section className="card empty"><p>{query?"Geen eigen recepten gevonden met deze zoekterm.":"Je hebt nog geen eigen recepten opgeslagen."}</p><Link href="/recepten/nieuw" style={{color:"var(--green)",fontWeight:700}}>Maak je eerste recept →</Link></section>:<RecipeCarousel kind="own" recipes={recipes} label="Jouw eigen recepten" language={language}/>}
  <p className="footer-note">Eigen recepten zijn persoonlijke notities. Bronadaptaties zijn geen medisch advies; portiegrootte en individuele tolerantie blijven bepalend.</p>
 </AppShell>;
}
