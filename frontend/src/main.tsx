import { Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles.css";
class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main>
        <h1>Folio</h1>
        <p>
          The page could not be displayed. Your saved portfolio has not been
          deleted.
        </p>
        <p>Не удалось открыть страницу. Сохранённый портфель не удалён.</p>
        <button onClick={() => location.reload()}>
          Reload / Перезагрузить
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
