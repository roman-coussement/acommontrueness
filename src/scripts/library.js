const CSV_FILE = "/library.csv";
const ITEMS_PER_PAGE = 100;
let disposeLibrary = null;

function parseCSVLine(line) {
  const values = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) {
      values.push(current);
      current = "";
    } else current += character;
  }
  values.push(current);
  return values.map((value) => value.replace(/^"|"$/g, "").trim());
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((header) => header.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, (values[index] || "").trim()]));
  });
}

export function initLibrary() {
  const table = document.querySelector("#libraryTable");
  const container = document.querySelector(".library-container");
  if (!(table instanceof HTMLTableElement) || !(container instanceof HTMLElement)) return () => {};

  const tbody = table.tBodies[0];
  const search = document.querySelector("#searchInput");
  const category = document.querySelector("#categoryFilter");
  const tag = document.querySelector("#tagFilter");
  const subtag = document.querySelector("#subtagFilter");
  const pagination = document.querySelector("#pagination");
  const controller = new AbortController();
  const cleanups = [];
  let searchTimer = null;
  let allBooks = [];
  let filteredBooks = [];
  let currentPage = 1;
  let currentSort = { column: "author", direction: "asc" };
  const filters = { search: "", type: "", tag: "", subtag: "" };

  function listen(target, event, handler) {
    if (!target) return;
    target.addEventListener(event, handler);
    cleanups.push(() => target.removeEventListener(event, handler));
  }

  function escapeHtml(value) {
    const node = document.createElement("div");
    node.textContent = value || "";
    return node.innerHTML;
  }

  function matches(book, except = "") {
    if (except !== "search" && filters.search) {
      const haystack = [book.author, book.title, book.type, book.tag, book["sub-tag"]].join(" ").toLowerCase();
      if (!haystack.includes(filters.search.toLowerCase())) return false;
    }
    if (except !== "type" && filters.type && book.type !== filters.type) return false;
    if (except !== "tag" && filters.tag && book.tag !== filters.tag) return false;
    if (except !== "subtag" && filters.subtag && book["sub-tag"] !== filters.subtag) return false;
    return true;
  }

  function updateSelect(select, field, except, label) {
    if (!(select instanceof HTMLSelectElement)) return;
    const current = select.value;
    const values = [...new Set(allBooks.filter((book) => matches(book, except)).map((book) => book[field]).filter(Boolean))].sort();
    select.replaceChildren(new Option(label, ""), ...values.map((value) => new Option(value, value, false, value === current)));
    select.classList.toggle("placeholder-selected", !select.value);
  }

  function sortBooks() {
    const { column, direction } = currentSort;
    filteredBooks.sort((left, right) => {
      const comparison = (left[column] || "").localeCompare(right[column] || "");
      return direction === "asc" ? comparison : -comparison;
    });
  }

  function renderPagination() {
    if (!(pagination instanceof HTMLElement)) return;
    const total = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
    if (total <= 1) {
      pagination.replaceChildren();
      return;
    }
    const controls = document.createElement("div");
    controls.className = "pagination-controls";
    for (let page = 1; page <= total; page += 1) {
      const button = document.createElement("button");
      button.className = `page-btn${page === currentPage ? " active" : ""}`;
      button.dataset.page = String(page);
      button.textContent = String(page);
      controls.append(button);
    }
    pagination.replaceChildren(controls);
  }

  function render() {
    sortBooks();
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const books = filteredBooks.slice(start, start + ITEMS_PER_PAGE);
    if (books.length === 0) {
      tbody.innerHTML = '<tr><td colspan="2" class="no-results">No books found matching your filters.</td></tr>';
    } else {
      tbody.innerHTML = books.map((book) => `<tr><td>${escapeHtml(book.author)}</td><td>${escapeHtml(book.title)}</td></tr>`).join("");
    }
    table.querySelectorAll(".sortable").forEach((header) => {
      header.classList.remove("sorted-asc", "sorted-desc");
      if (header.dataset.column === currentSort.column) header.classList.add(`sorted-${currentSort.direction}`);
    });
    renderPagination();
  }

  function applyFilters() {
    filteredBooks = allBooks.filter((book) => matches(book));
    currentPage = 1;
    updateSelect(category, "type", "type", "Type");
    updateSelect(tag, "tag", "tag", "Tag");
    updateSelect(subtag, "sub-tag", "subtag", "Sub-tag");
    render();
  }

  listen(search, "input", () => {
    if (searchTimer !== null) clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      filters.search = search.value;
      applyFilters();
    }, 300);
  });
  for (const [select, key] of [[category, "type"], [tag, "tag"], [subtag, "subtag"]]) {
    listen(select, "change", () => {
      filters[key] = select.value;
      select.classList.toggle("placeholder-selected", !select.value);
      applyFilters();
    });
  }
  listen(table, "click", (event) => {
    const header = event.target.closest(".sortable");
    if (!header) return;
    const column = header.dataset.column;
    currentSort = currentSort.column === column
      ? { column, direction: currentSort.direction === "asc" ? "desc" : "asc" }
      : { column, direction: "asc" };
    render();
  });
  listen(pagination, "click", (event) => {
    const button = event.target.closest(".page-btn");
    if (!button) return;
    currentPage = Number(button.dataset.page);
    render();
    table.scrollIntoView({ behavior: "smooth" });
  });

  fetch(CSV_FILE, { signal: controller.signal })
    .then((response) => {
      if (!response.ok) throw new Error(`Library data returned ${response.status}`);
      return response.text();
    })
    .then((text) => {
      allBooks = parseCSV(text);
      filteredBooks = [...allBooks];
      updateSelect(category, "type", "type", "Type");
      updateSelect(tag, "tag", "tag", "Tag");
      updateSelect(subtag, "sub-tag", "subtag", "Sub-tag");
      render();
    })
    .catch((error) => {
      if (error.name === "AbortError") return;
      console.error("Error loading library data:", error);
      container.innerHTML = '<p class="error-message">Unable to load library. Please try again later.</p>';
    });

  return () => {
    controller.abort();
    cleanups.forEach((cleanup) => cleanup());
    if (searchTimer !== null) clearTimeout(searchTimer);
  };
}

function initializeLibrary() {
  if (disposeLibrary) disposeLibrary();
  disposeLibrary = initLibrary();
}

initializeLibrary();
document.addEventListener("astro:page-load", initializeLibrary);
document.addEventListener("astro:before-swap", () => {
  if (disposeLibrary) disposeLibrary();
  disposeLibrary = null;
});
