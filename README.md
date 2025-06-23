# site.albro - My personal playground

This website is a experiment on my free time. I want to build a hub website to redirect or integrate other project using [Astro Islands architecture](https://docs.astro.build/en/concepts/islands/) with various technologies of my experimentations (apps, games, tools, etc). 

This implements Brutal, a minimal neobrutalist theme for [Astro](https://astro.build/) made by [ElianCodes](https://www.elian.codes/). It's based on Neobrutalist Web Design, a movement that aims to create websites with a minimalistic and functional design. It has some integrations like Image Optimization, RSS, Sitemap, ready to get your SEO done right.

### Commands

All commands are run from the root of the project, from a terminal:

(Here I use PNPM, no problem if you use NPM or Yarn)

| Command             | Action                                             |
| :------------------ | :------------------------------------------------- |
| `pnpm install`      | Installs dependencies                              |
| `pnpm dev`          | Starts local dev server at `localhost:4321`        |
| `pnpm build`        | Build your production site to `./dist/`            |
| `pnpm preview`      | Preview your build locally, before deploying       |
| `pnpm astro ...`    | Run CLI commands like `astro add`, `astro preview` |
| `pnpm astro --help` | Get help using the Astro CLI                       |

## Features

- [ ] Hub
- [x] Resume: Normal
- [ ] Resume: Caracter Selector
- [ ] Games (Flappy-dino, Emojis...)
- [ ] Tools (Converters, formaters)
- [ ] Gallery (IG impl. or homemade)
- [ ] Seasons
- [ ] BuJo
- [ ] Habit tracker/metrics

## Integrations

### Vercel

This website is automatically build and deployed using Vercel.

### UnoCSS

In this theme, I'm using [UnoCSS](https://uno.antfu.me/) to generate the CSS. It's a utility-first CSS framework that uses a single class to style elements. It's very easy to use and has a lot of features. It's setup to be completely compatible with TailwindCSS, with the advantage of being able to use PureCSS icons. You can always switch out UnoCSS for TailwindCSS if you want to, without breaking the general styles.

### Sitemap

To generate the sitemap, you don't need to do anything. It's automatically generated when you build your site. You'll just need to switch out the `site` on `astro.config.ts` to your own.

```js title="astro.config.mjs"
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://example.com',
});
```

### RSS

The RSS feed is automatically generated from the Markdown files in the `src/content/blog` folder. You can ofcourse completely change this to your own needs.

The RSS will output to `https://example.com/feed.xml` by default. You can change this, by renaming `src/pages/feed.xml.js`.
