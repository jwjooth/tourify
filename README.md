# Tourify

Tourify is a TypeScript-first web application for building and delivering interactive guided tours in web applications. It provides a lightweight, extensible core and components for creating step-by-step user onboarding, feature tours, and walkthroughs.

Key goals:
- Lightweight, framework-agnostic core built with TypeScript
- Reusable UI components and hook-style APIs
- Easy configuration and theming
- Testable and accessible-by-default tours

Tech stack:
- Language: TypeScript
- Frontend: framework-agnostic components (commonly used with React / Preact / Svelte)
- Styling: CSS modules / modern CSS
- Tooling: Node.js, package manager (npm / pnpm / yarn), Vite / Rollup (project-dependent)

Maintainers
- jwjooth (GitHub): https://github.com/jwjooth

Table of contents
- Getting started
- Development
- Testing & Quality
- Contributing
- License
- Links to more documentation

Getting started (quick)
1. Prerequisites
   - Node.js 18+ (LTS recommended)
   - npm, pnpm or yarn
2. Install
   - Clone the repo:
     ```
     git clone https://github.com/jwjooth/tourify.git
     cd tourify
     ```
   - Install dependencies:
     ```
     npm install
     # or
     pnpm install
     # or
     yarn install
     ```
3. Local development
   ```
   npm run dev
   ```
   Open http://localhost:3000 (or the port shown by your dev server).

Build
```
npm run build
```
The build output will be in the configured output directory (e.g. `dist/`).

Testing
```
npm run test
npm run test:coverage
```

Lint & format
```
npm run lint
npm run format
```

Documentation
- High-level docs live in the /docs directory: architecture, API, deployment, and contribution guidelines.

Support & contact
- For issues and feature requests: open an issue in the repository.
- For urgent questions: mention @jwjooth on GitHub or open a discussion.

License
- This project is released under the MIT License. See LICENSE for details.