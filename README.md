# 🎬 Movie Explorer

A responsive Movie Explorer web app built with **HTML5, CSS3, and Vanilla JavaScript (ES6)**, powered by the **TMDB (The Movie Database) API**. Built as a Frontend Development Internship assignment.

---

## 📖 Project Overview

Movie Explorer lets users browse popular movies, search by title, filter by genre, sort by rating/release date, view detailed movie information in a modal, and save favorites — all without using any frontend framework or library. The goal was to demonstrate solid fundamentals: DOM manipulation, async/await with the Fetch API, state management in plain JS, and responsive CSS.

---

## 🌐 API Used

**TMDB (The Movie Database) API** — [https://www.themoviedb.org/documentation/api](https://www.themoviedb.org/documentation/api)

Endpoints used:
| Purpose | Endpoint |
|---|---|
| Popular movies | `GET /movie/popular` |
| Search movies | `GET /search/movie` |
| Movie details | `GET /movie/{movie_id}` |
| Genre list | `GET /genre/movie/list` |

> ⚠️ You need a free TMDB API key to run this project (see **How to Run** below).

---

## ✨ Features

### Core Features
- Displays popular movies automatically on page load
- Search movies by title (Fetch API + async/await)
- Movie cards showing **poster, title, rating, and release date**
- Click any card to open a **modal** with overview, genres, runtime, language, and vote count
- Loading spinner while data is being fetched
- Error handling for API/network failures with a **Retry** button
- "No movies found" empty state for invalid/empty searches
- Fully responsive layout (desktop, tablet, mobile)
- Smooth hover animations on movie cards
- Clean, modern card-based UI

### Bonus Features
- 🎭 Filter movies by genre
- ↕️ Sort by rating (high/low) or release date (newest/oldest)
- 🌗 Dark / Light mode toggle (saved in Local Storage)
- ➕ "Load More" pagination button
- ⭐ Favorite movies saved using **Local Storage**, viewable in a dedicated Favorites view

---

## 📁 Folder Structure

```
MovieExplorer/
│── index.html      # Page structure (header, search, filters, grid, modal)
│── style.css        # All styling, responsive layout, dark/light theme
│── script.js         # App logic: fetch calls, rendering, state, events
│── README.md          # Project documentation (this file)
```

---

## ⚙️ How to Run the Project

1. **Get a TMDB API key** (free):
   - Create an account at [themoviedb.org](https://www.themoviedb.org/)
   - Go to **Settings → API** and request a **v3 API key**

2. **Add your API key**:
   - Open `script.js`
   - Replace the placeholder at the top of the file:
     ```js
     const API_KEY = "YOUR_TMDB_API_KEY_HERE";
     ```

3. **Run the project**:
   - Simply open `index.html` in your browser, **or**
   - Use a local dev server for the best experience (recommended, avoids some browser CORS quirks):
     - VS Code: install the **Live Server** extension → right-click `index.html` → "Open with Live Server"
     - Or run: `python3 -m http.server` in the project folder and visit `http://localhost:8000`

No build tools, no npm install — it's plain HTML/CSS/JS.

---

## 🖼️ Screenshots

_Add screenshots here after running the project locally:_

| Home Page | Search Results | Movie Modal | Dark Mode |
|---|---|---|---|
| _screenshot_ | _screenshot_ | _screenshot_ | _screenshot_ |

---

## 🚀 Future Improvements

- Add debounced live search (search-as-you-type instead of on submit)
- Add skeleton loading cards instead of a single spinner
- Add a dedicated "Now Playing" / "Top Rated" / "Upcoming" tab using other TMDB endpoints
- Add trailer playback using TMDB's `/movie/{id}/videos` endpoint
- Add unit tests for the pure filtering/sorting functions
- Migrate favorites storage to IndexedDB for larger datasets
- Add infinite scroll as an alternative to the Load More button

---

## 🛠️ Tech Stack

- HTML5
- CSS3 (Flexbox, Grid, CSS Variables, Media Queries)
- Vanilla JavaScript (ES6: `const`/`let`, arrow functions, template literals, `async`/`await`, destructuring)
- Fetch API
- Local Storage (favorites + theme preference)
- No frameworks or libraries (no React, Bootstrap, Tailwind, jQuery)

---


