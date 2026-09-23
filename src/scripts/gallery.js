const ARTWORK_FOLDER = "/artwork/optimized/";
const MANIFEST = "/artwork/gallery-artwork.json";
const IMAGE_EXT = /\.(jpg|jpeg|png|avif|webp|gif)$/i;
let disposeGallery = null;

export function initGallery() {
  const carousel = document.querySelector("#galleryCarousel");
  if (!(carousel instanceof HTMLElement)) return () => {};

  const controller = new AbortController();
  const cleanups = [];
  const frames = new Set();
  let active = true;
  let ready = false;
  let setWidth = 0;
  let resizeTimer = null;
  let pendingWheelDelta = 0;
  let isDown = false;
  let startX = 0;
  let startScroll = 0;
  let touchX = 0;
  let touchScroll = 0;
  let dragTarget = 0;
  let normalizePending = false;
  let wheelPending = false;
  let dragPending = false;

  function listen(target, event, handler, options) {
    target.addEventListener(event, handler, options);
    cleanups.push(() => target.removeEventListener(event, handler, options));
  }

  function frame(callback) {
    const id = requestAnimationFrame(() => {
      frames.delete(id);
      if (active) callback();
    });
    frames.add(id);
  }

  function normalize() {
    if (setWidth <= 0) return;
    if (carousel.scrollLeft >= setWidth * 2) carousel.scrollLeft -= setWidth;
    else if (carousel.scrollLeft < setWidth) carousel.scrollLeft += setWidth;
  }

  function makeImage(file, index) {
    const image = document.createElement("img");
    image.className = "gallery-image";
    image.src = ARTWORK_FOLDER + file;
    image.alt = file.replace(IMAGE_EXT, "").replace(/[-_]+/g, " ");
    image.decoding = "async";
    image.loading = "eager";
    image.fetchPriority = index < 3 ? "high" : "auto";
    image.draggable = false;
    return image;
  }

  function settle(images) {
    return Promise.all(images.map((image) => {
      if (image.complete) return Promise.resolve();
      return new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    }));
  }

  async function build(files) {
    ready = false;
    carousel.replaceChildren();
    const originals = files.map(makeImage);
    carousel.append(...originals);
    await settle(originals);
    if (!active) return;

    const good = originals.filter((image) => image.naturalWidth > 0 && image.offsetWidth > 0);
    originals.filter((image) => !good.includes(image)).forEach((image) => image.remove());
    if (good.length === 0) return;

    const clone = (image) => {
      const copy = image.cloneNode(true);
      copy.alt = "";
      copy.setAttribute("aria-hidden", "true");
      return copy;
    };
    const cloneA = good.map(clone);
    const cloneB = good.map(clone);
    carousel.append(...cloneA, ...cloneB);
    setWidth = cloneA[0].offsetLeft;
    carousel.scrollLeft = setWidth;
    ready = true;
  }

  fetch(MANIFEST, { signal: controller.signal })
    .then((response) => {
      if (!response.ok) throw new Error(`Gallery manifest returned ${response.status}`);
      return response.json();
    })
    .then((files) => Array.isArray(files) ? files.filter((file) => typeof file === "string" && IMAGE_EXT.test(file)) : [])
    .then((files) => build(files))
    .catch((error) => {
      if (error.name !== "AbortError") console.error("Unable to load gallery:", error);
    });

  const handleResize = () => {
    if (resizeTimer !== null) clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (!controller.signal.aborted) {
        fetch(MANIFEST, { signal: controller.signal })
          .then((response) => response.json())
          .then((files) => build(files.filter((file) => typeof file === "string" && IMAGE_EXT.test(file))))
          .catch(() => {});
      }
    }, 150);
  };
  const handleScroll = () => {
    if (normalizePending) return;
    normalizePending = true;
    frame(() => {
      normalize();
      normalizePending = false;
    });
  };
  const handleWheel = (event) => {
    if (!ready) return;
    event.preventDefault();
    pendingWheelDelta += Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (wheelPending) return;
    wheelPending = true;
    frame(() => {
      carousel.scrollLeft += pendingWheelDelta;
      pendingWheelDelta = 0;
      normalize();
      wheelPending = false;
    });
  };
  const scheduleDrag = (target) => {
    dragTarget = target;
    if (dragPending) return;
    dragPending = true;
    frame(() => {
      carousel.scrollLeft = dragTarget;
      normalize();
      dragPending = false;
    });
  };
  const handleMouseDown = (event) => {
    if (!ready) return;
    isDown = true;
    startX = event.pageX;
    startScroll = carousel.scrollLeft;
    carousel.classList.add("dragging");
    event.preventDefault();
  };
  const handleMouseMove = (event) => {
    if (isDown) scheduleDrag(startScroll - (event.pageX - startX));
  };
  const handleMouseUp = () => {
    isDown = false;
    carousel.classList.remove("dragging");
  };
  const handleTouchStart = (event) => {
    if (!ready) return;
    touchX = event.touches[0].pageX;
    touchScroll = carousel.scrollLeft;
  };
  const handleTouchMove = (event) => {
    if (!ready) return;
    scheduleDrag(touchScroll - (event.touches[0].pageX - touchX));
    event.preventDefault();
  };
  const preventDrag = (event) => event.preventDefault();

  listen(window, "resize", handleResize);
  listen(carousel, "scroll", handleScroll, { passive: true });
  listen(carousel, "wheel", handleWheel, { passive: false });
  listen(carousel, "mousedown", handleMouseDown);
  listen(window, "mousemove", handleMouseMove);
  listen(window, "mouseup", handleMouseUp);
  listen(carousel, "touchstart", handleTouchStart, { passive: true });
  listen(carousel, "touchmove", handleTouchMove, { passive: false });
  listen(carousel, "dragstart", preventDrag);

  return () => {
    active = false;
    controller.abort();
    cleanups.forEach((cleanup) => cleanup());
    frames.forEach((id) => cancelAnimationFrame(id));
    if (resizeTimer !== null) clearTimeout(resizeTimer);
  };
}

function initializeGallery() {
  if (disposeGallery) disposeGallery();
  disposeGallery = initGallery();
}

initializeGallery();
document.addEventListener("astro:page-load", initializeGallery);
document.addEventListener("astro:before-swap", () => {
  if (disposeGallery) disposeGallery();
  disposeGallery = null;
});
