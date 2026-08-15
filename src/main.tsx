import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import BulkWordImport from "./components/BulkWordImport";
import "./styles.css";
import "./exportBridge";
import { installHanziFeatures } from "./lib/handwriting";
import { installCanvasReadyFix } from "./lib/canvasReady";
import { installStrokeQuizPatch } from "./lib/strokeQuizPatch";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <BulkWordImport />
  </StrictMode>,
);

installHanziFeatures();
installCanvasReadyFix();
installStrokeQuizPatch();
