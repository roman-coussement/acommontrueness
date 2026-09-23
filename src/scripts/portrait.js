let disposePortrait = null;

export function initPortrait() {
  const gallery = document.querySelector("#artGallery");
  const image = document.querySelector("#artImage");
  if (!(gallery instanceof HTMLElement) || !(image instanceof HTMLImageElement)) return () => {};
  if (document.body.classList.contains("article-page")) return () => {};

  let resizeFrame = null;
  let lastWidth = window.innerWidth;
  let lastHeight = window.innerHeight;

  function position() {
    if (window.innerWidth < 1200) {
      gallery.style.removeProperty("--gallery-x");
      gallery.style.removeProperty("--gallery-y");
      gallery.style.removeProperty("--gallery-max-height");
      gallery.style.removeProperty("--gallery-max-width");
      gallery.style.paddingTop = "";
      gallery.classList.remove("hidden", "gallery-at-bottom");
      gallery.classList.add("is-ready");
      return;
    }

    const title = document.querySelector(".site-title");
    const lastNavItem = document.querySelector(".nav-menu-desktop .nav-item:last-child");
    if (!title || !lastNavItem) return;

    const titleRect = title.getBoundingClientRect();
    const lastNavRect = lastNavItem.getBoundingClientRect();
    const availableWidth = titleRect.left - 20 - 24 - 64;
    const useLeftMargin = availableWidth >= 150;
    const maxHeight = Math.max(200, lastNavRect.bottom - titleRect.top - 20);

    gallery.style.setProperty("--gallery-max-height", `${maxHeight}px`);
    gallery.style.setProperty("--gallery-max-width", useLeftMargin ? `${Math.max(100, availableWidth)}px` : "none");

    const galleryX = titleRect.left - gallery.offsetWidth - 20;
    gallery.style.setProperty("--gallery-x", `${galleryX}px`);
    gallery.style.setProperty("--gallery-y", `${titleRect.top + 12}px`);
    gallery.classList.toggle("gallery-at-bottom", !useLeftMargin);
    gallery.classList.remove("hidden");
    gallery.style.paddingTop = useLeftMargin ? "0" : "";
    gallery.classList.add("is-ready");
  }

  function handleResize() {
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      const widthChanged = Math.abs(window.innerWidth - lastWidth) > 10;
      const heightChanged = Math.abs(window.innerHeight - lastHeight) > 10;
      if (widthChanged || heightChanged) {
        position();
        lastWidth = window.innerWidth;
        lastHeight = window.innerHeight;
      }
      resizeFrame = null;
    });
  }

  gallery.style.transition = "none";
  image.style.transition = "none";
  position();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    gallery.style.transition = "";
    image.style.transition = "";
  }));
  image.addEventListener("load", position);
  window.addEventListener("resize", handleResize);
  window.addEventListener("load", position);

  return () => {
    image.removeEventListener("load", position);
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("load", position);
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
  };
}

function initializePortrait() {
  if (disposePortrait) disposePortrait();
  disposePortrait = initPortrait();
}

initializePortrait();
document.addEventListener("astro:page-load", initializePortrait);
document.addEventListener("astro:before-swap", () => {
  if (disposePortrait) disposePortrait();
  disposePortrait = null;
});
