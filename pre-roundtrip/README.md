# ActiList

A grocery tracking app recreated locally from the [Figma Make prototype](https://www.figma.com/make/dyI214k1fYc5uqMgfWqt6g/ActiList-Grocery-Shopping-Dashboard) for a **code-to-canvas (roundtrip) demo**.

The idea: partners share a grocery list, and items can be forwarded straight from WhatsApp (a photo or a message) and land in the list automatically.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4
- Same source structure Figma Make emits, so the project round-trips cleanly through the Figma MCP (design-to-code and code-to-design).

## Run it

A Node runtime is bundled under `../.tooling`, so no system install is needed:

```bash
./start.sh
```

Then open http://localhost:5173.

If you have your own Node (20.19+ / 22.12+), you can instead run:

```bash
npm install
npm run dev
```

## Roundtrip demo flow

1. Import / open this design in Figma (via the Figma MCP connector).
2. Make a change on the canvas (e.g. restyle the WhatsApp card, add a list item).
3. Mark it dev-ready and push the update back into `src/App.tsx` through Cursor + the Figma MCP.
4. Hot reload shows the change live.

## Layout

```
actilist/
  index.html
  src/
    App.tsx       # the full dashboard UI
    main.tsx
    index.css     # Montserrat font + Tailwind + base theme
  public/
    assets/       # product images (avocado, milk, sourdough, dish soap, eggs)
    favicon.svg
```
