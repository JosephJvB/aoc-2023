import { readFileSync } from 'fs'
import { join } from 'path'

const CARDS = [
  'A', // 12
  'K', // 11
  'Q', // 10
  'J', // 9
  'T', // 8
  '9', // 7
  '8', // 6
  '7', // 5
  '6', // 4
  '5', // 3
  '4', // 2
  '3', // 1
  '2', // 0
] as const

const CARD_STRENGTHS = CARDS.reduce((map, c, i) => {
  map.set(c, 12 - i) // stronger cards earlier
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

type Hand = {
  cards: Card[]
  bid: number
}

type Score = {
  cardScores: number[]
  type: HandType
  typeScore: number
}

type ScoredHand = Hand & Score

const countCards = (hand: Card[]) => {
  const cardCount = new Map<string, number>()

  hand.forEach((c) => {
    const current = cardCount.get(c) ?? 0
    cardCount.set(c, current + 1)
  })

  return cardCount
}

const getHandType = (hand: Card[]): HandType => {
  const handCount = countCards(hand)

  const keys = [...handCount.keys()] as Card[]

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

const scoreCards = (cards: Card[]): Score => {
  if (cards.length !== 5) {
    throw new Error(`received invalid hand.length: "${cards.length}"`)
  }

  const type = getHandType(cards)

  return {
    cardScores: cards.map((c) => CARD_STRENGTHS.get(c) ?? -1),
    type: type,
    typeScore: HAND_STRENGTHS.get(type) ?? -1,
  }
}

const lineToHand = (line: string): Hand => {
  const [cards, bid] = line.split(' ')
  return {
    cards: cards.split('') as Card[],
    bid: parseInt(bid),
  }
}

// dynamic way to write this?
const handleHighCards = (a: ScoredHand, z: ScoredHand) =>
  a.cardScores[0] - z.cardScores[0] ||
  a.cardScores[1] - z.cardScores[1] ||
  a.cardScores[2] - z.cardScores[2] ||
  a.cardScores[3] - z.cardScores[3] ||
  a.cardScores[4] - z.cardScores[4]
const handleHighCardLoop = (a: ScoredHand, z: ScoredHand) => {
  for (let i = 0; i < a.cardScores.length; i++) {
    const diff = a.cardScores[i] - z.cardScores[i]
    if (diff !== 0) {
      return diff
    }
  }

  return 0
}
const handleHighCardArrayMethod = (a: ScoredHand, z: ScoredHand) => {
  const diffIdx = a.cardScores.findIndex((_, i) => {
    const diff = a.cardScores[i] - z.cardScores[i]
    return diff !== 0
  })

  if (diffIdx === -1) {
    return 0
  }

  return a.cardScores[diffIdx] - z.cardScores[diffIdx]
}

const parseFile = (fileName: string): Hand[] =>
  readFileSync(join(__dirname, fileName), 'utf-8')
    .split('\n')
    .filter((l) => !!l)
    .map((l) => l.trim())
    .map((l) => lineToHand(l))

const evaluateHands = (hands: Hand[]) => {
  const scored: ScoredHand[] = hands.map((h) => ({
    ...h,
    ...scoreCards(h.cards),
  }))

  scored.sort(
    (a, z) => a.typeScore - z.typeScore || handleHighCardArrayMethod(a, z)
  )

  return scored
}

const calculateWinnings = (results: ScoredHand[]) =>
  results.reduce((total, hand, idx) => total + hand.bid * (idx + 1), 0)

describe('day 7.1', () => {
  describe('test 7.1', () => {
    const FILENAME = '7.1-test-data.txt'

    it('can score 32T3K correctly', () => {
      const input = '32T3K'.split('') as Card[]

      const score = scoreCards(input)

      expect(score.cardScores[0]).toBe(1)
      expect(score.type).toBe('one-pair')
    })

    it('can score T55J5 correctly', () => {
      const input = 'T55J5'.split('') as Card[]

      const score = scoreCards(input)

      expect(score.cardScores[0]).toBe(8)
      expect(score.type).toBe('x3')
    })

    it('can score KK677 correctly', () => {
      const input = 'KK677'.split('') as Card[]

      const score = scoreCards(input)

      expect(score.cardScores[0]).toBe(11)
      expect(score.type).toBe('two-pair')
    })

    it('can score KTJJT correctly', () => {
      const input = 'KTJJT'.split('') as Card[]

      const score = scoreCards(input)

      expect(score.cardScores[0]).toBe(11)
      expect(score.type).toBe('two-pair')
    })

    it('can score QQQJA correctly', () => {
      const input = 'QQQJA'.split('') as Card[]

      const score = scoreCards(input)

      expect(score.cardScores[0]).toBe(10)
      expect(score.type).toBe('x3')
    })

    it('can score QQQJJ correctly', () => {
      const input = 'QQQJJ'.split('') as Card[]

      const score = scoreCards(input)

      expect(score.cardScores[0]).toBe(10)
      expect(score.type).toBe('full-house')
    })

    it('can score QQQJQ correctly', () => {
      const input = 'QQQJQ'.split('') as Card[]

      const score = scoreCards(input)

      expect(score.cardScores[0]).toBe(10)
      expect(score.type).toBe('x4')
    })

    it('can score QQQQQ correctly', () => {
      const input = 'QQQQQ'.split('') as Card[]

      const score = scoreCards(input)

      expect(score.cardScores[0]).toBe(10)
      expect(score.type).toBe('x5')
    })

    it('can parse test file', () => {
      const hands = parseFile(FILENAME)

      expect(hands.length).toBe(5)
      const bids = hands.map((h) => h.bid)
      expect(bids).toEqual([765, 684, 28, 220, 483])
      const cards = hands.map((h) => h.cards)
      expect(cards).toEqual([
        '32T3K'.split(''),
        'T55J5'.split(''),
        'KK677'.split(''),
        'KTJJT'.split(''),
        'QQQJA'.split(''),
      ])
    })

    it('can evaluate hands correctly', () => {
      const hands = parseFile(FILENAME)

      const evaluated = evaluateHands(hands)

      expect(evaluated[0].type).toBe('one-pair')
      expect(evaluated[0].cards).toEqual('32T3K'.split(''))
      expect(evaluated[1].type).toBe('two-pair')
      expect(evaluated[1].cards).toEqual('KTJJT'.split(''))
      expect(evaluated[2].type).toBe('two-pair')
      expect(evaluated[2].cards).toEqual('KK677'.split(''))
      expect(evaluated[3].type).toBe('x3')
      expect(evaluated[3].cards).toEqual('T55J5'.split(''))
      expect(evaluated[4].type).toBe('x3')
      expect(evaluated[4].cards).toEqual('QQQJA'.split(''))
    })

    it('can solve test 7.1', () => {
      const hands = parseFile(FILENAME)

      const evaluated = evaluateHands(hands)

      const winnings = calculateWinnings(evaluated)

      expect(winnings).toBe(6440)
    })
  })

  describe('question 7.1', () => {
    const FILENAME = '7.1-data.txt'

    it('it can solve question 7.1', () => {
      const hands = parseFile(FILENAME)

      const evaluated = evaluateHands(hands)

      const winnings = calculateWinnings(evaluated)

      console.log({
        answer1: winnings,
      })

      expect(winnings).toBeGreaterThan(6440)
    })
  })
})
