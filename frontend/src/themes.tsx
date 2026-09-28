import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Language } from "./strings";

export const themes = [
  {
    id: "premium-dark",
    name: "Premium Dark",
    ru: "Глубокие матовые поверхности",
    en: "Deep, quiet matte surfaces",
  },
  {
    id: "apple-light",
    name: "Apple Light",
    ru: "Светлые нейтральные поверхности",
    en: "Clean, soft neutral surfaces",
  },
  {
    id: "blue-fintech",
    name: "Blue Fintech",
    ru: "Холодный синий и акценты циана",
    en: "Cool blue with cyan accents",
  },
  {
    id: "dark-glass",
    name: "Dark Glass",
    ru: "Тёмное стекло, синий и фиолетовый свет",
    en: "Dark glass with blue and violet light",
  },
  {
    id: "light-glass",
    name: "Light Glass",
    ru: "Светлое стекло над пастельными градиентами",
    en: "Light glass over pastel gradients",
  },
  {
    id: "ios-glass",
    name: "iOS Glass",
    ru: "Стеклянная навигация, чёткие данные",
    en: "Glass navigation, solid data surfaces",
  },
  {
    id: "mocha-code",
    name: "Mocha Code",
    ru: "Тёплый кофе, кремовый и оранжевый",
    en: "Warm coffee, cream and orange",
  },
  {
    id: "chatgpt-dark",
    name: "ChatGPT Dark",
    ru: "Спокойная чёрно-серая палитра",
    en: "Quiet black and gray palette",
  },
  {
    id: "graphite",
    name: "Graphite",
    ru: "Холодный графит, плотные панели",
    en: "Cool graphite with solid panels",
  },
] as const;
export type ThemeId = (typeof themes)[number]["id"];
export const themeKey = "crypto-portfolio-theme";
export function isTheme(value: unknown): value is ThemeId {
  return themes.some((t) => t.id === value);
}
export function readTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(themeKey);
    return isTheme(stored) ? stored : "apple-light";
  } catch {
    return "apple-light";
  }
}
export function applyTheme(id: ThemeId) {
  document.documentElement.dataset.theme = id;
}
const ThemeContext = createContext<{
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
  storageWarning: boolean;
}>({ theme: "apple-light", setTheme: () => {}, storageWarning: false });
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, update] = useState(readTheme);
  const [storageWarning, setWarning] = useState(false);
  function setTheme(id: ThemeId) {
    update(id);
    applyTheme(id);
    try {
      localStorage.setItem(themeKey, id);
      setWarning(false);
    } catch {
      setWarning(true);
    }
  }
  useEffect(() => {
    applyTheme(theme);
    const listener = (e: StorageEvent) => {
      if (e.key === themeKey && isTheme(e.newValue)) {
        update(e.newValue);
        applyTheme(e.newValue);
      }
    };
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, [theme]);
  return (
    <ThemeContext.Provider value={{ theme, setTheme, storageWarning }}>
      {children}
    </ThemeContext.Provider>
  );
}
export function ThemePicker({ language }: { language: Language }) {
  const { theme, setTheme, storageWarning } = useContext(ThemeContext);
  return (
    <div className="theme-picker">
      <label>
        <span>{language === "ru" ? "Оформление" : "Appearance"}</span>
        <select
          aria-label={language === "ru" ? "Тема" : "Theme"}
          value={theme}
          onChange={(e) => setTheme(e.target.value as ThemeId)}
        >
          {themes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>
      {storageWarning && (
        <small role="status">
          {language === "ru"
            ? "Тема действует до закрытия страницы: сохранение недоступно."
            : "Theme applies until this page closes: storage unavailable."}
        </small>
      )}
    </div>
  );
}
export function Appearance({ language }: { language: Language }) {
  const { theme, setTheme } = useContext(ThemeContext);
  return (
    <section className="panel settings-card">
      <h2>
        {language === "ru"
          ? "Выберите своё оформление"
          : "Choose your appearance"}
      </h2>
      <p>
        {language === "ru"
          ? "Меняется только внешний вид. Покупки, котировки и расчёты остаются прежними."
          : "Only the appearance changes. Purchases, quotes and calculations stay the same."}
      </p>
      <div className="theme-grid">
        {themes.map((t) => (
          <button
            type="button"
            className="theme-option"
            key={t.id}
            data-preview={t.id}
            aria-pressed={theme === t.id}
            onClick={() => setTheme(t.id)}
          >
            <span className="theme-swatch">
              <i />
              <i />
              <i />
            </span>
            <strong>
              {t.name}
              {theme === t.id ? " ✓" : ""}
            </strong>
            <span>{t[language]}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
