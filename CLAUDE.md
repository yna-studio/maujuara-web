# Project Instructions for Claude

## Purpose
This is a SvelteKit web application (named **maujuara**) that serves news content, integrates with external news APIs, and provides a modern, premium UI. The goal is to deliver a fast, SEO‑friendly, and visually stunning experience.

## Tech Stack & Architecture
- **Framework**: SvelteKit (SSR, Vite)
- **Languages**: TypeScript, HTML, CSS
- **Styling**: TailwindCSS (configured via `tailwind.config.cjs`)
- **Build**: Vite (`pnpm run build`)
- **Deployment**: Custom `deploy.sh` script (build + upload)
- **Key Directories**:
  - `src/` – routes, components, stores, lib utilities.
  - `static/` – static assets (images, fonts).
  - `.svelte-kit/` & `.vite/` – generated build artefacts.
  - `scripts/` – helper scripts.
  - `node_modules/` – dependencies.

## Workflow & Commands
- **Install**: `pnpm install`
- **Dev Server**: `pnpm dev`
- **Build**: `pnpm build`
- **Preview Production Build**: `pnpm preview`
- **Clean**: `pnpm run clean`
- **Check Types & Lint**: `pnpm run check`
- **Deploy**: `./deploy.sh`

## Behavioral Guidelines for Claude
- **Always run the appropriate script** (`pnpm dev` for local testing, `pnpm build` before committing UI changes).
- **Run type checking** (`pnpm run check`) before any commit.
- **Keep functions under 40 lines**; extract helpers when they grow larger.
- **Prefer TypeScript features** – avoid plain JavaScript unless absolutely necessary.
- **Write unit tests** for any new utility or API integration.
- **Do not modify `package.json` without updating dependencies**; run `pnpm i` after changes.
- **Never commit directly to `main`** – always create a branch and open a PR.
- **Respect `.env`** – never expose secret keys in code or commits.

## Constraints
- Do not edit files outside the project root.
- Do not delete the `static/` folder contents.
- Do not change the Tailwind configuration unless a design decision mandates it.
- Do not push large binary assets; use Cloudinary for media uploads.

---
*This file is read by Claude at the start of each session to set context and enforce project standards.*
