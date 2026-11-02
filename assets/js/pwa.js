if ("serviceWorker" in navigator && location.protocol !== "file:") {
  const scriptUrl = new URL(document.currentScript.src);
  const serviceWorkerUrl = new URL("../../service-worker.js", scriptUrl);
  const scope = new URL("../../", scriptUrl).pathname;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(serviceWorkerUrl, { scope })
      .catch((error) => {
        console.error("Service worker registration failed:", error);
      });
  });
}
