// Sources (checked 2026-11-23): https://code.claude.com/docs/en/sub-agents
// Notes: in current Claude Code `/agents` only prints a reminder (the old menu was v2.1.197 and earlier),
// so this lesson creates the subagent by asking Claude. Delegation rows use the documented `name(task)` format.
AD.addLesson({
  id: 'subagents',
  n: 14,
  title: 'Delegate with subagents',
  blurb: 'Let helpers do side tasks in their own context – and build your own.',
  icon: '⑂',
  pro: true,
  summary: 'You watched Claude delegate a search, created a test-runner subagent and called it by name.',
  article: 'blog/what-are-claude-code-subagents.html',
  start: 'claude',
  steps: [
    {
      say: `<p>Big searches fill your conversation with results you'll never read again. A <b>subagent</b> does the work in its own context and returns only a summary.</p><p>Ask Claude to <code>use a subagent to find where todos are saved and loaded</code></p>`,
      match: (v) => !v.startsWith('/') && /(sub-?agent|agent|explore)/i.test(v) && /(sav|load|stor|persist)/i.test(v),
      answer: 'use a subagent to find where todos are saved and loaded',
      hints: [
        { match: /^\//, msg: 'No slash needed – ask in plain English.' },
        { match: (v) => !/(sub-?agent|agent|explore)/i.test(v), msg: 'Mention a **subagent**, so Claude hands the search to a helper.' },
        { match: (v) => !/(sav|load|stor|persist)/i.test(v), msg: 'Say what to look for: where todos are **saved** and **loaded**.' },
      ],
      hint: 'Ask Claude to use a subagent to find where todos are saved and loaded.',
      success: '`Explore` is a built-in, read-only subagent for searching code. Only its summary reached you.',
      respond: [
        { think: 800 },
        { tool: 'Explore', arg: 'Find where todos are saved and loaded', out: 'Done' },
        {
          text: [
            'Todos are saved and loaded in one place:',
            '- `src/storage.js` – `loadTodos()` and `saveTodos(todos)` use localStorage',
            '- `src/app.js` – calls `loadTodos()` on start and `saveTodos()` after every change',
          ],
        },
      ],
    },
    {
      say: `<p>You can also make your own subagent. Just ask Claude to write it.</p><p>Ask: <code>create a project subagent called test-runner that runs the tests and reports failures</code></p>`,
      match: (v) => !v.startsWith('/') && /(create|make|add|build|set up|write)/i.test(v) && /agent/i.test(v) && /test[- ]?runner/i.test(v),
      answer: 'create a project subagent called test-runner that runs the tests and reports failures',
      hints: [
        { match: /^\/agents/, msg: 'In current Claude Code, `/agents` just reminds you to ask Claude. Ask in plain English instead.' },
        { match: /^\//, msg: 'No slash needed – describe the subagent in plain English.' },
        { match: (v) => !/test[- ]?runner/i.test(v), msg: 'Give it a name: call it `test-runner`.' },
        { match: (v) => !/agent/i.test(v), msg: 'Say that you want a **subagent**.' },
      ],
      hint: 'Ask Claude to **create** a subagent called `test-runner`.',
      successTitle: 'Request sent.',
      success: 'Claude is preparing the subagent file…',
      respond: [
        { think: 900 },
        { text: "I'll create `.claude/agents/test-runner.md`. It gets only Bash, Read and Grep, so it can run tests but never edit code." },
      ],
      pause: false,
    },
    {
      say: `<p>A subagent is just a Markdown file in <code>.claude/agents/</code>: a name, a description that tells Claude when to use it, its tools, and its instructions.</p><p>Looks good. Approve <b>only this file</b>.</p>`,
      menu: {
        title: 'Create file',
        bodyHtml: true,
        body:
          '<span class="t-dim">.claude/agents/test-runner.md</span>\n' +
          '<span class="t-green">+ ---</span>\n' +
          '<span class="t-green">+ name: test-runner</span>\n' +
          '<span class="t-green">+ description: Runs the test suite and reports failures. Use after code changes.</span>\n' +
          '<span class="t-green">+ tools: Bash, Read, Grep</span>\n' +
          '<span class="t-green">+ ---</span>\n' +
          '<span class="t-green">+ Run npm test. Report which tests fail and why. Never edit files.</span>',
        question: 'Do you want to create test-runner.md?',
        options: ['Yes', 'Yes, allow all edits during this session (shift+tab)', 'No, and tell Claude what to do differently (esc)'],
      },
      answer: 0,
      hints: {
        1: 'That lets Claude make **every** future edit without asking. Approve only this file.',
        2: 'That rejects the file – but it looks right.',
      },
      hint: 'Pick the option that approves just this one file – like in lesson 2.',
      success: 'Saved in the project, so everyone working on it gets the same subagent.',
      respond: [
        { tool: 'Write', arg: '.claude/agents/test-runner.md', out: 'Wrote 6 lines to .claude/agents/test-runner.md' },
        { text: '`test-runner` is ready. I can pick it myself when its description fits, or you can call it by name.' },
      ],
    },
    {
      say: `<p>Call your subagent by name with <code>@agent-</code> plus its name.</p><p>Type <code>@agent-test-runner run the tests</code></p>`,
      match: (v) => /^@agent-test-runner\b/.test(v) && v.replace(/^@agent-test-runner/, '').trim().length >= 3,
      answer: '@agent-test-runner run the tests',
      hints: [
        { match: /^@agent-test-runner\s*$/, msg: 'Tell it what to do too: `@agent-test-runner run the tests`.' },
        { match: /@test-?runner/, msg: 'Agents need the `agent-` prefix: `@agent-test-runner`.' },
        { match: /^\/agent/, msg: '`/` is for commands. To call an agent, start with `@`.' },
        { match: /test[- ]?runner/i, msg: 'Start with `@agent-test-runner` so Claude knows exactly which subagent to use.' },
      ],
      hint: 'Type `@agent-test-runner run the tests`.',
      success: 'The full test log stayed with the subagent. You only got the result.',
      respond: [
        { think: 600 },
        { tool: 'test-runner', arg: 'Run the test suite', out: 'Done' },
        { text: '**test-runner** reports: all 12 tests pass. No failures.' },
      ],
    },
    {
      say: `<p><b>Why hand a task to a subagent instead of doing it in the main conversation?</b></p>`,
      choices: [
        { text: 'It works in its own context, so your conversation stays short and focused', right: true },
        { text: 'It lets Claude skip asking for permission', why: 'No – subagents still follow permissions. Their benefit is a separate context.' },
        { text: 'It is the only way Claude can run tests', why: 'Claude can run `npm test` itself. A subagent just keeps the noisy output out of your conversation.' },
      ],
      success: 'Side task with lots of output → subagent. Your context (remember `/context`?) stays clean.',
    },
  ],
});
