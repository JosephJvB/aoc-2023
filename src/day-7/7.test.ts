const CARDS = [
  'A',
  'K',
  'Q',
  'J',
  'T',
  '9',
  '8',
  '7',
  '6',
  '5',
  '4',
  '3',
  '2',
] as const

const CARD_STRENGTHS = CARDS.reduce((map, c, i) => {
  map.set(c, 20 - i) // stronger cards earlier
  return map
}, new Map<string, number>())

const HAND_TYPES = [
  'x5',
  'x4',
  'full-house',
  'x3',
  'two-pair',
  'one-pair',
  'high-card',
] as const
const HAND_STRENGTHS = HAND_TYPES.reduce((map, c, i) => {
  map.set(c, 20 - i) // stronger cards earlier
  return map
}, new Map<string, number>())

type Card = (typeof CARDS)[number]

type HandType = (typeof HAND_TYPES)[number]

type Hand = Array<Card>

type Score = {
  firstCard: Card
  type: HandType
}

const countCards = (hand: Hand) => {
  const cardCount = new Map<string, number>()

  hand.forEach((c) => {
    const current = cardCount.get(c) ?? 0
    cardCount.set(c, current + 1)
  })

  return cardCount
}

const getHandType = (hand: Hand): HandType => {
  const handCount = countCards(hand)

  const keys = [...handCount.keys()] as Hand

  if (keys.length === 1) {
    return 'x5'
  }

  const x4 = keys.length === 2 && keys.find((k) => handCount.get(k) === 4)
  if (x4) {
    return 'x4'
  }

  if (keys.length === 2) {
    return 'full-house'
  }

  const x3 = keys.length <= 3 && keys.find((k) => handCount.get(k) === 3)
  if (x3) {
    return 'x3'
  }

  const pairs = keys.filter((k) => handCount.get(k) === 2)
  if (pairs.length === 2) {
    return 'two-pair'
  }

  if (pairs.length === 1) {
    return 'one-pair'
  }

  return 'high-card'
}

const scoreHand = (hand: Hand): Score => {
  if (hand.length !== 5) {
    throw new Error(`received invalid hand.length: "${hand.length}"`)
  }

  return {
    firstCard: hand[0] as Card,
    type: getHandType(hand),
  }
}

describe('day 7.1', () => {
  describe('test 7.1', () => {
    it('can score 32T3K correctly', () => {
      const input = '32T3K'.split('') as Hand

      const score = scoreHand(input)

      expect(score.firstCard).toBe('3')
      expect(score.type).toBe('one-pair')
    })

    it('can score T55J5 correctly', () => {
      const input = 'T55J5'.split('') as Hand

      const score = scoreHand(input)

      expect(score.firstCard).toBe('T')
      expect(score.type).toBe('x3')
    })

    it('can score KK677 correctly', () => {
      const input = 'KK677'.split('') as Hand

      const score = scoreHand(input)

      expect(score.firstCard).toBe('K')
      expect(score.type).toBe('two-pair')
    })

    it('can score KTJJT correctly', () => {
      const input = 'KTJJT'.split('') as Hand

      const score = scoreHand(input)

      expect(score.firstCard).toBe('K')
      expect(score.type).toBe('two-pair')
    })

    it('can score QQQJA correctly', () => {
      const input = 'QQQJA'.split('') as Hand

      const score = scoreHand(input)

      expect(score.firstCard).toBe('Q')
      expect(score.type).toBe('x3')
    })

    it('can score QQQJJ correctly', () => {
      const input = 'QQQJJ'.split('') as Hand

      const score = scoreHand(input)

      expect(score.firstCard).toBe('Q')
      expect(score.type).toBe('full-house')
    })

    it('can score QQQJQ correctly', () => {
      const input = 'QQQJQ'.split('') as Hand

      const score = scoreHand(input)

      expect(score.firstCard).toBe('Q')
      expect(score.type).toBe('x4')
    })

    it('can score QQQQQ correctly', () => {
      const input = 'QQQQQ'.split('') as Hand

      const score = scoreHand(input)

      expect(score.firstCard).toBe('Q')
      expect(score.type).toBe('x5')
    })
  })
})
