diff --git a/app.js b/app.js
new file mode 100644
index 0000000000000000000000000000000000000000..1ed4df66237a82e870d2e20882caee41f6a045f5
--- /dev/null
+++ b/app.js
@@ -0,0 +1,144 @@
+const API_URL = "https://openlibrary.org/search.json";
+const COVER_URL = "https://covers.openlibrary.org/b/id";
+const OPEN_LIBRARY_BASE = "https://openlibrary.org";
+
+const form = document.getElementById("search-form");
+const input = document.getElementById("search-input");
+const results = document.getElementById("results");
+const statusEl = document.getElementById("status");
+const template = document.getElementById("book-template");
+
+function setStatus(message) {
+  statusEl.textContent = message;
+}
+
+function buildCoverUrl(coverId) {
+  return coverId
+    ? `${COVER_URL}/${coverId}-M.jpg`
+    : "https://placehold.co/400x600/1a2547/bcc6ea?text=Pas+de+couverture";
+}
+
+function clearResults() {
+  results.innerHTML = "";
+}
+
+function normalizeOpenLibraryPath(rawPath) {
+  if (!rawPath || typeof rawPath !== "string") {
+    return null;
+  }
+
+  if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
+    return rawPath;
+  }
+
+  const normalized = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
+
+  // On limite volontairement aux routes stables d'Open Library.
+  if (normalized.startsWith("/works/") || normalized.startsWith("/books/")) {
+    return `${OPEN_LIBRARY_BASE}${normalized}`;
+  }
+
+  return null;
+}
+
+function buildOpenLibrarySearchUrl(book) {
+  const titlePart = book.title ?? "";
+  const authorPart = book.author_name?.[0] ?? "";
+  const query = `${titlePart} ${authorPart}`.trim();
+
+  if (!query) {
+    return `${OPEN_LIBRARY_BASE}/search`;
+  }
+
+  return `${OPEN_LIBRARY_BASE}/search?q=${encodeURIComponent(query)}`;
+}
+
+function buildBookUrl(book) {
+  const directKey = normalizeOpenLibraryPath(book.key);
+  if (directKey) {
+    return directKey;
+  }
+
+  const editionKey = book.edition_key?.[0];
+  const editionPath = normalizeOpenLibraryPath(editionKey ? `/books/${editionKey}` : null);
+  if (editionPath) {
+    return editionPath;
+  }
+
+  // Fallback garanti: renvoyer vers une page de recherche qui existe toujours.
+  return buildOpenLibrarySearchUrl(book);
+}
+
+function createBookCard(book) {
+  const fragment = template.content.cloneNode(true);
+  const img = fragment.querySelector(".book-cover");
+  const title = fragment.querySelector(".book-title");
+  const author = fragment.querySelector(".book-author");
+  const year = fragment.querySelector(".book-year");
+  const link = fragment.querySelector(".book-link");
+
+  const firstAuthor = book.author_name?.[0] ?? "Auteur inconnu";
+  const firstYear = book.first_publish_year ?? "Année inconnue";
+  const bookUrl = buildBookUrl(book);
+
+  img.src = buildCoverUrl(book.cover_i);
+  img.alt = `Couverture: ${book.title ?? "Livre"}`;
+
+  title.textContent = book.title ?? "Titre inconnu";
+  author.textContent = `Auteur: ${firstAuthor}`;
+  year.textContent = `Première publication: ${firstYear}`;
+
+  link.href = bookUrl;
+  link.textContent = "Ouvrir la fiche";
+
+  return fragment;
+}
+
+async function searchBooks(query) {
+  setStatus("Recherche en cours...");
+  clearResults();
+
+  const params = new URLSearchParams({
+    q: query,
+    limit: "24"
+  });
+
+  try {
+    const response = await fetch(`${API_URL}?${params.toString()}`);
+
+    if (!response.ok) {
+      throw new Error(`Erreur HTTP ${response.status}`);
+    }
+
+    const data = await response.json();
+    const books = data.docs ?? [];
+
+    if (books.length === 0) {
+      setStatus("Aucun résultat trouvé. Essaie un autre mot-clé.");
+      return;
+    }
+
+    const fragment = document.createDocumentFragment();
+    books.forEach((book) => fragment.appendChild(createBookCard(book)));
+    results.appendChild(fragment);
+
+    setStatus(`${books.length} livres trouvés pour “${query}”.`);
+  } catch (error) {
+    console.error(error);
+    setStatus("Impossible de récupérer les livres pour le moment.");
+  }
+}
+
+form.addEventListener("submit", (event) => {
+  event.preventDefault();
+  const query = input.value.trim();
+
+  if (!query) {
+    setStatus("Entre un terme de recherche.");
+    return;
+  }
+
+  searchBooks(query);
+});
+
+searchBooks("littérature");
