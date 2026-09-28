import { useEffect, useRef, useState } from "react";
import {
  calculatePortfolio,
  coins,
  emptyPortfolio,
  parsePortfolio,
  recordSnapshot,
  today,
  validatePurchase,
  type Market,
  type Portfolio,
  type Purchase,
  type Snapshot,
} from "./domain";
import { fetchMarket, marketKey, readMarket } from "./market";
import { strings, type Language, type Text } from "./strings";
import {
  decimal,
  decimalInput,
  freshQuote,
  quoteInput,
} from "./purchase-input";
import { Appearance, ThemePicker } from "./themes";

const portfolioKey = "folio.portfolio.v1";
const money = (value: number | null, language: Language = "en") =>
  value === null
    ? "—"
    : new Intl.NumberFormat(language === "ru" ? "ru-RU" : "en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: value > 0 && value < 1 ? 5 : 2,
      }).format(value);
const number = (value: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 8 }).format(value);
const percent = (value: number | null) =>
  value === null ? "—" : `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
function readInitial() {
  try {
    const raw = localStorage.getItem(portfolioKey);
    return {
      portfolio: raw ? parsePortfolio(raw) : emptyPortfolio(),
      error: "",
    };
  } catch {
    return { portfolio: emptyPortfolio(), error: "corrupt" };
  }
}
function download(
  content: string,
  filename: string,
  type = "application/json",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Icon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    overview: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
    purchases: "M7 3h10v18l-5-3-5 3z M10 7h4 M10 11h4",
    markets: "M3 17l5-7 5 3 8-10 M3 21h18",
    assets: "M4 5h16v15H4z M4 9h16 M14 13h6 M16 16h1",
    appearance:
      "M12 3a9 9 0 1 0 9 9c0-2-3-2-4-1s-4 1-3-2 0-6-2-6z M7 8h.01 M6 13h.01 M10 17h.01",
    settings: "M4 7h16 M4 17h16 M8 4v6 M16 14v6",
    plus: "M12 5v14 M5 12h14",
    refresh: "M20 7a9 9 0 1 0 1 8 M20 2v5h-5",
    arrow: "M5 12h14 M13 6l6 6-6 6",
    shield: "M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6z M8 12l3 3 5-6",
  };
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] ?? paths.overview} />
    </svg>
  );
}
function CoinMark({ symbol }: { symbol: string }) {
  const coin = coins.find((c) => c[0] === symbol)!;
  return (
    <span
      className="coin-mark"
      style={{ "--coin": coin[2] } as React.CSSProperties}
      aria-hidden="true"
    >
      {symbol === "BTC" ? "₿" : symbol.slice(0, 1)}
    </span>
  );
}
function Modal({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const dialog = ref.current!;
    dialog.showModal();
    dialog.querySelector<HTMLInputElement>('input[name="quantity"]')?.focus();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={close}
      aria-labelledby="dialog-title"
      onKeyDown={(e) => {
        if (e.key !== "Tab") return;
        const controls = Array.from(
          e.currentTarget.querySelectorAll<HTMLElement>(
            "button, input, select, textarea, a[href], [tabindex]",
          ),
        ).filter(
          (el) =>
            el.tabIndex >= 0 &&
            !el.hasAttribute("disabled") &&
            !el.hasAttribute("hidden"),
        );
        const first = controls[0],
          last = controls.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="dialog-body">
        <div className="section-heading">
          <h2 id="dialog-title">{title}</h2>
          <button
            className="icon-button"
            onClick={close}
            aria-label="Close / Закрыть"
          >
            ×
          </button>
        </div>
        {children}
        <ThemePicker
          language={document.documentElement.lang === "en" ? "en" : "ru"}
        />
      </div>
    </dialog>
  );
}
function PurchaseForm({
  purchase,
  symbol,
  save,
  close,
  t,
  language,
  market,
  quoteUnavailable,
}: {
  purchase?: Purchase;
  symbol?: string;
  save: (value: Purchase) => boolean;
  close: () => void;
  t: Text;
  language: Language;
  market: Market | null;
  quoteUnavailable: boolean;
}) {
  const [selectedSymbol, setSelectedSymbol] = useState(
    purchase?.symbol ?? symbol ?? "BTC",
  );
  const [purchaseId] = useState(() => purchase?.id ?? crypto.randomUUID());
  const submitted = useRef(false);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(
    purchase ? decimalInput(purchase.quantity) : "",
  );
  const [price, setPrice] = useState(() =>
    purchase
      ? decimalInput(purchase.price)
      : quoteInput(
          symbol ? freshQuote(market, symbol, quoteUnavailable) : null,
        ),
  );
  const [fee, setFee] = useState(decimalInput(purchase?.fee ?? 0));
  const quote = freshQuote(market, selectedSymbol, quoteUnavailable);
  const cost = decimal(quantity) * decimal(price) + decimal(fee);
  return (
    <Modal title={purchase ? t.edit : t.add} close={close}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (submitted.current) return;
          const form = new FormData(e.currentTarget);
          try {
            const value = validatePurchase({
              id: purchaseId,
              symbol: form.get("symbol"),
              quantity: decimal(quantity),
              price: decimal(price),
              fee: decimal(fee),
              date: form.get("date"),
              note: form.get("note"),
            } as Purchase);
            submitted.current = true;
            if (save(value)) close();
            else {
              submitted.current = false;
              setError(t.storageError);
            }
          } catch {
            setError(t.invalidPurchase);
          }
        }}
      >
        <label>
          {t.coin}
          <select
            name="symbol"
            aria-label={t.coin}
            value={selectedSymbol}
            onChange={(e) => {
              setSelectedSymbol(e.target.value);
              setPrice(
                quoteInput(
                  freshQuote(market, e.target.value, quoteUnavailable),
                ),
              );
            }}
          >
            {coins.map(([s, name]) => (
              <option key={s} value={s}>
                {name} · {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t.quantity}
          <input
            autoFocus
            name="quantity"
            type="text"
            min="0.000000000001"
            max="1000000000000"
            step="any"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0.00"
            inputMode="decimal"
          />
        </label>
        <div className="form-row">
          <label>
            {t.purchasePrice}
            <input
              name="price"
              type="text"
              min="0"
              max="1000000000000"
              step="any"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              inputMode="decimal"
            />
          </label>
          <label>
            {t.fee}
            <input
              name="fee"
              type="text"
              min="0"
              max="1000000000000"
              step="any"
              required
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              inputMode="decimal"
            />
          </label>
        </div>
        <div className="quote-hint" aria-live="polite">
          <p>
            {quote === null
              ? t.manualQuote
              : `${t.quoteHint}: ${money(quote, language)} · ${market?.source}`}
          </p>
          <p>{t.historicalPrice}</p>
          {quote !== null && (
            <button type="button" onClick={() => setPrice(quoteInput(quote))}>
              {t.useQuote}
            </button>
          )}
        </div>
        <label>
          {t.date}
          <input
            name="date"
            type="date"
            required
            max={today()}
            defaultValue={purchase?.date ?? today()}
          />
        </label>
        <label>
          {t.note}
          <input
            name="note"
            maxLength={200}
            defaultValue={purchase?.note ?? ""}
            placeholder={t.notePlaceholder}
          />
        </label>
        <div className="form-total">
          <span>{t.purchaseTotal}</span>
          <strong>
            {money(Number.isFinite(cost) ? cost : null, language)}
          </strong>
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <button type="button" onClick={close}>
            {t.cancel}
          </button>
          <button className="primary" type="submit">
            {t.save}
          </button>
        </div>
      </form>
    </Modal>
  );
}
function History({
  snapshots,
  t,
  language,
}: {
  snapshots: Snapshot[];
  t: Text;
  language: Language;
}) {
  const [range, setRange] = useState(0);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - range);
  const points = snapshots.filter(
    (s) => !range || Date.parse(s.date) >= cutoff.getTime(),
  );
  const max = Math.max(...points.flatMap((s) => [s.value, s.cost]), 1) * 1.1;
  const path = (field: "value" | "cost") =>
    points
      .map(
        (s, i) =>
          `${i ? "L" : "M"}${40 + (i / Math.max(points.length - 1, 1)) * 620},${180 - (s[field] / max) * 150}`,
      )
      .join(" ");
  return (
    <section className="panel history">
      <div className="section-heading">
        <h2>{t.history}</h2>
        <div className="segments" aria-label={t.history}>
          {[7, 30, 0].map((n) => (
            <button
              key={n}
              aria-pressed={range === n}
              onClick={() => setRange(n)}
            >
              {n ? `${n}D` : "ALL"}
            </button>
          ))}
        </div>
      </div>
      {points.length < 2 ? (
        <div className="history-empty">
          <span className="empty-chart" aria-hidden="true">
            ▁ ┄ ┄ ┄ ┄ ┄
          </span>
          <h3>{t.historyEmpty}</h3>
          <p>{t.historyEmptyHelp}</p>
        </div>
      ) : (
        <>
          <div className="chart-legend">
            <span>
              <i />
              {t.observed}
            </span>
            <span>
              <i className="cost-dot" />
              {t.costLine}
            </span>
          </div>
          <svg
            className="history-chart"
            viewBox="0 0 700 220"
            role="img"
            aria-label={t.history}
          >
            <defs>
              <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--chart-line)"
                  stopOpacity=".16"
                />
                <stop
                  offset="100%"
                  stopColor="var(--chart-line)"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
            {[30, 80, 130, 180].map((y) => (
              <line
                key={y}
                x1="40"
                x2="660"
                y1={y}
                y2={y}
                stroke="var(--line)"
              />
            ))}
            <path d={`${path("value")} L660,180 L40,180 Z`} fill="url(#fill)" />
            <path
              d={path("cost")}
              fill="none"
              stroke="var(--chart-cost)"
              strokeWidth="2"
              strokeDasharray="5 5"
            />
            <path
              d={path("value")}
              fill="none"
              stroke="var(--chart-line)"
              strokeWidth="3"
            />
            {points.map((s, i) => (
              <circle
                key={s.date}
                cx={40 + (i / Math.max(points.length - 1, 1)) * 620}
                cy={180 - (s.value / max) * 150}
                r="4"
                fill="var(--chart-line)"
              >
                <title>
                  {s.date}: {money(s.value, language)}
                </title>
              </circle>
            ))}
            <text x="40" y="210">
              {points[0]?.date}
            </text>
            <text x="660" y="210" textAnchor="end">
              {points.at(-1)?.date}
            </text>
            <text x="40" y="20">
              {money(max, language)}
            </text>
          </svg>
        </>
      )}
      <p className="caption">{t.historyHelp}</p>
      {points.length > 0 && (
        <details>
          <summary>{t.historyTable}</summary>
          <div
            className="table-scroll"
            tabIndex={0}
            role="region"
            aria-label={t.history}
          >
            <table>
              <thead>
                <tr>
                  <th>{t.snapshotDate}</th>
                  <th>{t.observed}</th>
                  <th>{t.costLine}</th>
                </tr>
              </thead>
              <tbody>
                {points
                  .slice()
                  .reverse()
                  .map((s) => (
                    <tr key={s.date}>
                      <td>{s.date}</td>
                      <td>{money(s.value, language)}</td>
                      <td>{money(s.cost, language)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </section>
  );
}
type Page =
  "overview" | "assets" | "purchases" | "markets" | "settings" | "appearance";
const pages: Page[] = [
  "overview",
  "assets",
  "markets",
  "purchases",
  "settings",
  "appearance",
];
const readPage = (): Page =>
  pages.includes(location.hash.slice(1) as Page)
    ? (location.hash.slice(1) as Page)
    : "overview";
export default function App() {
  const [initial] = useState(readInitial);
  const [portfolio, setPortfolio] = useState(initial.portfolio);
  const [storageError, setStorageError] = useState(initial.error);
  const [language, setLanguage] = useState<Language>(() => {
    try {
      return localStorage.getItem("folio.language") === "en" ? "en" : "ru";
    } catch {
      return "ru";
    }
  });
  const t = strings[language];
  const [page, setPage] = useState<Page>(readPage);
  const [market, setMarket] = useState<Market | null>(readMarket);
  const [loading, setLoading] = useState(true);
  const [marketError, setMarketError] = useState(false);
  const [clock, setClock] = useState(Date.now());
  const [refresh, setRefresh] = useState(0);
  const [form, setForm] = useState<{
    purchase?: Purchase;
    symbol?: string;
  } | null>(null);
  const [deleting, setDeleting] = useState<Purchase | null>(null);
  const [undo, setUndo] = useState<Purchase | null>(null);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [importing, setImporting] = useState<Portfolio | null>(null);
  const [importError, setImportError] = useState(false);
  const importInput = useRef<HTMLInputElement>(null);
  const current = useRef(portfolio);
  current.current = portfolio;
  const totals = calculatePortfolio(portfolio.purchases, market);
  const stale =
    !!market && (marketError || clock - Date.parse(market.fetchedAt) > 300000);
  useEffect(() => {
    const handler = () => setPage(readPage());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem("folio.language", language);
    } catch {
      /* Настройки языка не блокируют работу. */
    }
  }, [language]);
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === portfolioKey) {
        try {
          const next = e.newValue
            ? parsePortfolio(e.newValue)
            : emptyPortfolio();
          current.current = next;
          setPortfolio(next);
          setStorageError("");
        } catch {
          setStorageError("corrupt");
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    async function update() {
      setLoading(true);
      try {
        const next = await fetchMarket(controller.signal);
        if (controller.signal.aborted) return;
        setMarket(next);
        setMarketError(false);
        setClock(Date.now());
        try {
          localStorage.setItem(marketKey, JSON.stringify(next));
        } catch {
          /* Кэш котировок необязателен. */
        }
      } catch {
        if (!controller.signal.aborted) setMarketError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void update();
    const interval = setInterval(() => {
      if (!document.hidden) void update();
    }, 120000);
    const timer = setInterval(() => setClock(Date.now()), 30000);
    return () => {
      controller.abort();
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [refresh]);
  useEffect(() => {
    if (!market || storageError) return;
    const next = recordSnapshot(current.current, market);
    if (next === current.current) return;
    try {
      localStorage.setItem(portfolioKey, JSON.stringify(next));
      current.current = next;
      setPortfolio(next);
    } catch {
      setStorageError("storageError");
    }
  }, [market, portfolio.purchases, storageError]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 7000);
    return () => clearTimeout(timer);
  }, [notice]);
  function commit(next: Portfolio, recover = false) {
    if (storageError === "corrupt" && !recover) return false;
    try {
      localStorage.setItem(portfolioKey, JSON.stringify(next));
      current.current = next;
      setPortfolio(next);
      setStorageError("");
      return true;
    } catch {
      setStorageError("storageError");
      return false;
    }
  }
  function save(purchase: Purchase) {
    const next = {
      ...current.current,
      purchases: [
        ...current.current.purchases.filter((p) => p.id !== purchase.id),
        purchase,
      ],
    };
    const success = commit(
      market && !stale ? recordSnapshot(next, market) : next,
    );
    if (success) {
      setNotice(t.saved);
      setUndo(null);
    }
    return success;
  }
  function exportBackup() {
    download(JSON.stringify(current.current, null, 2), `folio-${today()}.json`);
    setNotice(t.backupReady);
  }
  const recent = [...portfolio.purchases].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const purchaseRows = (list: Purchase[]) => (
    <div
      className="table-scroll"
      tabIndex={0}
      role="region"
      aria-label={t.purchases}
    >
      <table>
        <thead>
          <tr>
            <th>{t.coin}</th>
            <th>{t.date}</th>
            <th>{t.quantity}</th>
            <th>{t.purchaseTotal}</th>
            <th>{t.actions}</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.id}>
              <td>
                <div className="coin-cell">
                  <CoinMark symbol={p.symbol} />
                  <div>
                    <strong>{p.symbol}</strong>
                    {p.note && <small className="note">{p.note}</small>}
                  </div>
                </div>
              </td>
              <td>{p.date}</td>
              <td>{number(p.quantity)}</td>
              <td>{money(p.quantity * p.price + p.fee, language)}</td>
              <td>
                <div className="row-actions">
                  <button
                    onClick={(e) => {
                      e.currentTarget.focus();
                      setForm({ purchase: p });
                    }}
                    aria-label={`${t.edit} ${p.symbol}`}
                  >
                    {t.edit}
                  </button>
                  <button
                    className="danger-text"
                    onClick={(e) => {
                      e.currentTarget.focus();
                      setDeleting(p);
                    }}
                    aria-label={`${t.remove} ${p.symbol}`}
                  >
                    {t.remove}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content / К содержимому
      </a>
      <aside className="sidebar">
        <a className="brand" href="#overview" aria-label="Folio">
          <span className="brand-icon">
            f<span>•</span>
          </span>
          folio<span className="brand-period">.</span>
        </a>
        <div className="workspace-label">{t.portfolioLabel}</div>
        <nav aria-label={t.portfolio}>
          {pages.map((p) => (
            <a
              key={p}
              aria-label={t[p]}
              href={`#${p}`}
              className={page === p ? "active" : ""}
              aria-current={page === p ? "page" : undefined}
            >
              <Icon name={p} />
              <span>{t[p]}</span>
              {p === "purchases" && portfolio.purchases.length > 0 && (
                <small>{portfolio.purchases.length}</small>
              )}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="privacy-icon">
            <Icon name="shield" />
          </div>
          <strong>{t.local}</strong>
          <p>{t.localHelp}</p>
          <button onClick={exportBackup}>
            {t.export}
            <Icon name="arrow" />
          </button>
        </div>
        <div className="profile">
          <span>G</span>
          <div>
            <strong>Folio</strong>
            <small>USD · {t.local}</small>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span className="breadcrumb">
            {t.portfolio} <span>/</span> <strong>{t[page]}</strong>
          </span>
          <div className="topbar-actions">
            <ThemePicker language={language} />
            <span
              className={`price-status ${stale || marketError ? "warn" : ""}`}
            >
              <i />
              {loading
                ? t.refreshing
                : market
                  ? stale
                    ? t.staleShort
                    : `${market.source} · USD`
                  : t.unknown}
            </span>
            <select
              aria-label={t.language}
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
            >
              <option value="en">EN</option>
              <option value="ru">RU</option>
            </select>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          <div className="page-heading">
            <div>
              <p className="eyebrow">FOLIO / {t[page].toUpperCase()}</p>
              <h1>{page === "overview" ? t.portfolio : t[page]}</h1>
              <p>
                {page === "overview"
                  ? t.subtitle
                  : page === "purchases"
                    ? t.ledgerHelp
                    : page === "markets"
                      ? t.marketHelp
                      : page === "assets"
                        ? t.assetsHelp
                        : page === "appearance"
                          ? t.appearanceHelp
                          : t.localHelp}
              </p>
            </div>
            <button
              className="primary"
              onClick={(e) => {
                e.currentTarget.focus();
                setForm({});
              }}
              disabled={storageError === "corrupt"}
            >
              <Icon name="plus" />
              {t.add}
            </button>
          </div>
          {storageError && (
            <div role="alert" className="banner error">
              {storageError === "corrupt" ? t.corrupt : t.storageError}
              {storageError === "corrupt" && (
                <button
                  onClick={() => {
                    try {
                      download(
                        localStorage.getItem(portfolioKey) || "",
                        "folio-recovery.txt",
                        "text/plain",
                      );
                    } catch {
                      setNotice(t.storageError);
                    }
                  }}
                >
                  {t.recovery}
                </button>
              )}
            </div>
          )}
          {(stale || marketError) && (
            <div className="banner" role="status">
              {market ? t.stale : t.offline}
              <button
                onClick={() => setRefresh((n) => n + 1)}
                disabled={loading}
              >
                {t.refresh}
              </button>
            </div>
          )}
          {page === "overview" && (
            <>
              <section className="stats" aria-label={t.overview}>
                <div className="stat featured">
                  <span>{t.value}</span>
                  <strong>{money(totals.value, language)}</strong>
                  <small>{stale ? t.staleShort : t.estimated}</small>
                  <span className="stat-orbit" aria-hidden="true" />
                </div>
                <div className="stat">
                  <span>{t.cost}</span>
                  <strong>{money(totals.cost, language)}</strong>
                  <small>{t.feesIncluded}</small>
                </div>
                <div className="stat">
                  <span>{t.pnl}</span>
                  <strong
                    className={
                      totals.pnl !== null && totals.pnl < 0
                        ? "negative"
                        : "positive"
                    }
                  >
                    {money(totals.pnl, language)}
                  </strong>
                  <small>{t.unrealized}</small>
                </div>
                <div className="stat">
                  <span>{t.roi}</span>
                  <strong
                    className={
                      totals.roi !== null && totals.roi < 0
                        ? "negative"
                        : "positive"
                    }
                  >
                    {percent(totals.roi)}
                  </strong>
                  <small>{t.costLine}</small>
                </div>
              </section>
              {!portfolio.purchases.length && (
                <section className="onboarding">
                  <div className="onboarding-mark" aria-hidden="true">
                    <CoinMark symbol="BTC" />
                    <CoinMark symbol="ETH" />
                    <CoinMark symbol="SOL" />
                  </div>
                  <div>
                    <h2>{t.empty}</h2>
                    <p>{t.emptyHelp}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.currentTarget.focus();
                      setForm({});
                    }}
                  >
                    {t.start}
                    <Icon name="arrow" />
                  </button>
                </section>
              )}
              <div className="analytics-grid">
                <History
                  snapshots={portfolio.snapshots}
                  t={t}
                  language={language}
                />
                <section className="panel allocation">
                  <div className="section-heading">
                    <h2>{t.allocation}</h2>
                    <span className="badge">{totals.positions.length}</span>
                  </div>
                  <div
                    className="allocation-ring"
                    style={{
                      background:
                        totals.value && totals.positions.length
                          ? `conic-gradient(${totals.positions.map((p, i, all) => `${`var(--chart-${(i % 6) + 1})`} ${(all.slice(0, i).reduce((s, c) => s + (c.value ?? 0), 0) / totals.value!) * 100}% ${(all.slice(0, i + 1).reduce((s, c) => s + (c.value ?? 0), 0) / totals.value!) * 100}%`).join(",")})`
                          : undefined,
                    }}
                  >
                    <div>
                      <strong>{totals.positions.length}</strong>
                      <span>{t.holdings}</span>
                    </div>
                  </div>
                  <div className="allocation-list">
                    {totals.positions.length ? (
                      totals.positions.map((p, i) => (
                        <div key={p.symbol}>
                          <span>
                            <i
                              style={{
                                background: `var(--chart-${(i % 6) + 1})`,
                              }}
                            />
                            {p.name}
                          </span>
                          <strong>
                            {totals.value
                              ? `${(((p.value ?? 0) / totals.value) * 100).toFixed(1)}%`
                              : "—"}
                          </strong>
                        </div>
                      ))
                    ) : (
                      <p>{t.noPositions}</p>
                    )}
                  </div>
                </section>
              </div>
              <section className="panel holdings-preview">
                <div className="section-heading">
                  <h2>{t.holdings}</h2>
                  <a href="#assets">{t.assets} →</a>
                </div>
                <div className="holdings-preview-list">
                  {totals.positions.length ? (
                    totals.positions.slice(0, 3).map((p) => (
                      <div className="holding-preview" key={p.symbol}>
                        <CoinMark symbol={p.symbol} />
                        <span>
                          {p.name}
                          <small>
                            {number(p.quantity)} {p.symbol}
                          </small>
                        </span>
                        <strong>{money(p.value, language)}</strong>
                      </div>
                    ))
                  ) : (
                    <p className="empty-inline">{t.noPositions}</p>
                  )}
                </div>
              </section>
            </>
          )}
          {page === "assets" && (
            <section className="panel holdings">
              <div className="section-heading">
                <h2>{t.holdings}</h2>
                <span className="caption">USD</span>
              </div>
              {totals.positions.length ? (
                <div
                  className="table-scroll"
                  tabIndex={0}
                  role="region"
                  aria-label={t.holdings}
                >
                  <table>
                    <thead>
                      <tr>
                        <th>{t.coin}</th>
                        <th>{t.price}</th>
                        <th>{t.quantity}</th>
                        <th>{t.average}</th>
                        <th>{t.total}</th>
                        <th>{t.pnl}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {totals.positions.map((p) => (
                        <tr key={p.symbol}>
                          <td>
                            <div className="coin-cell">
                              <CoinMark symbol={p.symbol} />
                              <div>
                                <strong>{p.name}</strong>
                                <small>{p.symbol}</small>
                              </div>
                            </div>
                          </td>
                          <td>{money(p.price, language)}</td>
                          <td>{number(p.quantity)}</td>
                          <td>{money(p.average, language)}</td>
                          <td className="strong">{money(p.value, language)}</td>
                          <td
                            className={
                              p.pnl !== null && p.pnl < 0
                                ? "negative"
                                : "positive"
                            }
                          >
                            {money(p.pnl, language)}
                            <small>{percent(p.roi)}</small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="empty-inline">{t.noPositions}</p>
              )}
            </section>
          )}
          {page === "appearance" && <Appearance language={language} />}
          {page === "purchases" && (
            <section className="panel">
              <div className="section-heading">
                <h2>
                  {t.purchases} <span className="badge">{recent.length}</span>
                </h2>
                <button
                  disabled={!recent.length}
                  onClick={() => {
                    const escape = (v: unknown) =>
                      `"${String(v)
                        .replace(/^[=+@-]/, "'$&")
                        .replaceAll('"', '""')}"`;
                    download(
                      [
                        "symbol,date,quantity,price_usd,fee_usd,note",
                        ...recent.map((p) =>
                          [p.symbol, p.date, p.quantity, p.price, p.fee, p.note]
                            .map(escape)
                            .join(","),
                        ),
                      ].join("\r\n"),
                      `folio-purchases-${today()}.csv`,
                      "text/csv;charset=utf-8",
                    );
                  }}
                >
                  {t.exportCsv}
                </button>
              </div>
              {recent.length ? (
                purchaseRows(recent)
              ) : (
                <div className="empty-inline">
                  <h2>{t.empty}</h2>
                  <p>{t.emptyHelp}</p>
                  <button
                    className="primary"
                    onClick={(e) => {
                      e.currentTarget.focus();
                      setForm({});
                    }}
                  >
                    {t.add}
                  </button>
                </div>
              )}
              <p className="caption panel-footnote">{t.deleteHistory}</p>
            </section>
          )}
          {page === "markets" && (
            <section className="panel">
              <div className="section-heading">
                <h2>{t.supported}</h2>
                <input
                  className="search"
                  type="search"
                  aria-label={t.search}
                  placeholder={t.search}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="market-grid">
                {coins
                  .filter((c) =>
                    `${c[0]} ${c[1]}`
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                  )
                  .map(([symbol, name]) => (
                    <article className="market-card" key={symbol}>
                      <div className="coin-cell">
                        <CoinMark symbol={symbol} />
                        <div>
                          <strong>{name}</strong>
                          <small>{symbol}</small>
                        </div>
                      </div>
                      <strong className="market-price">
                        {money(market?.quotes[symbol]?.price ?? null, language)}
                      </strong>
                      <button
                        onClick={(e) => {
                          e.currentTarget.focus();
                          setForm({ symbol });
                        }}
                      >
                        <Icon name="plus" />
                        {t.add}
                      </button>
                    </article>
                  ))}
              </div>
              {!coins.some((c) =>
                `${c[0]} ${c[1]}`.toLowerCase().includes(query.toLowerCase()),
              ) && <p className="empty-inline">{t.noResults}</p>}
            </section>
          )}
          {page === "settings" && (
            <div className="settings-grid">
              <section className="panel settings-card">
                <Icon name="shield" />
                <h2>{t.backup}</h2>
                <p>{t.localHelp}</p>
                <div className="backup-count">
                  <strong>{portfolio.purchases.length}</strong>
                  <span>{t.records}</span>
                </div>
                <div className="settings-actions">
                  <button className="primary" onClick={exportBackup}>
                    {t.export}
                  </button>
                  <button
                    onClick={(e) => {
                      e.currentTarget.focus();
                      importInput.current?.click();
                    }}
                  >
                    {t.import}
                  </button>
                </div>
                <input
                  hidden
                  ref={importInput}
                  type="file"
                  accept=".json,application/json"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    try {
                      if (file.size > 5000000) throw new Error();
                      setImporting(parsePortfolio(await file.text()));
                      setImportError(false);
                    } catch {
                      setImportError(true);
                    }
                  }}
                />
                <p className="caption">{t.importHelp}</p>
                {importError && (
                  <p role="alert" className="error">
                    {t.invalidBackup}
                  </p>
                )}
              </section>
              <section className="panel settings-card">
                <h2>{t.privacy}</h2>
                <p>{t.privacyHelp}</p>
                <hr />
                <h2>{t.method}</h2>
                <p>{t.methodHelp}</p>
                <hr />
                <h2>{t.about}</h2>
                <p>{t.aboutHelp}</p>
                <a
                  href="https://github.com/godaylor/crypto-portfolio"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub ↗
                </a>
              </section>
            </div>
          )}
          <footer>
            <div>
              <span className="source-dot" /> {t.source}:{" "}
              <a
                href={
                  market?.source === "Kraken"
                    ? "https://www.kraken.com/prices"
                    : "https://www.coinbase.com/converter"
                }
                target="_blank"
                rel="noreferrer"
              >
                {market?.source ?? "Coinbase / Kraken"} ↗
              </a>
              <span className="source-time" title={t.dataTimeHelp}>
                {market
                  ? `${t.fetched}: ${new Date(market.fetchedAt).toLocaleString(language === "ru" ? "ru-RU" : "en-US")}`
                  : t.unknown}
              </span>
            </div>
            <button onClick={() => setRefresh((n) => n + 1)} disabled={loading}>
              <Icon name="refresh" />
              {loading ? t.refreshing : t.refresh}
            </button>
          </footer>
        </main>
      </div>
      {notice && (
        <div className="toast" role="status">
          ✓ {notice}
          {undo && (
            <button
              onClick={() => {
                if (save(undo)) setUndo(null);
              }}
            >
              {t.undo}
            </button>
          )}
        </div>
      )}
      {form && (
        <PurchaseForm
          {...form}
          save={save}
          close={() => setForm(null)}
          t={t}
          language={language}
          market={market}
          quoteUnavailable={stale || marketError}
        />
      )}
      {deleting && (
        <Modal
          title={`${t.remove} ${deleting.symbol}`}
          close={() => setDeleting(null)}
        >
          <p>{t.confirmDelete}</p>
          <div className="dialog-actions">
            <button onClick={() => setDeleting(null)}>{t.cancel}</button>
            <button
              className="danger"
              onClick={() => {
                const next = {
                  ...current.current,
                  purchases: current.current.purchases.filter(
                    (p) => p.id !== deleting.id,
                  ),
                };
                if (
                  commit(market && !stale ? recordSnapshot(next, market) : next)
                ) {
                  setUndo(deleting);
                  setNotice(t.deleted);
                  setDeleting(null);
                }
              }}
            >
              {t.remove}
            </button>
          </div>
        </Modal>
      )}
      {importing && (
        <Modal title={t.importReview} close={() => setImporting(null)}>
          <p>{t.importWarning}</p>
          <p>
            <strong>
              {t.backupCount}: {importing.purchases.length}
            </strong>
          </p>
          <div className="dialog-actions">
            <button onClick={() => setImporting(null)}>{t.cancel}</button>
            <button
              className="primary"
              onClick={() => {
                if (commit(importing, true)) {
                  setImporting(null);
                  setUndo(null);
                  setNotice(t.imported);
                }
              }}
            >
              {t.importConfirm}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
