function prepareCanvas(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return;

  const ratio = window.devicePixelRatio || 1;
  const width = Math.round(rect.width * ratio);
  const height = Math.round(rect.height * ratio);

  if (canvas.width === width && canvas.height === height) return;

  canvas.width = width;
  canvas.height = height;
  canvas.style.touchAction = "none";
  canvas.style.webkitUserSelect = "none";
  canvas.style.userSelect = "none";

  const context = canvas.getContext("2d");
  if (!context) return;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.lineWidth = 5;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = "#373534";
}

function prepareVisibleCanvases() {
  document
    .querySelectorAll<HTMLCanvasElement>(".blank-box canvas, .draw-search-canvas")
    .forEach(prepareCanvas);
}

export function installCanvasReadyFix() {
  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      prepareVisibleCanvases();
    });
  };

  new MutationObserver(schedule).observe(document.body, {
    childList: true,
    subtree: true,
  });
  window.addEventListener("resize", schedule);
  schedule();
}
