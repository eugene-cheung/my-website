const NAV_HEIGHT = 70;
const PADDING_X = 32;
const PADDING_TOP = 20;
const GAP = 14;

const CARD_HEIGHTS = {
  experience: 170,
  education: 150,
  projects: 150,
  skills: 120,
  contact: 140,
  quotes: 120,
  hobbies: 110,
  photos: 130,
};

const WIDE_IDS = new Set(['exp-customboxes', 'exp-researcher', 'exp-analog']);

const BENTO_ORDER = [
  'exp-customboxes',
  'edu-uiuc',
  'contact',
  'exp-researcher',
  'edu-uw',
  'skills-languages',
  'exp-analog',
  'proj-findmyuwprof',
  'skills-frameworks',
  'proj-datafest',
  'skills-tools',
  'skills-aiml',
  'quote-1',
  'quote-2',
  'quote-3',
  'hobby-1',
  'hobby-2',
  'hobby-3',
  'photo-1',
  'photo-2',
  'photo-3',
];

export function computeBentoLayout(cards, viewportWidth, viewportHeight) {
  const numCols = viewportWidth > 1100 ? 4 : viewportWidth > 768 ? 3 : 2;
  const availW = viewportWidth - 2 * PADDING_X;
  const colW = (availW - (numCols - 1) * GAP) / numCols;
  const startY = NAV_HEIGHT + PADDING_TOP;

  const cardMap = {};
  for (const card of cards) cardMap[card.id] = card;

  const colHeights = new Array(numCols).fill(startY);
  const positions = {};

  const orderedIds = [...BENTO_ORDER];
  for (const card of cards) {
    if (!orderedIds.includes(card.id)) orderedIds.push(card.id);
  }

  for (const id of orderedIds) {
    const card = cardMap[id];
    if (!card) continue;

    const isWide = WIDE_IDS.has(id) && numCols >= 3;
    const spanCols = isWide ? 2 : 1;
    const cardW = spanCols * colW + (spanCols - 1) * GAP;
    const cardH = CARD_HEIGHTS[card.category] || 130;

    let bestCol = 0;
    let bestTop = Infinity;
    let bestScore = Infinity;

    for (let c = 0; c <= numCols - spanCols; c++) {
      let maxH = 0;
      for (let j = c; j < c + spanCols; j++) {
        maxH = Math.max(maxH, colHeights[j]);
      }
      const bias = isWide ? c * 30 : 0;
      const score = maxH + bias;
      if (score < bestScore) {
        bestScore = score;
        bestTop = maxH;
        bestCol = c;
      }
    }

    const x = PADDING_X + bestCol * (colW + GAP) + cardW / 2;
    const y = bestTop + GAP + cardH / 2;

    positions[id] = { x, y, width: cardW, height: cardH };

    for (let c = bestCol; c < bestCol + spanCols; c++) {
      colHeights[c] = bestTop + GAP + cardH;
    }
  }

  const maxBottom = Math.max(...Object.values(positions).map(p => p.y + p.height / 2));
  const availableBottom = viewportHeight - 20;

  if (maxBottom > availableBottom) {
    const gridHeight = maxBottom - startY;
    const targetHeight = availableBottom - startY;
    const scale = targetHeight / gridHeight;
    for (const id of Object.keys(positions)) {
      const p = positions[id];
      p.y = startY + (p.y - startY) * scale;
      p.height *= scale;
    }
  }

  return positions;
}
