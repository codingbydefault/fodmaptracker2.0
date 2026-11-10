import { describe, expect, it } from "vitest";
import { articleCopy } from "@/lib/article-copy";
import { testResultLine, testResultsCopy } from "@/lib/test-results-copy";

describe("public news labels", () => {
  it("uses the news name for navigation, titles and the category label", () => {
    expect(articleCopy.nl.articles).toBe("Nieuws");
    expect(articleCopy.nl.latestTitle).toBe("Nieuws en recepten");
    expect(articleCopy.en.latestTitle).toBe("News and recipes");
    expect(articleCopy.fr.latestTitle).toBe("Actualités et recettes");
    expect(articleCopy.de.latestTitle).toBe("Neuigkeiten und Rezepte");
    expect(articleCopy.nl.overviewTitle).toBe("Nieuws");
    expect(articleCopy.nl.guides).toBe("Nieuws");
    expect(articleCopy.en.overviewTitle).toBe("News");
    expect(articleCopy.de.overviewTitle).toBe("Neuigkeiten");
    expect(articleCopy.fr.overviewTitle).toBe("Actualités");
    expect(articleCopy.nl.overviewBody).not.toMatch(/gids/i);
    expect(articleCopy.nl.empty).toBe("Geen nieuws met deze filters.");
  });
});

describe("test results labels", () => {
  it("uses the less clinical name and a matching print filename", () => {
    expect(testResultsCopy.nl.title).toBe("Mijn testresultaten");
    expect(testResultsCopy.nl.fileName).toBe("Mijn testresultaten");
    expect(testResultsCopy.en.title).toBe("My test results");
    expect(testResultsCopy.en.fileName).toBe("My test results");
    expect(testResultsCopy.de.title).toBe("Meine Testergebnisse");
    expect(testResultsCopy.fr.title).toBe("Mes résultats de test");
    expect(testResultsCopy.nl.note).toContain("zelf hebt ingevoerd");
    expect(testResultLine(testResultsCopy.nl.severity, 4, "2026-11-10")).toBe("Hoogste ernst: 4/10 · getest 2026-11-10");
  });
});
