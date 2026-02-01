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

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## Future Upgrades

- **Import browser bookmarks** — ✅ Implemented (Parses exported HTML bookmarks file)
- **Auto-fetch URL metadata** — ✅ Implemented (Automatically pulls page title/description and attempts to categorize)
- **Tags** — Add a tagging system (many-to-many) alongside categories for more flexible organization
- **Supabase migration** — Move from local SQLite to Supabase for cloud-hosted Postgres, auth, and real-time sync
- **Deploy to DigitalOcean** — Deploy the app to a DigitalOcean droplet for access from anywhere
