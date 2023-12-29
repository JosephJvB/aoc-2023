import { readFileSync, writeFileSync } from 'fs'
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
const JOKER_CARD_STRENGTHS = CARDS.reduce((map, c, i) => {
  const score = c === 'J' ? -1 : 12 - i
  map.set(c, score) // stronger cards earlier
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
  const cardCount = new Map<Card, number>()

  hand.forEach((c) => {
    const current = cardCount.get(c) ?? 0
    cardCount.set(c, current + 1)
  })

  return cardCount
}

const getHandType = (handCount: Map<Card, number>): HandType => {
  const keys = [...handCount.keys()]

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

  const counted = countCards(cards)

  const type = getHandType(counted)

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
    .map((l) => lineToHand(l.trim()))

const evaluateHands = (scoredHands: ScoredHand[]) => {
  scoredHands.sort(
    (a, z) => a.typeScore - z.typeScore || handleHighCardArrayMethod(a, z)
  )

  return scoredHands
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

      const scored: ScoredHand[] = hands.map((h) => ({
        ...h,
        ...scoreCards(h.cards),
      }))

      const evaluated = evaluateHands(scored)

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

      const scored: ScoredHand[] = hands.map((h) => ({
        ...h,
        ...scoreCards(h.cards),
      }))

      const evaluated = evaluateHands(scored)

      const winnings = calculateWinnings(evaluated)

      expect(winnings).toBe(6440)
    })
  })

  describe('question 7.1', () => {
    const FILENAME = '7.1-data.txt'

    it('it can solve question 7.1', () => {
      const hands = parseFile(FILENAME)

      const scored: ScoredHand[] = hands.map((h) => ({
        ...h,
        ...scoreCards(h.cards),
      }))

      const evaluated = evaluateHands(scored)

      const winnings = calculateWinnings(evaluated)

      console.log({
        answer1: winnings,
      })

      expect(winnings).toBeGreaterThan(6440)
    })
  })
})

// not really stoked the way I'm checking these conditions, but it's working
const getJokerHandType = (counted: Map<Card, number>): HandType => {
  const jokerCount = counted.get('J')
  if (!jokerCount) {
    throw new Error("no jokers? don't call me here anymore")
  }
  if (jokerCount === 5) {
    return 'x5'
  }

  // jokerCount is 1 ... 4

  const keys = [...counted.keys()].filter((k) => k !== 'J')

  let jokerX5 = false
  let jokerX4 = false
  let jokerX3 = false
  let x3 = false
  let nonJokerPairs = 0

  keys.forEach((k) => {
    const c = counted.get(k) ?? 0
    if (c + jokerCount === 5) {
      jokerX5 = true
    }
    if (c + jokerCount === 4) {
      jokerX4 = true
    }
    if (c + jokerCount === 3) {
      jokerX3 = true
    }
    if (c === 3) {
      x3 = true
    }
    if (c === 2) {
      nonJokerPairs++
    }
  })

  if (jokerX5) {
    return 'x5'
  }

  if (jokerX4) {
    return 'x4'
  }

  if (x3) {
    // convert any the last card to a pair w/ joker
    return 'full-house'
  }

  if (nonJokerPairs === 2) {
    return 'full-house'
  }

  if (jokerX3) {
    return 'x3'
  }

  return 'one-pair'
}

const scoreCards2 = (cards: Card[]): Score => {
  if (cards.length !== 5) {
    throw new Error(`received invalid hand.length: "${cards.length}"`)
  }

  const counted = countCards(cards)

  const type = counted.has('J')
    ? getJokerHandType(counted)
    : getHandType(counted)

  return {
    cardScores: cards.map((c) => JOKER_CARD_STRENGTHS.get(c) ?? -2),
    type: type,
    typeScore: HAND_STRENGTHS.get(type) ?? -1,
  }
}

describe('day 7.2', () => {
  describe('test 7.2', () => {
    const FILENAME = '7.1-test-data.txt'

    it('can convert T55J5', () => {
      const input = 'T55J5'

      const counted = countCards(input.split('') as Card[])

      const type = getJokerHandType(counted)

      expect(type).toBe('x4')
    })

    it('can convert KTJJT', () => {
      const input = 'KTJJT'

      const counted = countCards(input.split('') as Card[])

      const type = getJokerHandType(counted)

      expect(type).toBe('x4')
    })

    it('can convert QQQJA', () => {
      const input = 'QQQJA'

      const counted = countCards(input.split('') as Card[])

      const type = getJokerHandType(counted)

      expect(type).toBe('x4')
    })

    it('can score test 7.2', () => {
      const input = parseFile(FILENAME)

      const scored = input.map((h) => scoreCards2(h.cards))

      expect(scored[0].type).toEqual('one-pair')
      expect(scored[0].cardScores).toEqual([1, 0, 8, 1, 11])
      expect(scored[1].type).toEqual('x4')
      expect(scored[1].cardScores).toEqual([8, 3, 3, -1, 3])
      expect(scored[2].type).toEqual('two-pair')
      expect(scored[2].cardScores).toEqual([11, 11, 4, 5, 5])
      expect(scored[3].type).toEqual('x4')
      expect(scored[3].cardScores).toEqual([11, 8, -1, -1, 8])
      expect(scored[4].type).toEqual('x4')
      expect(scored[4].cardScores).toEqual([10, 10, 10, -1, 12])
    })

    it('can evaluate cards test 7.2', () => {
      const input = parseFile(FILENAME)

      const scored: ScoredHand[] = input.map((h) => ({
        ...h,
        ...scoreCards2(h.cards),
      }))

      const evaluated = evaluateHands(scored)

      expect(evaluated[0].type).toEqual('one-pair')
      expect(evaluated[0].cardScores).toEqual([1, 0, 8, 1, 11])
      expect(evaluated[1].type).toEqual('two-pair')
      expect(evaluated[1].cardScores).toEqual([11, 11, 4, 5, 5])
      expect(evaluated[2].type).toEqual('x4')
      expect(evaluated[2].cardScores).toEqual([8, 3, 3, -1, 3])
      expect(evaluated[3].type).toEqual('x4')
      expect(evaluated[3].cardScores).toEqual([10, 10, 10, -1, 12])
      expect(evaluated[4].type).toEqual('x4')
      expect(evaluated[4].cardScores).toEqual([11, 8, -1, -1, 8])
    })

    it('can solve 7.2', () => {
      const input = parseFile(FILENAME)

      const scored: ScoredHand[] = input.map((h) => ({
        ...h,
        ...scoreCards2(h.cards),
      }))

      const evaluated = evaluateHands(scored)

      const winnings = calculateWinnings(evaluated)

      expect(winnings).toBe(5905)
    })
  })

  describe('question 7.2', () => {
    const FILENAME = '7.1-data.txt'

    it.skip('writes to file for manual review', () => {
      const input = parseFile(FILENAME)

      const scored: ScoredHand[] = input.map((h) => ({
        ...h,
        ...scoreCards2(h.cards),
      }))

      const evaluated = evaluateHands(scored)

      const mapped = evaluated.map((e, idx) => ({
        hand: e.cards.join(''),
        type: e.type,
        // cardScores: e.cardScores.join(','),
        // idx: idx,
        // bid: e.bid,
        // score: e.bid * (idx + 1),
      }))

      writeFileSync(
        join(__dirname, '7.2-review.json'),
        JSON.stringify(mapped, null, 2)
      )

      expect(true).toBe(true)
    })

    it('sets correct handType for AATJK', () => {
      const input = 'AATJK'

      const counted = countCards(input.split('') as Card[])

      const type = getJokerHandType(counted)

      expect(type).toBe('x3')
    })

    it('can solve 7.2', () => {
      const input = parseFile(FILENAME)

      const scored: ScoredHand[] = input.map((h) => ({
        ...h,
        ...scoreCards2(h.cards),
      }))

      const evaluated = evaluateHands(scored)

      const winnings = calculateWinnings(evaluated)

      console.log({
        answer2: winnings,
      })

      expect(winnings).toBeGreaterThan(5905)
      expect(winnings).toBeLessThan(249960135)
      expect(winnings).toBeGreaterThan(249558873)
    })
  })
})
