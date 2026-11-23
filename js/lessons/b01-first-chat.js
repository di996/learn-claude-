// Sources (checked 2026-11-23): https://support.claude.com/en/articles/8114491-get-started-with-claude
// Claude Basics B1 (Lasse). Running project for the Basics track: planning mum's 60th birthday party.
AD.addLesson({
  id: 'basics-first-chat',
  track: 'basics',
  n: 1,
  title: 'Your first chat',
  blurb: 'Ask Claude for help and keep the conversation going.',
  icon: '1',
  summary: 'You asked Claude for help, answered its questions and got ideas that fit your party.',
  chat: {
    title: 'New chat',
    recents: [],
  },
  steps: [
    {
      say: `<p>Talk to Claude like you would to a helpful friend. No special words needed.</p><p>Ask for help with the party, e.g. <code>help me plan my mum's 60th birthday party</code>, and press <b>Enter</b> or tap send.</p>`,
      match: (v) => !v.startsWith('/') && v.split(/\s+/).length >= 4 && /(party|birthday|60|plan)/i.test(v),
      answer: "help me plan my mum's 60th birthday party",
      hints: [
        { match: /^\//, msg: 'No slash needed. In the chat you write normal sentences.' },
        { match: /^(hi|hello|hey)\b/i, msg: 'Saying hi is fine, but tell Claude what you need, e.g. `help me plan my mum\'s 60th birthday party`.' },
        { match: (v) => v.split(/\s+/).length < 4, msg: 'Write a full sentence, so Claude knows what you want.' },
      ],
      hint: 'Ask Claude to help you plan the **birthday party**.',
      success: 'Claude answered and asked you questions back. That is normal.',
      respond: [
        { title: "Mum's 60th birthday party" },
        { think: 700 },
        {
          text: [
            "A 60th is a great reason to celebrate. To make a plan that fits, tell me:",
            '1. How many guests?',
            '2. Where do you want to hold it?',
            '3. Roughly what budget?',
          ],
        },
      ],
    },
    {
      say: `<p>Claude asked questions. Just reply in the same chat, like a text message.</p><p>Tell it the guests and the place, e.g. <code>about 20 guests, in our garden</code>.</p>`,
      match: (v) => !v.startsWith('/') && /(\d+|guest|people|garden|home|house|park|hall|restaurant)/i.test(v) && !/help me plan/i.test(v),
      answer: 'about 20 guests, in our garden',
      hints: [
        { match: /^\//, msg: 'No slash needed. Just reply with the details.' },
        { match: /help me plan/i, msg: 'No need to repeat your request. Claude remembers it. Just answer its questions, e.g. `about 20 guests, in our garden`.' },
      ],
      hint: 'Answer Claude: **how many guests** and **where**.',
      success: 'You kept the conversation going instead of starting over.',
      respond: [
        { think: 600 },
        {
          text: [
            '20 guests in a garden sounds lovely. Here is a first plan:',
            '- An afternoon garden lunch on a Saturday',
            '- Invitations out three weeks before',
            '- A gazebo or tent in case it rains',
          ],
        },
      ],
    },
    {
      say: `<p>Now ask a follow-up question about one part of the party, e.g. <code>what food should we serve?</code></p>`,
      match: (v) => !v.startsWith('/') && /(food|eat|menu|serve|cake|drink|lunch|dinner|snack)/i.test(v),
      answer: 'what food should we serve?',
      hints: [
        { match: /^\//, msg: 'No slash needed. Just ask your question.' },
        { match: /(20|garden|guests)/i, msg: 'Claude already knows the guests and the place. Ask about something new, like the **food**.' },
      ],
      hint: 'Ask what **food** to serve.',
      success: 'Look: Claude used the 20 guests and the garden without you repeating them.',
      respond: [
        { think: 700 },
        {
          text: [
            'For **20 guests in a garden**, food that is easy to serve outside works best:',
            '- A cold buffet with salads, bread and quiche',
            '- One warm dish, like a big pan of paella',
            '- A cake with her name, plus fruit for anyone who skips cake',
          ],
        },
      ],
    },
    {
      say: `<p>Quick check.</p><p><b>Why did Claude's food ideas fit 20 guests in a garden?</b></p>`,
      choices: [
        { text: 'Claude remembers what you said earlier in the same chat', right: true },
        { text: 'Claude guessed the details', why: 'It didn\'t guess. You told it the guests and the place two messages earlier.' },
        { text: 'Claude looked at photos of your garden', why: 'You haven\'t shared any photos. It used what you wrote earlier in this chat.' },
      ],
      success: 'Keep related questions in one chat, so Claude has the whole picture.',
    },
  ],
});
