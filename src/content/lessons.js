// Lesson content, kept separate from the UI. Rule claims are mapped to MCR sections in docs/CONTENT_SOURCES.md.
//
// Step kinds
//   explain: { title, body: [paragraphs], visual?, note? }
//   choice:  { title, prompt, display?, layout: 'tiles' | 'text' | 'groups' | 'hand', options, answer, correct, wrong, wrongDefault }
//   select:  { title, prompt, tiles, count, goal: 'chow' | 'pung', correct, reasons }
//
// Visuals
//   { type: 'groups', groups: [{ label, tiles, detail? }] }   labelled rows of tiles
//   { type: 'tiles', tiles, label? }                          one row
//   { type: 'hand', tiles, highlight? }                       a player's hand (highlight = index of a new tile)
//   { type: 'seats', highlight? }                             the four seats and turn direction
//   { type: 'numerals' }                                       the 一 to 九 key

const NUMERAL_TIP = { type: 'numerals' };

// Lesson 3's practice hand (13 tiles). Drawing 5 Characters gives 2-3-4 Bamboo, 6-6-6 Dots,
// 3-4-5 Characters, 7-8 Characters, a pair of 9 Dots and a lone North Wind (14 tiles).
// Discarding North leaves 13 tiles waiting on 6 or 9 Characters for a complete shape.
const HAND_BEFORE = [
  'bamboo-2', 'bamboo-3', 'bamboo-4',
  'dots-6', 'dots-6', 'dots-6',
  'characters-3', 'characters-4', 'characters-7', 'characters-8',
  'dots-9', 'dots-9',
  'wind-north',
];
const HAND_AFTER_DRAW = [
  'bamboo-2', 'bamboo-3', 'bamboo-4',
  'dots-6', 'dots-6', 'dots-6',
  'characters-3', 'characters-4', 'characters-5', 'characters-7', 'characters-8',
  'dots-9', 'dots-9',
  'wind-north',
];
const DRAWN_INDEX = 8; // characters-5

const discardFeedback = (index) => {
  if (index <= 2) return 'You can legally discard any tile, but this one is part of your 2-3-4 Bamboo Chow. Look for a tile that doesn’t connect with anything.';
  if (index <= 5) return 'Legal, but this breaks up your Pung of 6 Dots. Look for a tile that doesn’t connect with anything.';
  if (index <= 8) return 'Legal, but this breaks the 3-4-5 Characters Chow you just made. Look for a tile that doesn’t connect with anything.';
  if (index <= 10) return '7 and 8 Characters are one tile away from a Chow, so they’re worth keeping. Look for a tile that doesn’t connect with anything.';
  if (index <= 12) return 'Those two 9 Dots are your pair, and a complete hand needs one. Look for a tile that doesn’t connect with anything.';
  return '';
};

export const lessons = [
  {
    id: 'meet-the-tiles',
    number: 1,
    title: 'Meet the tiles',
    outcome: 'Recognise suits and honours.',
    illustration: ['dots-5', 'bamboo-3', 'wind-east'],
    steps: [
      {
        kind: 'explain',
        title: 'Three suits, numbered 1 to 9',
        body: [
          'Most tiles belong to one of three suits: Dots, Bamboo or Characters. Each suit runs from 1 to 9.',
          'Characters tiles show a Chinese numeral above the character 萬 (wàn). The 1 of Bamboo is drawn as a bird.',
        ],
        visual: {
          type: 'groups',
          columns: true,
          groups: [
            { label: 'Dots', tiles: ['dots-1', 'dots-5', 'dots-9'] },
            { label: 'Bamboo', tiles: ['bamboo-1', 'bamboo-5', 'bamboo-9'] },
            { label: 'Characters', tiles: ['characters-1', 'characters-5', 'characters-9'] },
          ],
        },
      },
      {
        kind: 'choice',
        title: 'Spot the suit',
        prompt: 'Which tile is from the Bamboo suit?',
        layout: 'tiles',
        options: [
          { id: 'a', tile: 'dots-4' },
          { id: 'b', tile: 'bamboo-6' },
          { id: 'c', tile: 'characters-2' },
        ],
        answer: 'b',
        correct: 'Yes, that’s 6 Bamboo. Bamboo tiles show sticks; Dots show circles; Characters show a numeral above 萬.',
        wrong: {
          a: 'That’s 4 Dots. Dots tiles show circles. Look for the tile with sticks.',
          c: 'That’s 2 Characters: the numeral 二 above 萬. Look for the tile with sticks.',
        },
      },
      {
        kind: 'choice',
        title: 'Read a Characters tile',
        prompt: 'What number is this Characters tile?',
        display: { type: 'tiles', tiles: ['characters-5'] },
        aside: NUMERAL_TIP,
        layout: 'text',
        options: [
          { id: '3', label: '3' },
          { id: '5', label: '5' },
          { id: '9', label: '9' },
        ],
        answer: '5',
        correct: 'Right: 五 means 5, so this is 5 Characters. The top numeral gives the number; 萬 marks the suit.',
        wrongDefault: 'Not quite. Compare the top character with the key: 五 is 5.',
      },
      {
        kind: 'explain',
        title: 'Honour tiles: Winds and Dragons',
        body: [
          'Honour tiles have no numbers. There are four Winds (East, South, West and North) and three Dragons (Red, Green and White).',
          'A set has four copies of every suit and honour tile. Eight Flower tiles are extra: when you draw one, you set it aside and draw a replacement.',
        ],
        visual: {
          type: 'groups',
          columns: true,
          groups: [
            { label: 'Winds', tiles: ['wind-east', 'wind-south', 'wind-west', 'wind-north'] },
            { label: 'Dragons', tiles: ['dragon-red', 'dragon-green', 'dragon-white'] },
          ],
        },
      },
      {
        kind: 'choice',
        title: 'Find the honour tile',
        prompt: 'Which of these is an honour tile?',
        layout: 'tiles',
        options: [
          { id: 'a', tile: 'bamboo-1' },
          { id: 'b', tile: 'characters-9' },
          { id: 'c', tile: 'wind-north' },
        ],
        answer: 'c',
        correct: 'Yes, that’s North Wind (北). Winds and Dragons are honour tiles: they have no numbers.',
        wrong: {
          a: 'That bird is 1 Bamboo, a numbered suit tile. Look for a tile with no number.',
          b: 'That’s 9 Characters (九 means 9), a numbered suit tile. Look for a tile with no number.',
        },
      },
    ],
  },
  {
    id: 'build-a-combination',
    number: 2,
    title: 'Build a combination',
    outcome: 'Build sets and understand a complete hand.',
    illustration: ['bamboo-3', 'bamboo-4', 'bamboo-5'],
    steps: [
      {
        kind: 'explain',
        title: 'Sets are what you collect',
        body: [
          'During play you collect tiles into sets. These are the three you’ll see most.',
          'A Kong is four identical tiles. It also counts as a set, and you draw a replacement tile when you make one.',
        ],
        visual: {
          type: 'groups',
          groups: [
            { label: 'Chow', detail: 'Three numbers in a row, one suit', tiles: ['bamboo-3', 'bamboo-4', 'bamboo-5'] },
            { label: 'Pung', detail: 'Three identical tiles', tiles: ['dragon-red', 'dragon-red', 'dragon-red'] },
            { label: 'Pair', detail: 'Two identical tiles', tiles: ['dots-8', 'dots-8'] },
          ],
        },
      },
      {
        kind: 'select',
        title: 'Make a Chow',
        prompt: 'Select three tiles that make a Chow.',
        tiles: ['characters-6', 'dots-3', 'characters-8', 'bamboo-5', 'dragon-red', 'characters-7'],
        count: 3,
        goal: 'chow',
        correct: '6, 7 and 8 Characters: three numbers in a row from one suit. That’s a Chow.',
        reasons: {
          honour: 'Honour tiles have no numbers, so they can’t be part of a Chow. Try three numbered tiles.',
          'mixed-suits': 'These come from different suits. A Chow uses three tiles from the same suit.',
          'not-consecutive': 'Same suit, but the numbers aren’t in a row. A Chow needs three numbers in a row.',
          identical: 'Identical tiles make a Pung, not a Chow. A Chow needs three different numbers in a row.',
          default: 'That isn’t a Chow yet. Look for three numbers in a row from one suit.',
        },
      },
      {
        kind: 'choice',
        title: 'Check a Chow',
        prompt: 'Which group is a valid Chow?',
        layout: 'groups',
        options: [
          { id: 'a', tiles: ['bamboo-2', 'bamboo-4', 'bamboo-6'] },
          { id: 'b', tiles: ['dots-7', 'dots-8', 'dots-9'] },
          { id: 'c', tiles: ['characters-8', 'characters-9', 'characters-1'] },
          { id: 'd', tiles: ['dots-3', 'bamboo-4', 'characters-5'] },
        ],
        answer: 'b',
        correct: '7, 8 and 9 Dots are in a row and in one suit, so they make a Chow.',
        wrong: {
          a: '2, 4 and 6 skip numbers. A Chow needs numbers directly in a row.',
          c: 'Numbers don’t wrap round: 1 doesn’t follow 9. A Chow needs numbers directly in a row.',
          d: 'These are three different suits. A Chow stays in one suit.',
        },
      },
      {
        kind: 'select',
        title: 'Make a Pung',
        prompt: 'Select three tiles that make a Pung.',
        tiles: ['dots-5', 'wind-west', 'bamboo-5', 'wind-west', 'characters-5', 'wind-west'],
        count: 3,
        goal: 'pung',
        correct: 'Three West Winds: identical tiles, so that’s a Pung. Honour tiles can make Pungs and pairs, but never Chows.',
        reasons: {
          'same-number': 'Same number, different suits, so these aren’t identical. A Pung needs three identical tiles.',
          chow: 'That’s a Chow (a run). A Pung needs three identical tiles.',
          'not-identical': 'These tiles aren’t identical. A Pung needs three of exactly the same tile.',
          default: 'That isn’t a Pung yet. Look for three identical tiles.',
        },
      },
      {
        kind: 'explain',
        title: 'A complete hand: four sets and a pair',
        body: [
          'Most hands are completed with four sets and a pair: 14 tiles when there are no Kongs (each Kong adds one tile). Special hand shapes exist too, but they aren’t covered here.',
          'In MCR the shape alone isn’t enough to win. The hand must also score at least 8 points, and Flower tiles don’t count toward them. Your table can help you check.',
        ],
        visual: {
          type: 'groups',
          compact: true,
          groups: [
            { label: 'Chow', tiles: ['bamboo-2', 'bamboo-3', 'bamboo-4'] },
            { label: 'Pung', tiles: ['dots-6', 'dots-6', 'dots-6'] },
            { label: 'Chow', tiles: ['characters-3', 'characters-4', 'characters-5'] },
            { label: 'Chow', tiles: ['characters-7', 'characters-8', 'characters-9'] },
            { label: 'Pair', tiles: ['dots-9', 'dots-9'] },
          ],
        },
        note: 'This example shows the shape only. It is not a points calculation.',
      },
      {
        kind: 'choice',
        title: 'What a win needs',
        prompt: 'In MCR, what does a standard winning hand need?',
        layout: 'text',
        options: [
          { id: 'a', label: 'Four sets and a pair' },
          { id: 'b', label: 'Four sets and a pair, plus at least 8 points' },
          { id: 'c', label: 'Any 14 tiles' },
        ],
        answer: 'b',
        correct: 'Exactly. The shape comes first, and the hand must also reach 8 points. You don’t need to count points to start playing; ask your table.',
        wrong: {
          a: 'That’s the shape, but MCR also needs at least 8 points before you can declare a win.',
          c: 'Fourteen is the usual count (without Kongs), but the tiles must form four sets and a pair, and score at least 8 points.',
        },
      },
    ],
  },
  {
    id: 'try-a-guided-turn',
    number: 3,
    title: 'Try a guided turn',
    outcome: 'Practise drawing, discarding and calls.',
    illustration: ['dots-3', 'bamboo-4'],
    steps: [
      {
        kind: 'explain',
        title: 'How a turn works',
        body: [
          'Play moves counterclockwise, so the next turn is the player on your right. Between turns you hold 13 tiles.',
          'On your turn, draw one tile from the wall (the face-down tiles stacked in a square in the middle of the table), then discard one tile face up, unless you can declare a win. You’re back to 13.',
        ],
        visual: { type: 'seats' },
        note: 'Concept exercise: one turn from a simplified hand, not a full game.',
      },
      {
        kind: 'choice',
        title: 'Start your turn',
        prompt: 'It’s your turn and you hold these 13 tiles. What do you do first?',
        display: { type: 'hand', tiles: HAND_BEFORE, label: 'Your hand now · 13 tiles' },
        // Shown once the answer is correct, so the picture matches the feedback.
        displayAfter: { type: 'hand', tiles: HAND_AFTER_DRAW, highlight: DRAWN_INDEX, label: 'After drawing 5 Characters · 14 tiles' },
        layout: 'text',
        options: [
          { id: 'draw', label: 'Draw a tile from the wall' },
          { id: 'discard', label: 'Discard a tile' },
          { id: 'chow', label: 'Call Chow' },
        ],
        answer: 'draw',
        correct: 'Yes. You drew 5 Characters, which completes a 3-4-5 Characters Chow. You now hold 14 tiles.',
        wrong: {
          discard: 'You discard after drawing. With 13 tiles, start by drawing one.',
          chow: 'Calls are made on another player’s discard. On your own turn, start by drawing.',
        },
      },
      {
        kind: 'choice',
        title: 'Choose a discard',
        prompt: 'Now discard one tile. Which tile fits least with the rest?',
        layout: 'hand',
        handHighlight: DRAWN_INDEX,
        handLabel: 'Your hand after drawing · 14 tiles',
        handLabelAfter: 'After discarding North Wind · 13 tiles',
        options: HAND_AFTER_DRAW.map((tile, i) => ({ id: String(i), tile })),
        answer: '13',
        correct: 'Good choice. North Wind doesn’t connect with any other tile. You’re back to 13 tiles, and 6 or 9 Characters would complete your hand’s shape.',
        wrong: Object.fromEntries(HAND_AFTER_DRAW.map((_, i) => [String(i), discardFeedback(i)])),
      },
      {
        kind: 'choice',
        title: 'Who you can Chow from',
        prompt: 'Concept check: you hold 4 and 5 Dots. Whose discarded 6 Dots can you claim to make a Chow?',
        display: { type: 'tiles', tiles: ['dots-4', 'dots-5'] },
        layout: 'text',
        options: [
          { id: 'left', label: 'Only the player on your left' },
          { id: 'any', label: 'Any player' },
          { id: 'opposite', label: 'Only the player opposite' },
        ],
        answer: 'left',
        correct: 'Right. Chow can only be claimed from the player on your left, whose turn comes just before yours. Say “Chi” (the Chow call), show the set face up, then discard.',
        wrongDefault: 'Not quite. A Chow can only be claimed from the player on your left, whose turn comes just before yours.',
      },
      {
        kind: 'choice',
        title: 'Who you can Pung from',
        prompt: 'You hold two Red Dragons. The player opposite discards a Red Dragon. Can you claim it for a Pung?',
        display: { type: 'tiles', tiles: ['dragon-red', 'dragon-red'] },
        layout: 'text',
        options: [
          { id: 'yes', label: 'Yes, from any player' },
          { id: 'no', label: 'No, only from the player on your left' },
        ],
        answer: 'yes',
        correct: 'Yes. A Pung can be claimed from any player’s discard. If someone calls Chow on the same tile, Pung goes first.',
        wrong: {
          no: 'That rule is for Chow. A Pung can be claimed from any player’s discard.',
        },
      },
      {
        kind: 'explain',
        title: 'Calling a win',
        body: [
          'When a tile you draw, or another player’s discard, completes your hand, you can call “Hu” to win, as long as the hand scores at least 8 points.',
          'Points take practice. At a beginner table, ask before you call and someone can check with you.',
        ],
        visual: { type: 'tiles', tiles: ['characters-6', 'characters-7', 'characters-8'], label: 'In your practice hand, 6 or 9 Characters completes the shape.' },
      },
    ],
  },
];

export const lessonIds = lessons.map((l) => l.id);
export const getLesson = (id) => lessons.find((l) => l.id === id) || null;
