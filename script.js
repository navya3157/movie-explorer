/* =========================================================
   MOVIE EXPLORER - script.js
   Vanilla JS (ES6) app that talks to the TMDB API.

   NOTE FOR SETUP:
   You need a free TMDB API key to run this project.
   1. Create an account at https://www.themoviedb.org/
   2. Go to Settings -> API -> request an API Key (v3 auth)
   3. Paste it below as API_KEY
========================================================= */

/* ---------------- CONFIG ---------------- */
const API_KEY = "b59c74891966bf67345158eb7d7e417f"; // <-- put your TMDB API key here
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const PLACEHOLDER_POSTER =
  "https://via.placeholder.com/500x750?text=No+Image";

/* ---------------- STATE ---------------- */
// Keeping app state in one object makes it easy to reason about
// what the UI currently shows.
const state = {
  mode: "popular",      // "popular" | "search" | "favorites"
  query: "",             // current search text
  page: 1,               // current page for pagination
  totalPages: 1,
  genreId: "",            // selected genre filter
  sortOption: "",          // selected sort option
  movies: [],              // movies currently loaded (accumulated for Load More)
  genresMap: {},            // { genreId: genreName }
};

/* ---------------- DOM REFERENCES ---------------- */
const movieGrid = document.getElementById("movieGrid");
const loader = document.getElementById("loader");
const errorState = document.getElementById("errorState");
const emptyState = document.getElementById("emptyState");
const sectionTitle = document.getElementById("sectionTitle");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const genreFilter = document.getElementById("genreFilter");
const sortSelect = document.getElementById("sortSelect");
const favoritesBtn = document.getElementById("favoritesBtn");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const retryBtn = document.getElementById("retryBtn");
const themeToggle = document.getElementById("themeToggle");
const movieModal = document.getElementById("movieModal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");

/* =========================================================
   INITIALISATION
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  loadGenres();
  fetchPopularMovies();
});

/* =========================================================
   THEME (Dark / Light Mode) - stored in Local Storage
========================================================= */
function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    themeToggle.textContent = "☀️";
  }
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
  const isDark = document.body.classList.contains("dark-theme");
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

/* =========================================================
   FAVORITES (Local Storage)
========================================================= */
function getFavorites() {
  const stored = localStorage.getItem("favorites");
  return stored ? JSON.parse(stored) : [];
}

function saveFavorites(favorites) {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function isFavorite(movieId) {
  return getFavorites().some((m) => m.id === movieId);
}

function toggleFavorite(movie) {
  let favorites = getFavorites();
  if (isFavorite(movie.id)) {
    favorites = favorites.filter((m) => m.id !== movie.id);
  } else {
    favorites.push(movie);
  }
  saveFavorites(favorites);
}

favoritesBtn.addEventListener("click", () => {
  state.mode = "favorites";
  state.movies = getFavorites();
  sectionTitle.textContent = "⭐ Your Favorite Movies";
  loadMoreBtn.classList.add("hidden");
  renderMovies(applyFiltersAndSort(state.movies));
});

/* =========================================================
   FETCH HELPERS
========================================================= */

// Generic fetch wrapper with error handling
async function fetchFromTMDB(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", API_KEY);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.set(key, value)
  );

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status}`);
  }
  return response.json();
}

/* ---------------- Load genre list (used for filter dropdown + modal badges) ---------------- */
async function loadGenres() {
  try {
    const data = await fetchFromTMDB("/genre/movie/list");
    data.genres.forEach((genre) => {
      state.genresMap[genre.id] = genre.name;

      const option = document.createElement("option");
      option.value = genre.id;
      option.textContent = genre.name;
      genreFilter.appendChild(option);
    });
  } catch (err) {
    // Non-critical: if genres fail to load, the filter dropdown just stays empty
    console.error("Failed to load genres:", err);
  }
}

/* ---------------- Fetch popular movies (default landing view) ---------------- */
async function fetchPopularMovies(page = 1) {
  state.mode = "popular";
  state.page = page;
  sectionTitle.textContent = "Popular Movies";

  await withLoadingState(async () => {
    const data = await fetchFromTMDB("/movie/popular", { page });
    handleFetchedMovies(data, page);
  });
}

/* ---------------- Search movies by title ---------------- */
async function searchMovies(query, page = 1) {
  state.mode = "search";
  state.query = query;
  state.page = page;
  sectionTitle.textContent = `Search Results for "${query}"`;

  await withLoadingState(async () => {
    const data = await fetchFromTMDB("/search/movie", { query, page });
    handleFetchedMovies(data, page);
  });
}

/* ---------------- Shared logic for handling a movies response ---------------- */
function handleFetchedMovies(data, page) {
  state.totalPages = data.total_pages || 1;

  // If loading page 1, replace the list. Otherwise append (Load More).
  state.movies = page === 1 ? data.results : [...state.movies, ...data.results];

  renderMovies(applyFiltersAndSort(state.movies));

  // Show / hide Load More button based on remaining pages
  if (state.page < state.totalPages && data.results.length > 0) {
    loadMoreBtn.classList.remove("hidden");
  } else {
    loadMoreBtn.classList.add("hidden");
  }
}

/* ---------------- Wraps any fetch call with loading/error UI handling ---------------- */
async function withLoadingState(fetchFn) {
  showLoader();
  hideError();
  hideEmpty();

  try {
    await fetchFn();
  } catch (err) {
    console.error(err);
    showError();
  } finally {
    hideLoader();
  }
}

/* =========================================================
   UI STATE HELPERS
========================================================= */
function showLoader() {
  loader.classList.remove("hidden");
  movieGrid.classList.add("hidden");
}
function hideLoader() {
  loader.classList.add("hidden");
  movieGrid.classList.remove("hidden");
}
function showError() {
  errorState.classList.remove("hidden");
  movieGrid.innerHTML = "";
}
function hideError() {
  errorState.classList.add("hidden");
}
function showEmpty() {
  emptyState.classList.remove("hidden");
}
function hideEmpty() {
  emptyState.classList.add("hidden");
}

/* =========================================================
   FILTERING & SORTING (applied client-side on loaded movies)
========================================================= */
function applyFiltersAndSort(movies) {
  let result = [...movies];

  // Filter by genre
  if (state.genreId) {
    result = result.filter((movie) =>
      movie.genre_ids
        ? movie.genre_ids.includes(Number(state.genreId))
        : movie.genres?.some((g) => g.id === Number(state.genreId))
    );
  }

  // Sort
  switch (state.sortOption) {
    case "rating-desc":
      result.sort((a, b) => b.vote_average - a.vote_average);
      break;
    case "rating-asc":
      result.sort((a, b) => a.vote_average - b.vote_average);
      break;
    case "date-desc":
      result.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
      break;
    case "date-asc":
      result.sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
      break;
    default:
      break;
  }

  return result;
}

genreFilter.addEventListener("change", (e) => {
  state.genreId = e.target.value;
  renderMovies(applyFiltersAndSort(state.movies));
});

sortSelect.addEventListener("change", (e) => {
  state.sortOption = e.target.value;
  renderMovies(applyFiltersAndSort(state.movies));
});

/* =========================================================
   RENDERING MOVIE CARDS
========================================================= */
function renderMovies(movies) {
  movieGrid.innerHTML = "";

  if (!movies || movies.length === 0) {
    showEmpty();
    return;
  }
  hideEmpty();

  // Build all cards using a document fragment for performance
  const fragment = document.createDocumentFragment();
  movies.forEach((movie) => fragment.appendChild(createMovieCard(movie)));
  movieGrid.appendChild(fragment);
}

function createMovieCard(movie) {
  const card = document.createElement("div");
  card.className = "movie-card";

  const posterPath = movie.poster_path
    ? `${IMG_URL}${movie.poster_path}`
    : PLACEHOLDER_POSTER;

  const releaseYear = movie.release_date
    ? movie.release_date
    : "Unknown";

  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

  card.innerHTML = `
    <button class="favorite-btn ${isFavorite(movie.id) ? "active" : ""}" data-id="${movie.id}">
      ${isFavorite(movie.id) ? "★" : "☆"}
    </button>
    <img
      class="movie-poster"
      src="${posterPath}"
      alt="${movie.title} poster"
      loading="lazy"
    />
    <div class="movie-info">
      <p class="movie-title">${movie.title}</p>
      <div class="movie-meta">
        <span class="movie-rating">⭐ ${rating}</span>
        <span>${releaseYear}</span>
      </div>
    </div>
  `;

  // Clicking the card (but not the favorite button) opens the modal
  card.addEventListener("click", (e) => {
    if (e.target.closest(".favorite-btn")) return;
    openMovieModal(movie.id);
  });

  // Favorite toggle
  const favBtn = card.querySelector(".favorite-btn");
  favBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFavorite(movie);
    favBtn.classList.toggle("active");
    favBtn.textContent = isFavorite(movie.id) ? "★" : "☆";
  });

  return card;
}

/* =========================================================
   MOVIE DETAILS MODAL
========================================================= */
async function openMovieModal(movieId) {
  movieModal.classList.remove("hidden");
  modalBody.innerHTML = `<div class="loader"><div class="spinner"></div><p>Loading details...</p></div>`;

  try {
    const movie = await fetchFromTMDB(`/movie/${movieId}`);
    renderModal(movie);
  } catch (err) {
    console.error(err);
    modalBody.innerHTML = `<p class="state-message">⚠️ Could not load movie details. Please try again.</p>`;
  }
}

function renderModal(movie) {
  const posterPath = movie.poster_path
    ? `${IMG_URL}${movie.poster_path}`
    : PLACEHOLDER_POSTER;

  const genresHTML = movie.genres
    .map((g) => `<span class="genre-badge">${g.name}</span>`)
    .join("");

  const runtime = movie.runtime ? `${movie.runtime} min` : "N/A";
  const language = movie.original_language
    ? movie.original_language.toUpperCase()
    : "N/A";

  modalBody.innerHTML = `
    <img class="modal-poster" src="${posterPath}" alt="${movie.title} poster" />
    <div class="modal-details">
      <h2>${movie.title}</h2>
      ${movie.tagline ? `<p class="modal-tagline">"${movie.tagline}"</p>` : ""}
      <div class="modal-genres">${genresHTML}</div>
      <p class="modal-overview">${movie.overview || "No overview available."}</p>
      <div class="modal-stats">
        <p><strong>Rating:</strong> ⭐ ${movie.vote_average.toFixed(1)} / 10</p>
        <p><strong>Vote Count:</strong> ${movie.vote_count.toLocaleString()}</p>
        <p><strong>Runtime:</strong> ${runtime}</p>
        <p><strong>Language:</strong> ${language}</p>
        <p><strong>Release Date:</strong> ${movie.release_date || "N/A"}</p>
        <p><strong>Status:</strong> ${movie.status || "N/A"}</p>
      </div>
    </div>
  `;
}

closeModal.addEventListener("click", () => movieModal.classList.add("hidden"));

// Close modal when clicking outside the content box
movieModal.addEventListener("click", (e) => {
  if (e.target === movieModal) movieModal.classList.add("hidden");
});

// Close modal with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") movieModal.classList.add("hidden");
});

/* =========================================================
   SEARCH FORM
========================================================= */
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();

  if (!query) {
    // Graceful handling of empty search: just show popular movies again
    fetchPopularMovies();
    return;
  }

  searchMovies(query);
});

/* =========================================================
   LOAD MORE / PAGINATION
========================================================= */
loadMoreBtn.addEventListener("click", () => {
  const nextPage = state.page + 1;

  if (state.mode === "search") {
    searchMovies(state.query, nextPage);
  } else {
    fetchPopularMovies(nextPage);
  }
});

/* =========================================================
   RETRY BUTTON (Error state)
========================================================= */
retryBtn.addEventListener("click", () => {
  if (state.mode === "search" && state.query) {
    searchMovies(state.query, state.page);
  } else {
    fetchPopularMovies(state.page);
  }
});
