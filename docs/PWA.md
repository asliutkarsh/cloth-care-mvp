# PWA Guide

## Overview
ClothCare ships as a Progressive Web App using `vite-plugin-pwa`.

- Config: `vite.config.js`
- Registration: `registerType: 'autoUpdate'`
- Caching: Workbox runtime caching for Google Fonts; asset glob patterns for build output

## Icons & Manifest
- Place icons in `public/` (e.g., `favicon.ico`, `apple-touch-icon.png`, `logo.png`).
- Update manifest fields (name, short_name, description, theme_color) in `vite.config.js`.

## Install & Offline
- After first load, app can work offline for cached assets and IndexedDB data.
- Updates are applied automatically on next visit after build deploy.

## Tips
- Avoid relying on network during critical flows; persist locally first.
- Test install prompts and offline behavior using Chrome DevTools → Application.
