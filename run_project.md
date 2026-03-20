# SmartSwarm AlertIQ — Run Project

## 1) Requirements
- **Node.js (LTS)** with **npm**
- *(Optional)* **Git** (if you’re cloning the repository)

## 2) Install dependencies
From the project root (the folder that contains `package.json`), run:

```bash
npm install
```

## 3) Start the development server
```bash
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

## 4) Build for production
```bash
npm run build
```

This runs:
- `tsc -b` (TypeScript build)
- `vite build` (bundle)

## 5) Lint (optional)
```bash
npm run lint
```

## Notes
- This is a **prototype** and uses **mock data** (no real production monitoring feeds connected yet).
- If you get a port conflict when running `npm run dev`, stop the other dev server and rerun.

