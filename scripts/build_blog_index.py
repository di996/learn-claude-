"""Generates blog/index.html for AgentDrills from the article list below."""
import html, sys, pathlib

OUT = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else pathlib.Path(__file__).resolve().parent.parent / "blog" / "index.html"

CATS = [
    ("getting-started", "Getting Started"),
    ("workflow", "Workflow"),
    ("permissions", "Permissions & Safety"),
    ("commands", "Commands & Memory"),
    ("context", "Context & Sessions"),
    ("testing", "Testing & Debugging"),
    ("building", "Building Projects"),
    ("git", "Git & GitHub"),
    ("subagents", "Subagents & Automation"),
]
CAT_NAME = dict(CATS)

# (category, title, one-line description, slug or None, minutes)
POSTS = [
    ("getting-started", "Your first Claude Code session", "Where to launch Claude, how to ask good first questions and how to read the ⏺ tool calls.", "getting-started-with-claude-code", 6),
    ("getting-started", "Installing Claude Code", "Set up Claude Code on Mac, Windows and Linux, and sign in for the first time.", "how-to-install-claude-code", 9),
    ("getting-started", "Claude Code vs. chatting with Claude", "Which tool fits which job, and how to move work between them.", "claude-code-vs-claude-chat", 9),
    ("permissions", "Approving edits and commands", "What each option in the permission menu does, and when to say yes, \"don't ask again\" or no.", "claude-code-permissions", 6),
    ("commands", "Slash commands and CLAUDE.md", "The commands you'll use every day, and the memory file that makes every session smarter.", "claude-code-slash-commands-and-claude-md", 6),
    ("workflow", "@ file mentions and ! bash mode", "Hand Claude the exact files it needs and run shell commands without leaving the session.", "claude-code-file-mentions-and-bash-mode", 5),
    ("workflow", "Plan mode and auto-accept edits", "Switch modes with Shift+Tab, let Claude plan before it codes, and know when to let it work freely.", "claude-code-plan-mode", 6),
    ("context", "Interrupt, compact and resume", "Stop Claude with Esc, keep long sessions sharp with /compact and pick up tomorrow with --continue.", "claude-code-context-and-sessions", 6),
    # Coming soon
    ("getting-started", "Claude Code in VS Code and JetBrains", "Use Claude Code next to your editor and share what you're looking at.", None, 0),
    ("getting-started", "Choosing a model with /model", "When a faster model is enough, and when to switch to the most capable one.", None, 0),
    ("workflow", "Prompts that get good results", "Turn vague requests into clear tasks Claude can finish in one go.", None, 0),
    ("workflow", "Working with screenshots and images", "Paste a screenshot of a bug or a design and let Claude build from it.", None, 0),
    ("workflow", "Reviewing diffs like a pro", "Read Claude's changes quickly and spot the ones that matter.", None, 0),
    ("workflow", "Rewinding with Esc Esc", "Jump back to an earlier message and take the conversation in a new direction.", None, 0),
    ("permissions", "Permission rules in settings", "Write allow and deny rules once, so the whole team shares the same safe defaults.", None, 0),
    ("permissions", "Safe experiments with git checkpoints", "Commit before big changes so every experiment can be undone in seconds.", None, 0),
    ("permissions", "Keeping secrets out of Claude's context", "Protect API keys, passwords and .env files while you work.", None, 0),
    ("commands", "Writing a great CLAUDE.md", "What to put in your project memory, what to leave out, and real examples.", None, 0),
    ("commands", "Creating custom slash commands", "Turn your favourite prompts into one-word commands your team can share.", None, 0),
    ("commands", "Personal memory across projects", "Set preferences once in ~/.claude so every project follows them.", None, 0),
    ("context", "Understanding /context", "Read the context breakdown and know what's filling up Claude's memory.", None, 0),
    ("context", "Finding old sessions with /resume", "Get back to last week's conversation without starting over.", None, 0),
    ("context", "Keeping usage and costs down", "Habits that make each session lighter, faster and cheaper.", None, 0),
    ("testing", "Test-driven development with Claude", "Write the tests first and let Claude make them pass.", None, 0),
    ("testing", "Debugging with stack traces and logs", "Give Claude the right evidence and get to the root cause faster.", None, 0),
    ("testing", "Fixing failing CI builds", "Paste the CI output and let Claude reproduce and fix the failure.", None, 0),
    ("testing", "Adding tests to legacy code", "Cover old, untested code safely before you change it.", None, 0),
    ("building", "Build a website from scratch", "Go from an empty folder to a working site in one session.", None, 0),
    ("building", "Build a command-line tool", "Create a small CLI with arguments, help text and tests.", None, 0),
    ("building", "Refactoring a large codebase safely", "Split big changes into small, reviewable steps.", None, 0),
    ("building", "Joining an unfamiliar codebase", "Use Claude to understand a new project before you touch it.", None, 0),
    ("git", "Commits and commit messages", "Let Claude stage changes and write clear commit messages.", None, 0),
    ("git", "Pull requests with Claude Code", "Create, describe and update pull requests from the terminal.", None, 0),
    ("git", "Resolving merge conflicts", "Have Claude explain both sides of a conflict and merge them correctly.", None, 0),
    ("subagents", "What are subagents?", "How Claude hands work to helper agents with their own context.", "what-are-claude-code-subagents", 8),
    ("subagents", "Creating your own subagent", "Define a specialist agent, like a reviewer or tester, with its own rules.", None, 0),
    ("subagents", "Hooks: run scripts automatically", "Format, lint or block actions every time Claude uses a tool.", None, 0),
    ("subagents", "Connecting tools with MCP", "Give Claude access to services like GitHub, databases and docs.", None, 0),
    ("subagents", "Skills: reusable know-how", "Package instructions and files Claude can load when a task needs them.", None, 0),
    ("subagents", "Headless mode with claude -p", "Run Claude in scripts and automations without the interactive screen.", None, 0),
]

assert len(POSTS) == 40, len(POSTS)
e = html.escape

counts = {k: sum(1 for p in POSTS if p[0] == k) for k, _ in CATS}
chips = [f'<button type="button" class="chip on" data-cat="all" aria-pressed="true">All <span>{len(POSTS)}</span></button>']
chips += [f'<button type="button" class="chip" data-cat="{k}" aria-pressed="false">{e(n)} <span>{counts[k]}</span></button>' for k, n in CATS]

cards = []
for live in (True, False):
    for cat, title, desc, slug, mins in POSTS:
        if bool(slug) != live:
            continue
        tag = f'<span class="tag cat">{e(CAT_NAME[cat])}</span>'
        if slug:
            cards.append(
                f'      <a class="post-card" data-cat="{cat}" href="{slug}.html">\n'
                f'        <div class="post-top">{tag}<span class="post-meta">{mins} min read</span></div>\n'
                f'        <h2>{e(title)}</h2>\n'
                f'        <p>{e(desc)}</p>\n'
                f'        <span class="more">Read article →</span>\n'
                f'      </a>'
            )
        else:
            cards.append(
                f'      <div class="post-card soon" data-cat="{cat}">\n'
                f'        <div class="post-top">{tag}<span class="tag soon">Coming soon</span></div>\n'
                f'        <h2>{e(title)}</h2>\n'
                f'        <p>{e(desc)}</p>\n'
                f'      </div>'
            )

live_n = sum(1 for p in POSTS if p[3])
page = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <link rel="icon" href="data:,">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Claude Code Guides &amp; Tutorials · AgentDrills Blog</title>
  <meta name="description" content="Practical Claude Code guides by topic: getting started, workflow, permissions, slash commands and CLAUDE.md, context and sessions, testing, building projects, git and subagents.">
  <link rel="stylesheet" href="../css/styles.css">
</head>
<body>
  <nav class="nav">
    <div class="wrap">
      <a class="brand" href="../index.html"><span class="brand-mark">&gt;_</span>AgentDrills</a>
      <div class="nav-links">
        <a href="../index.html#curriculum">Lessons</a>
        <a href="index.html" aria-current="page">Blog</a>
        <a class="btn small" href="../learn.html">Start free</a>
      </div>
    </div>
  </nav>

  <main class="wrap">
    <header class="blog-head">
      <h1>Claude Code guides</h1>
      <p class="intro">Practical articles on every part of Claude Code, sorted by topic. Each guide comes with a hands-on lesson, so you can practice what you just read. {live_n} published, {len(POSTS) - live_n} on the way.</p>
    </header>

    <div class="chips" role="toolbar" aria-label="Filter by topic">
      {chr(10).join('      ' + c for c in chips).strip()}
    </div>
    <p class="filter-note muted" id="filterNote" aria-live="polite"></p>

    <div class="post-list" id="posts">
{chr(10).join(cards)}
    </div>
  </main>

  <footer class="footer">
    <div class="wrap">
      <span>© AgentDrills</span>
      <span>Independent training resource. Not affiliated with Anthropic.</span>
    </div>
  </footer>

  <script>
    (function () {{
      const chips = [...document.querySelectorAll('.chip')];
      const cards = [...document.querySelectorAll('#posts .post-card')];
      const note = document.getElementById('filterNote');
      function apply(cat) {{
        if (!chips.some((c) => c.dataset.cat === cat)) cat = 'all';
        chips.forEach((c) => {{
          const on = c.dataset.cat === cat;
          c.classList.toggle('on', on);
          c.setAttribute('aria-pressed', on);
        }});
        let shown = 0, live = 0;
        cards.forEach((card) => {{
          const vis = cat === 'all' || card.dataset.cat === cat;
          card.hidden = !vis;
          if (vis) {{ shown++; if (!card.classList.contains('soon')) live++; }}
        }});
        note.textContent = cat === 'all' ? '' : `${{shown}} article${{shown === 1 ? '' : 's'}} · ${{live}} published`;
      }}
      chips.forEach((c) => c.addEventListener('click', () => {{
        apply(c.dataset.cat);
        history.replaceState(null, '', c.dataset.cat === 'all' ? location.pathname : '#' + c.dataset.cat);
      }}));
      apply(location.hash.slice(1) || 'all');
    }})();
  </script>
</body>
</html>
"""
OUT.write_text(page)
print("wrote", OUT, len(POSTS), "posts")
