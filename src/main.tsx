import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import BulkWordImport from "./components/BulkWordImport";
import "./styles.css";
import "./deleteControls.css";
import "./removeLearnNav.css";
import "./settingsOverrides.css";
import "./settingsMobileFix.css";
import "./practiceOverrides.css";
import "./exportBridge";
import { installHanziFeatures } from "./lib/handwriting";
import { installCanvasReadyFix } from "./lib/canvasReady";
import { installStrokeQuizPatch } from "./lib/strokeQuizPatch";
import { installCustomDeleteControls } from "./lib/deleteControls";
import { installCustomDailySourceToggle } from "./lib/customDailySource";
import { installPracticeExit } from "./lib/practiceExit";
import { installHanziSettingsUi } from "./lib/hanziSettingsUi";
import { installTheoryOrder } from "./lib/theoryOrder";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <>
      <App />
      <BulkWordImport />
    </>
  </StrictMode>,
);

installHanziFeatures();
installCanvasReadyFix();
installStrokeQuizPatch();
installCustomDeleteControls();
installCustomDailySourceToggle();
installPracticeExit();
installHanziSettingsUi();
installTheoryOrder();
