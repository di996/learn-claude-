# AgentDrills (working name)

Learn Claude Code by doing it, not by watching videos. Bite-sized lessons in a realistic, simulated terminal with instant hints, XP and streaks.

Independent training project. Not affiliated with Anthropic.

## Run locally

Static site, no build step:

```bash
python3 -m http.server 8000
```

Open http://localhost:8000

## Structure

- `index.html` – landing page
- `learn.html` – lesson dashboard
- `lesson.html` – lesson player
- `js/terminal.js` – simulated Claude Code terminal
- `js/engine.js` – lesson runner (steps, answer checking, hints, XP)
- `js/progress.js` – progress, XP and streak in localStorage
- `js/lessons/` – one data file per lesson
