# jims_content_hub

A simple bookmark, reading list, and other web content organizer.

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

## Project Setup

```sh
npm install
```

## MySQL Setup

The API server reads MySQL connection values from `.env` (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`).

1. Ensure your MySQL server is running.
2. Create the database and grant privileges for the configured user.
3. Start the app. The API creates required tables automatically on startup.

## Development

```sh
npm run dev
```

This starts:
- Vite client dev server
- Express API server (using `API_HOST` and `API_PORT` from `.env`)

## Compile and Minify for Production

```sh
npm run build
```

## Future Upgrades

- **Import browser bookmarks** — ✅ Implemented (Parses exported HTML bookmarks file)
- **Auto-fetch URL metadata** — ✅ Implemented (Automatically pulls page title/description and attempts to categorize)
- **Tags** — ✅ Implemented (Many-to-many tagging system with inline creation, sidebar filtering, and tag badges on cards)
- **Favorites** — ✅ Implemented (Star/favorite bookmarks to pin them to the top of any list)
- **Sort options** — ✅ Implemented (Sort by newest, oldest, A→Z, Z→A with favorites always first)
- **Deploy to DigitalOcean** — Deploy the app to a DigitalOcean droplet for access from anywhere
