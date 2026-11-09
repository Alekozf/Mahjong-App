// Session guide content. This describes a PROPOSED beginner-friendly session: no real dates, venues,
// hosts or bookings. ACYA ANU's public posts are context only; their arrangements are unconfirmed.

export const exampleSession = {
  label: 'Example session',
  title: 'Beginner-friendly mahjong',
  points: ['Tables for new and regular players', 'Hosts welcome newcomers at the door', 'Tiles and tables set up for you'],
};

export const guideSections = [
  {
    id: 'who',
    title: 'Who the session is for',
    paragraphs: [
      'Anyone curious about mahjong: complete beginners, people who played years ago, and regular players.',
      'You don’t need to know the rules, speak Mandarin or bring anyone. Come on your own or with a friend.',
    ],
  },
  {
    id: 'before',
    title: 'Before you arrive',
    list: [
      'No preparation is needed. The lessons in this app are optional.',
      'Hosts set up the tiles and tables.',
      'Play is social, not competitive. Questions are welcome at any point.',
      'Tables may use different house rules. This app teaches MCR basics.',
    ],
  },
  {
    id: 'arrival',
    title: 'Your first few minutes',
    steps: [
      { title: 'Find the welcome point', text: 'A host waits near the entrance to greet newcomers.' },
      { title: 'Say how much you’ve played', text: '“Never”, “a little” or “I play often” are all good answers. It helps the host find you the right table.' },
      { title: 'Get help joining a table', text: 'The host takes you to a table with a free seat and someone ready to explain as you go.' },
    ],
  },
  {
    id: 'options',
    title: 'Ways to take part',
    options: [
      { icon: 'explain', title: 'Join an explanation table', text: 'Play slowly while a regular player explains each step.' },
      { icon: 'watch', title: 'Watch a round first', text: 'Sit beside a table and see a hand played before you join.' },
      { icon: 'friend', title: 'Come with a friend', text: 'Ask to sit together and learn side by side.' },
    ],
  },
  {
    id: 'help',
    title: 'Asking for help',
    paragraphs: ['Everyone at a beginner table expects questions. Phrases that work well:'],
    phrases: ['“Could you show me that again?”', '“Can I watch one round first?”', '“What does that call mean?”', '“Is this a set?”'],
  },
  {
    id: 'respect',
    title: 'Respect at the table',
    list: [
      'Everyone is learning at their own pace. Take your time.',
      'Nobody is expected to teach or explain Chinese culture because of their background.',
      'Hosts step in if anyone is made to feel unwelcome. Talk to a host about any concern.',
      'You can take a break or leave whenever you like.',
    ],
  },
];
