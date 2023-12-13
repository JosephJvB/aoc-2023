import { readFileSync } from 'fs'
import { join } from 'path'

type Card = {
  id: number
  targetNumbers: number[]
  inputNumbers: number[]
}

const fileToLines = (fileName: string) =>
  readFileSync(join(__dirname, fileName), 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => !!l)

const parseCard = (line: string): Card => {
  const [cardIdStr, cardNumbers] = line.split(':')
  const id = parseInt(cardIdStr.replace('Card', '').trim())

  const [targetNumbers, inputNumbers] = cardNumbers.split('|').map((str) =>
    str
      .trim()
      .replace(/  /g, ' ')
      .split(' ')
      .map((s) => parseInt(s))
  )

  return {
    id,
    targetNumbers,
    inputNumbers,
  }
}
const scoreCard = (card: Card) => {
  const winningNumbers = new Set(card.targetNumbers)

  const numWinners = card.inputNumbers.reduce(
    (tot, n) => tot + (winningNumbers.has(n) ? 1 : 0),
    0
  )

  return calcScore(numWinners)
}

const calcScore = (numWon: number) => {
  return numWon === 0 ? 0 : Math.pow(2, numWon - 1)
}

describe('day 4.1', () => {
  describe('test 4.1', () => {
    const FILENAME = '4.1-test-data.txt'

    it('can parse Card 1:', () => {
      const input = 'Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53'

      const result = parseCard(input)

      expect(result.id).toBe(1)
      expect(result.targetNumbers).toEqual([41, 48, 83, 86, 17])
      expect(result.inputNumbers).toEqual([83, 86, 6, 31, 17, 9, 48, 53])
    })

    it('can parse lines', () => {
      const result = fileToLines(FILENAME)

      expect(result.length).toBe(6)
    })

    it('can parse all cards no NaNs', () => {
      const lines = fileToLines(FILENAME)

      const result = lines.map((l) => parseCard(l))

      expect(result.length).toBe(6)

      const allIds = result.map((c) => c.id)
      expect(allIds).toEqual([1, 2, 3, 4, 5, 6])

      const allValues = result.flatMap((c) =>
        c.inputNumbers.concat(c.targetNumbers)
      )
      const nanValues = allValues.filter((v) => isNaN(v))
      expect(nanValues).toHaveLength(0)
    })

    it('calculates correct scores', () => {
      const input = [0, 1, 2, 3, 4, 5, 6]

      const result = input.map((n) => calcScore(n))

      expect(result).toEqual([0, 1, 2, 4, 8, 16, 32])
    })

    it('scores all test cards correctly', () => {
      const scores = fileToLines(FILENAME)
        .map((l) => parseCard(l))
        .map((c) => scoreCard(c))

      expect(scores).toEqual([8, 2, 2, 1, 0, 0])
    })

    it('solves test 4.1', () => {
      const answer1 = fileToLines(FILENAME)
        .map((l) => parseCard(l))
        .map((c) => scoreCard(c))
        .reduce((tot, score) => tot + score, 0)

      expect(answer1).toBe(13)
    })
  })

  describe('question 4.1', () => {
    const FILENAME = '4.1-data.txt'
    it('solves 4.1', () => {
      const answer1 = fileToLines(FILENAME)
        .map((l) => parseCard(l))
        .map((c) => scoreCard(c))
        .reduce((tot, score) => tot + score, 0)

      console.log({
        answer1,
      })

      expect(answer1).toBeGreaterThan(0)
    })
  })
})

// each "point" a card wins adds the future cards
// ie const score1 = score(card1)
// cards.push(...cards.slice(currentIndex + 1, score1))
// can't simply run the sim I think that's silly
// create a map of cards to scores
describe('day 4.2', () => {
  describe('test 4.2', () => {})
})
