/* TEST LESSON for the Claude Basics chat simulation (built by Bob, 23 Nov 2026).
 * It only exists to prove the chat engine works: typing, Retry, the + menu and the file picker.
 * Lasse will replace it with the real Basics lessons. Button names are placeholders
 * until they are checked on support.claude.com. */
AD.addLesson({
  id: 'basics-test-chat',
  track: 'basics',
  n: 1,
  title: 'Your first chat (test)',
  blurb: 'Ask Claude a question, get a new answer and share a file.',
  icon: '1',
  summary: 'You asked Claude a question, asked for a new answer and shared a file.',
  chat: {
    title: 'New chat',
    recents: ['Bakery name ideas', 'Email to landlord'],
    menu: [{ id: 'upload', label: 'Add files or photos', icon: 'file' }],
  },
  steps: [
    {
      say: `<p>This is a chat with Claude. You write a message, and Claude answers.</p><p>Ask for help with a party, e.g. <code>help me plan a birthday party for my mum</code>, and press <b>Enter</b>.</p>`,
      match: (v) => !v.startsWith('/') && v.split(/\s+/).length >= 4,
      answer: 'help me plan a birthday party for my mum',
      hints: [
        { match: /^\//, msg: 'No slash needed here. In the chat you just write normal sentences.' },
        { match: (v) => v.split(/\s+/).length < 4, msg: 'Write a full sentence, so Claude knows what you want. E.g. `help me plan a birthday party for my mum`.' },
      ],
      hint: 'Write a full sentence about the party and press Enter.',
      success: 'Claude answered in plain language. You can ask about anything this way.',
      respond: [
        { title: 'Birthday party for mum' },
        { think: 700 },
        {
          text: [
            'Happy to help. Here is a simple plan:',
            '1. Pick a date and invite guests two weeks ahead',
            '2. Choose a theme she loves, like a garden lunch',
            '3. Order or bake a cake',
            'How many guests are you thinking of?',
          ],
        },
      ],
    },
    {
      say: `<p>Not quite what you wanted? You don't have to start over.</p><p>Tap <b>Retry</b> under Claude's answer to get a new version.</p>`,
      click: 'retry',
      hints: {
        copy: 'That copies the answer. **Retry** is the round arrow next to it.',
        'new-chat': 'A new chat throws away this conversation. Use **Retry** under the answer instead.',
        attach: 'That button adds files. Look under Claude\'s answer for **Retry**.',
      },
      hint: 'Look for the round arrow under Claude\'s answer.',
      answerText: 'It is the round arrow under the answer.',
      success: 'Claude wrote a fresh answer to the same message.',
      respond: [
        { retry: true },
        { think: 600 },
        {
          text: [
            'Here is another idea: a **surprise dinner** at her favourite restaurant.',
            '- Book a table for the family',
            '- Ask everyone to bring one photo of her',
            '- Put the photos in a small album as the gift',
          ],
        },
      ],
    },
    {
      say: `<p>Claude can read files you share. You have the guest list as a PDF.</p><p>Tap <b>+</b> and choose <b>Add files or photos</b>.</p>`,
      click: 'upload',
      hints: {
        send: 'Send posts your message. To add a file, use **+** next to the message box.',
        'new-chat': 'That starts a new chat. Use **+** next to the message box.',
        retry: 'Retry gives a new answer. To add a file, use **+** next to the message box.',
        copy: 'That copies the answer. Use **+** next to the message box.',
      },
      hint: 'Tap **+** at the bottom left of the message box.',
      answerText: 'Tap **+**, then **Add files or photos**.',
      success: 'Now pick the file.',
      pause: false,
      xp: 5,
    },
    {
      say: `<p>Choose <b>guest-list.pdf</b>.</p>`,
      pick: 'guest-list.pdf',
      files: ['holiday-photo.jpg', 'guest-list.pdf', 'tax-return-2025.pdf'],
      hints: {
        'holiday-photo.jpg': 'That is a photo. You want the guest list: **guest-list.pdf**.',
        'tax-return-2025.pdf': 'Careful: only share what Claude needs. Pick **guest-list.pdf**.',
      },
      hint: 'Pick **guest-list.pdf**.',
      success: 'The file is attached to your next message.',
    },
    {
      say: `<p>The file sits in the message box. Now ask about it, e.g. <code>how many guests are on this list?</code></p>`,
      match: (v) => !v.startsWith('/') && /(guest|list|file|pdf|people|who|how many)/i.test(v),
      answer: 'how many guests are on this list?',
      hints: [{ match: /^\//, msg: 'No slash needed. Just ask a normal question about the list.' }],
      hint: 'Ask a question about the **guest list**.',
      success: 'Claude read the file before answering.',
      respond: [
        { think: 800 },
        {
          text: [
            'The list has **14 guests**. Two of them, Anna and Peter, are marked as vegetarian, so plan one meat-free main dish.',
          ],
        },
      ],
    },
    {
      say: `<p>Quick check.</p><p><b>Claude's answer wasn't what you wanted. What is the fastest fix?</b></p>`,
      choices: [
        { text: 'Tap Retry, or tell Claude what to change', right: true },
        { text: 'Start a new chat and type everything again', why: 'That works, but you lose the conversation. Retry or a short follow-up is faster.' },
        { text: 'Nothing. The first answer is all you get', why: 'You can always ask again. Claude keeps the conversation in mind.' },
      ],
      success: 'Small corrections beat starting over.',
    },
  ],
});
