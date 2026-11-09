// Quick reference content. Same tiles and terms as the lessons. Sources: docs/CONTENT_SOURCES.md.
// Each section: essentials (always visible) and more (expandable detail).

export const referenceSections = [
  {
    id: 'tiles',
    title: 'Tiles',
    summary: 'Three numbered suits, plus honour tiles with no numbers.',
    blocks: [
      { label: 'Dots', text: 'Circles, numbered 1 to 9.', tiles: ['dots-1', 'dots-2', 'dots-3', 'dots-4', 'dots-5', 'dots-6', 'dots-7', 'dots-8', 'dots-9'] },
      { label: 'Bamboo', text: 'Sticks, numbered 1 to 9. The 1 is drawn as a bird.', tiles: ['bamboo-1', 'bamboo-2', 'bamboo-3', 'bamboo-4', 'bamboo-5', 'bamboo-6', 'bamboo-7', 'bamboo-8', 'bamboo-9'] },
      { label: 'Characters', text: 'A numeral above 萬, numbered 1 to 9.', tiles: ['characters-1', 'characters-2', 'characters-3', 'characters-4', 'characters-5', 'characters-6', 'characters-7', 'characters-8', 'characters-9'], numerals: true },
      { label: 'Winds', text: 'East 東, South 南, West 西, North 北. Honour tiles.', tiles: ['wind-east', 'wind-south', 'wind-west', 'wind-north'] },
      { label: 'Dragons', text: 'Red 中, Green 發 and White (a blank frame). Honour tiles.', tiles: ['dragon-red', 'dragon-green', 'dragon-white'] },
    ],
    more: {
      title: 'How many tiles are in a set?',
      points: [
        'There are four copies of every suit and honour tile: 108 suit tiles and 28 honour tiles.',
        'Eight Flower tiles bring the set to 144. Each Flower is unique. When you draw one, set it aside and draw a replacement. Flowers never form sets.',
      ],
    },
  },
  {
    id: 'sets',
    title: 'Pairs and sets',
    summary: 'A complete hand is usually four sets and a pair.',
    blocks: [
      { label: 'Chow', text: 'A run: three numbers in a row from one suit. Honour tiles can’t make a Chow, and 9 doesn’t wrap round to 1.', tiles: ['bamboo-3', 'bamboo-4', 'bamboo-5'] },
      { label: 'Pung', text: 'Three identical tiles: any suit or honour tile (Flowers never form sets).', tiles: ['dragon-red', 'dragon-red', 'dragon-red'] },
      { label: 'Kong', text: 'Four identical tiles. Counts as one set; draw a replacement tile after making it.', tiles: ['wind-west', 'wind-west', 'wind-west', 'wind-west'] },
      { label: 'Pair', text: 'Two identical tiles. A standard complete hand needs exactly one.', tiles: ['dots-8', 'dots-8'] },
    ],
  },
  {
    id: 'turn',
    title: 'Your turn',
    summary: 'Draw one, discard one. Play moves counterclockwise.',
    steps: [
      'Between turns you hold 13 tiles (Flowers and Kong replacements aside).',
      'Draw one tile from the wall: the face-down tiles stacked in a square in the middle of the table.',
      'Unless you can declare a legal win (see Winning in MCR), discard one tile face up. You’re back to 13.',
      'The next turn is the player on your right.',
    ],
    seats: true,
    more: {
      title: 'Starting a hand',
      points: [
        'After the deal, the dealer (East) holds 14 tiles and starts by discarding. Everyone else holds 13.',
        'Turn order runs East, South, West, North: the dealer, then the player on the dealer’s right, and so on.',
      ],
    },
  },
  {
    id: 'calls',
    title: 'Calls',
    summary: 'You can claim another player’s discard to complete a set or your hand. Some tables say the calls in Mandarin, so the Chinese names are shown too.',
    calls: [
      { name: 'Chow', zh: '吃', pinyin: 'chī', from: 'Only the player on your left', text: 'Say “Chi”. Completes a run. Show the set face up, then discard.' },
      { name: 'Pung', zh: '碰', pinyin: 'pèng', from: 'Any player', text: 'Completes three identical tiles. Show the set face up, then discard.' },
      { name: 'Kong', zh: '杠', pinyin: 'gàng', from: 'Any player', text: 'Completes four identical tiles. Draw a replacement, then discard.' },
      { name: 'Hu', zh: '和', pinyin: 'hú', from: 'Any player, or your own draw', text: 'Completes your hand for a win (see Winning in MCR).' },
    ],
    more: {
      title: 'When two players call the same tile',
      points: [
        'Hu comes before every other call.',
        'Pung and Kong come before Chow.',
      ],
    },
  },
  {
    id: 'winning',
    title: 'Winning in MCR',
    summary: 'A complete hand and at least 8 points.',
    essentials: [
      'Complete your hand: in most hands, four sets and a pair (14 tiles, plus one for each Kong).',
      'The hand must score at least 8 points. Flower points don’t count toward the 8.',
      'Call “Hu” when a drawn tile or another player’s discard completes a hand that meets both points above.',
      'Not sure it scores 8? Ask your table before you call.',
    ],
    more: {
      title: 'Exceptions and special hands',
      points: [
        'Chicken Hand: a complete hand that would otherwise score no points counts as 8 points.',
        'Special shapes such as Seven Pairs and Thirteen Orphans can also win. They aren’t covered in the lessons.',
        'Declaring a win that doesn’t qualify is called a false Hu, and competitions penalise it. At a friendly table, ask first.',
      ],
    },
  },
];

export const referenceIds = referenceSections.map((s) => s.id);
