# Audos Documentation

## Overview
This is the Audos API Reference and Architecture documentation site built with [Docusaurus 3](https://docusaurus.io/).

## Development
- **Dev Server**: Run `npm run start -- --host 0.0.0.0 --port 5000` to start the development server
- **Build**: Run `npm run build` to create a production build in the `build/` directory

## Project Structure
- `docs/` - Markdown documentation files
  - `api/` - API reference documentation (Chat, Email, Tagging)
  - `architecture/` - Architecture documentation
  - `guides/` - Usage guides
  - `source/` - Source materials and Postman collections
- `src/` - React components and styling
  - `components/` - Custom React components
  - `css/` - Custom CSS
  - `pages/` - Custom pages
- `static/` - Static assets (images, favicon)
- `docusaurus.config.ts` - Docusaurus configuration
- `sidebars.ts` - Sidebar navigation configuration

## Deployment
Configured for static deployment. The site is built using `npm run build` and the `build/` directory is served.
