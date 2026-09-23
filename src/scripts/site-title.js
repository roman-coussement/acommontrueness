let disposeTitle = null;

function storedState() {
  try {
    return localStorage.getItem("titleState") === "title" ? "title" : "name";
  } catch {
    return "name";
  }
}

function setState(state) {
  document.documentElement.dataset.titleState = state;
  try {
    localStorage.setItem("titleState", state);
  } catch {
    // The visual state still works when storage is unavailable.
  }
}

function stateText(state) {
  return state === "title" ? "a common trueness" : "roman coussement";
}

export function initSiteTitle() {
  const title = document.querySelector(".site-title");
  if (!title) return () => {};

  let currentState = storedState();
  let activeBaffle = null;
  let revealTimer = null;
  let commitTimer = null;

  document.documentElement.dataset.titleState = currentState;
  title.style.cursor = "pointer";
  title.style.userSelect = "none";

  const handleClick = () => {
    if (activeBaffle) activeBaffle.stop();
    if (revealTimer) window.clearTimeout(revealTimer);
    if (commitTimer) window.clearTimeout(commitTimer);

    const nextState = currentState === "name" ? "title" : "name";
    const targetText = stateText(nextState);

    if (typeof window.baffle !== "function" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      title.textContent = targetText;
      currentState = nextState;
      setState(currentState);
      return;
    }

    activeBaffle = window.baffle(title, {
      characters: "~!@#$%^&*-+=<>?/\\|abcdefghijklmnopqrstuvwxyz",
      speed: 50,
    });
    activeBaffle.start();
    revealTimer = window.setTimeout(() => {
      activeBaffle.text(() => targetText);
      activeBaffle.reveal(1000);
      commitTimer = window.setTimeout(() => {
        currentState = nextState;
        setState(currentState);
      }, 1000);
    }, 1000);
  };

  title.addEventListener("click", handleClick);
  return () => {
    title.removeEventListener("click", handleClick);
    if (activeBaffle) activeBaffle.stop();
    if (revealTimer) window.clearTimeout(revealTimer);
    if (commitTimer) window.clearTimeout(commitTimer);
  };
}

function initializeTitle() {
  if (disposeTitle) disposeTitle();
  disposeTitle = initSiteTitle();
}

initializeTitle();
document.addEventListener("astro:page-load", initializeTitle);
document.addEventListener("astro:before-swap", () => {
  if (disposeTitle) disposeTitle();
  disposeTitle = null;
});
