# jims_content_hub

A personal bookmark, reading list, and web content organizer. Save URLs, auto-fetch titles/descriptions, tag and categorize everything, mark favorites, and import your existing browser bookmarks.

---

## Quick Start (Personal Use)

This is the fastest path to get the app running locally.

### 1. Prerequisites

- **Node.js** v20.19.0 or newer — [nodejs.org](https://nodejs.org)
- **MySQL 8+** running locally — [mysql.com](https://dev.mysql.com/downloads/mysql/) or via Docker (see below)

### 2. Clone and install dependencies

```sh
git clone https://github.com/your-username/jims_content_hub.git
cd jims_content_hub
npm install
```

### 3. Create your `.env` file

Copy the example below into a new file named `.env` in the project root and fill in your MySQL credentials:

```env
# MySQL connection
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=jims_content_hub
DB_USER=root
DB_PASSWORD=your_mysql_password

# API server (optional — defaults shown)
API_HOST=0.0.0.0
API_PORT=3001

# Connection pool (optional — defaults shown)
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=0
```

> All values shown are the defaults. If your local MySQL uses these exact settings you only need to set `DB_PASSWORD`.

### 4. Create the MySQL database

Log in to MySQL and run:

```sql
CREATE DATABASE IF NOT EXISTS jims_content_hub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

If you're using a non-root user, also grant privileges:

```sql
GRANT ALL PRIVILEGES ON jims_content_hub.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

> **Tables are created automatically** the first time the API server starts — you don't need to run any migration scripts.

### 5. Start the app

```sh
npm run dev
```

This starts both servers at once:

| Service | URL |
|---------|-----|
| Frontend (Vue) | http://localhost:5173 |
| Backend API (Express) | http://localhost:3001 |

Open http://localhost:5173 in your browser and you're ready to go.

---

## Running MySQL with Docker (optional)

If you don't have MySQL installed locally, spin one up in seconds:

```sh
docker run -d \
  --name jims-mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=jims_content_hub \
  -p 3306:3306 \
  mysql:8
```

Then set `DB_PASSWORD=secret` in your `.env`. The container persists data in a Docker-managed volume.

---

## Importing Browser Bookmarks

1. Export your bookmarks from your browser as an HTML file (all major browsers support this).
2. Open the app and click **Import** in the sidebar.
3. Select the exported `.html` file. The app parses it and adds all bookmarks automatically.

---

## Individual Dev Scripts

```sh
npm run dev:client   # Vite frontend only (port 5173)
npm run dev:server   # Express API only (port from API_PORT in .env)
npm run build        # Production build → dist/
npm run preview      # Preview the production build locally
```

---

## Project Setup

```sh
npm install
```

## MySQL Setup

The API server reads MySQL connection values from `.env` (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`).

1. Ensure your MySQL server is running.
2. Create the database and grant privileges for the configured user.
3. Start the app. The API creates required tables automatically on startup.

---

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

---

## Future Upgrades

- **Import browser bookmarks** — ✅ Implemented (Parses exported HTML bookmarks file)
- **Auto-fetch URL metadata** — ✅ Implemented (Automatically pulls page title/description and attempts to categorize)
- **Tags** — ✅ Implemented (Many-to-many tagging system with inline creation, sidebar filtering, and tag badges on cards)
- **Favorites** — ✅ Implemented (Star/favorite bookmarks to pin them to the top of any list)
- **Sort options** — ✅ Implemented (Sort by newest, oldest, A→Z, Z→A with favorites always first)
- **Deploy to DigitalOcean** — Deploy the app to a DigitalOcean droplet for access from anywhere
