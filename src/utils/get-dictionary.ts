const dictionaries = {
  "pt-BR": () =>
    import("./dictionaries/pt.json").then((module) => module.default),
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  ja: () => import("./dictionaries/ja.json").then((module) => module.default),
};

export const getDictionary = async (locale: "pt-BR" | "en" | "ja") =>
  dictionaries[locale]();
