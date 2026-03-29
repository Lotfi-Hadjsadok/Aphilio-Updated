/**
 * Fills message values that still match English in each locale file by
 * machine-translating via the public gtx endpoint. Skips ICU plural/select
 * strings (translate those manually if needed). Protects {placeholders}.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, "..", "messages");

/** Keep product name literal in every language */
const NEVER_TRANSLATE_KEYS = new Set(["metadata.appTitle"]);

const GOOGLE_TL = {
  fr: "fr",
  de: "de",
  es: "es",
  it: "it",
  pt: "pt",
  nl: "nl",
  pl: "pl",
  sv: "sv",
  tr: "tr",
  ar: "ar",
  ja: "ja",
  ko: "ko",
  zh: "zh-CN",
  ru: "ru",
  hi: "hi",
};

function flattenMessages(object, prefix = "") {
  const result = {};
  for (const key of Object.keys(object)) {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    const value = object[key];
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenMessages(value, nextPrefix));
    } else {
      result[nextPrefix] = value;
    }
  }
  return result;
}

function unflatten(flat) {
  const root = {};
  for (const dotPath of Object.keys(flat)) {
    const segments = dotPath.split(".");
    let current = root;
    for (let index = 0; index < segments.length - 1; index++) {
      const segment = segments[index];
      if (!current[segment]) current[segment] = {};
      current = current[segment];
    }
    current[segments[segments.length - 1]] = flat[dotPath];
  }
  return root;
}

function setDeep(target, dotPath, value) {
  const segments = dotPath.split(".");
  let current = target;
  for (let index = 0; index < segments.length - 1; index++) {
    const segment = segments[index];
    if (!current[segment]) current[segment] = {};
    current = current[segment];
  }
  current[segments[segments.length - 1]] = value;
}

function shouldSkipMachineTranslate(englishValue) {
  if (typeof englishValue !== "string") return true;
  if (englishValue.includes("plural,")) return true;
  if (englishValue.includes("select,")) return true;
  if (englishValue.includes("selectordinal,")) return true;
  return false;
}

const PLACEHOLDER_TOKEN = /(\{[^{}]+\}|<\/?\s*[a-zA-Z][^>]*>)/g;

function protectPlaceholders(text) {
  const placeholders = [];
  const masked = text.replace(PLACEHOLDER_TOKEN, (match) => {
    const index = placeholders.length;
    placeholders.push(match);
    return `⟦${index}⟧`;
  });
  return { masked, placeholders };
}

function restorePlaceholders(translated, placeholders) {
  let result = translated;
  for (let index = 0; index < placeholders.length; index++) {
    result = result.split(`⟦${index}⟧`).join(placeholders[index]);
  }
  return result;
}

async function translateText(text, targetLang) {
  const { masked, placeholders } = protectPlaceholders(text);
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "en");
  url.searchParams.set("tl", targetLang);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", masked);

  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await sleep(400 * attempt);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        lastError = new Error(`HTTP ${response.status}`);
        continue;
      }
      const data = await response.json();
      const chunk = data?.[0]?.[0]?.[0];
      if (typeof chunk !== "string") {
        lastError = new Error("Unexpected translate response");
        continue;
      }
      return restorePlaceholders(chunk.trim(), placeholders);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error("translate failed");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const english = JSON.parse(fs.readFileSync(path.join(messagesDir, "en.json"), "utf8"));
const flatEnglish = flattenMessages(english);

const manualIcuByLocale = {
  fr: {
    "adCreatives.referenceImages.referenceImageCount":
      "{count, plural, one {# image de référence} other {# images de référence}}",
    "adCreatives.referenceImages.referenceFromSections":
      "parmi {count, plural, one {# section similaire} other {# sections similaires}}",
  },
  de: {
    "adCreatives.referenceImages.referenceImageCount":
      "{count, plural, one {# Referenzbild} other {# Referenzbilder}}",
    "adCreatives.referenceImages.referenceFromSections":
      "aus {count, plural, one {# ähnlichem Abschnitt} other {# ähnlichen Abschnitten}}",
  },
  es: {
    "adCreatives.referenceImages.referenceImageCount":
      "{count, plural, one {# imagen de referencia} other {# imágenes de referencia}}",
    "adCreatives.referenceImages.referenceFromSections":
      "de {count, plural, one {# sección similar} other {# secciones similares}}",
  },
  it: {
    "adCreatives.referenceImages.referenceImageCount":
      "{count, plural, one {# immagine di riferimento} other {# immagini di riferimento}}",
    "adCreatives.referenceImages.referenceFromSections":
      "da {count, plural, one {# sezione simile} other {# sezioni simili}}",
  },
  pt: {
    "adCreatives.referenceImages.referenceImageCount":
      "{count, plural, one {# imagem de referência} other {# imagens de referência}}",
    "adCreatives.referenceImages.referenceFromSections":
      "de {count, plural, one {# secção semelhante} other {# secções semelhantes}}",
  },
  nl: {
    "adCreatives.referenceImages.referenceImageCount":
      "{count, plural, one {# referentieafbeelding} other {# referentieafbeeldingen}}",
    "adCreatives.referenceImages.referenceFromSections":
      "uit {count, plural, one {# vergelijkbare sectie} other {# vergelijkbare secties}}",
  },
  pl: {
    "adCreatives.referenceImages.referenceImageCount":
      "{count, plural, one {# obraz referencyjny} other {# obrazy referencyjne}}",
    "adCreatives.referenceImages.referenceFromSections":
      "z {count, plural, one {# podobnej sekcji} other {# podobnych sekcji}}",
  },
  sv: {
    "adCreatives.referenceImages.referenceImageCount":
      "{count, plural, one {# referensbild} other {# referensbilder}}",
    "adCreatives.referenceImages.referenceFromSections":
      "från {count, plural, one {# liknande sektion} other {# liknande sektioner}}",
  },
  tr: {
    "adCreatives.referenceImages.referenceImageCount":
      "{count, plural, one {# referans görsel} other {# referans görseli}}",
    "adCreatives.referenceImages.referenceFromSections":
      "{count, plural, one {# benzer bölümden} other {# benzer bölümden}}",
  },
  ar: {
    "adCreatives.referenceImages.referenceImageCount":
      "{count, plural, one {# صورة مرجعية} other {# صور مرجعية}}",
    "adCreatives.referenceImages.referenceFromSections":
      "من {count, plural, one {# قسم مشابه} other {# أقسام مشابهة}}",
  },
  ja: {
    "adCreatives.referenceImages.referenceImageCount":
      "{count, plural, other {# 件の参照画像}}",
    "adCreatives.referenceImages.referenceFromSections":
      "{count, plural, other {類似セクション # 件から}}",
  },
  ko: {
    "adCreatives.referenceImages.referenceImageCount":
      "{count, plural, other {참조 이미지 #개}}",
    "adCreatives.referenceImages.referenceFromSections":
      "{count, plural, other {유사 섹션 #개에서}}",
  },
  zh: {
    "adCreatives.referenceImages.referenceImageCount":
      "{count, plural, other {# 张参考图}}",
    "adCreatives.referenceImages.referenceFromSections":
      "{count, plural, other {来自 # 个相似区块}}",
  },
  ru: {
    "adCreatives.referenceImages.referenceImageCount":
      "{count, plural, one {# эталонное изображение} few {# эталонных изображения} many {# эталонных изображений} other {# эталонных изображений}}",
    "adCreatives.referenceImages.referenceFromSections":
      "из {count, plural, one {# похожего раздела} few {# похожих разделов} many {# похожих разделов} other {# похожих разделов}}",
  },
  hi: {
    "adCreatives.referenceImages.referenceImageCount":
      "{count, plural, one {# संदर्भ छवि} other {# संदर्भ छवियाँ}}",
    "adCreatives.referenceImages.referenceFromSections":
      "{count, plural, one {# समान अनुभाग से} other {# समान अनुभागों से}}",
  },
};

async function main() {
  for (const locale of Object.keys(GOOGLE_TL)) {
    const filePath = path.join(messagesDir, `${locale}.json`);
    const localeJson = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const flatLocale = flattenMessages(localeJson);

    const identicalKeys = Object.keys(flatEnglish).filter(
      (key) =>
        typeof flatEnglish[key] === "string" &&
        flatLocale[key] === flatEnglish[key],
    );

    if (identicalKeys.length === 0) {
      console.log(`${locale}: nothing to fill`);
      continue;
    }

    console.log(`${locale}: translating ${identicalKeys.length} strings…`);
    const targetLang = GOOGLE_TL[locale];
    const manualIcu = manualIcuByLocale[locale] ?? {};

    for (const key of identicalKeys) {
      const englishValue = flatEnglish[key];
      if (NEVER_TRANSLATE_KEYS.has(key)) {
        continue;
      }
      if (manualIcu[key]) {
        flatLocale[key] = manualIcu[key];
        continue;
      }
      if (shouldSkipMachineTranslate(englishValue)) {
        console.warn(`  skip ICU/manual: ${key}`);
        continue;
      }
      try {
        flatLocale[key] = await translateText(englishValue, targetLang);
        await sleep(120);
      } catch (error) {
        console.error(`  failed ${key}:`, error.message);
      }
    }

    const merged = unflatten(flatLocale);
    fs.writeFileSync(filePath, `${JSON.stringify(merged, null, 2)}\n`);
    console.log(`${locale}: wrote ${filePath}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
