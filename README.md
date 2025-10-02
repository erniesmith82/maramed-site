# Maramed — Orthopedic Systems (SvelteKit)

Modern, mobile-first catalog and ordering site for Maramed Orthopedic Systems.  
Built with **SvelteKit**, **Tailwind CSS**, and light **Svelte transitions** for a clean, fast UX.

---

## ✨ Features

- **Catalog browser** with product families, sizes, and rich details
- **Fast search / clear item tables** with auto-ordered measurement columns
- **Ordering workflow** with dynamic SKU rows and form validation
- **Contact form** using SvelteKit form actions (`enhance` + `applyAction`)
- **Clinical Studies** section with inline citation rendering (`[[1,3–5]]` → superscripts)
- **Printable catalog** view at `/catalog/print` (print to PDF or paper)
- **Reduced-motion friendly** animations that respect `prefers-reduced-motion`
- **Weekly rotating featured items** (stable by ISO week, ET)

---

## 🧱 Tech Stack

- **Framework:** SvelteKit (Vite)
- **UI / Styles:** Tailwind CSS
- **Transitions:** `fade`, `fly`, `scale` (Svelte)
- **Data:** `src/lib/data/products.json`
- **Forms:** `$app/forms` (`enhance`, `applyAction`)
- **Node:** ≥ 18.x recommended

---

## 📦 Getting Started

```bash
# install deps
npm install

# dev server
npm run dev   # defaults to http://localhost:5173

# production build
npm run build

# preview build
npm run preview

