import { readFileSync } from 'fs'
import { join } from 'path'

type BoatRace = {
  timeMs: number
  distanceMm: number
}

const parseFile = (fileName: string): BoatRace[] => {
  const [timesRaw, distancesRaw] = readFileSync(
    join(__dirname, fileName),
    'utf-8'
  ).split('\n')

  const times = timesRaw.split(' ').filter((s) => s && !isNaN(parseInt(s)))
  const distances = distancesRaw
    .split(' ')
    .filter((s) => s && !isNaN(parseInt(s)))

  if (times.length !== distances.length) {
    throw new Error(
      `parse error: times.length=${times.length} distances.length=${distances.length}`
    )
  }

  return times.map((t, i) => ({
    timeMs: parseInt(t),
    distanceMm: parseInt(distances[i]),
  }))
}

const calcDistance = (raceDurationMs: number, chargeTimeMs: number) => {
  const timeMovingMs = raceDurationMs - chargeTimeMs

  if (timeMovingMs <= 0) {
    return 0
  }

  return timeMovingMs * chargeTimeMs
}

// these two fns could be optimized, evaluate the previousRecordMm, only add results greater than that record
// save pushing unused items to array
const getRaceResults = (raceDurationMs: number) => {
  const firstHalf: number[] = []

  const limit = Math.floor(raceDurationMs / 2)
  for (let i = 1; i <= limit; i++) {
    firstHalf.push(calcDistance(raceDurationMs, i))
  }

  const endSliceIdx =
    raceDurationMs % 2 === 0 ? firstHalf.length - 1 : firstHalf.length

  const secondHalf = firstHalf.slice(0, endSliceIdx).reverse()

  return firstHalf.concat(secondHalf)
}
const getFirstHalfResults = (raceDurationMs: number) => {
  const firstHalf: number[] = []

  const limit = Math.floor(raceDurationMs / 2)
  for (let i = 1; i <= limit; i++) {
    firstHalf.push(calcDistance(raceDurationMs, i))
  }

  return firstHalf
}

const evaulateRace = (raceDurationMs: number, previousRecordMm: number) => {
  const firstHalfResults = getFirstHalfResults(raceDurationMs)

  const winningResultsHalf = firstHalfResults.filter(
    (r) => r > previousRecordMm
  )

  const evenOffset = raceDurationMs % 2 === 0 ? 1 : 0

  // odd numbered results: [1, 2, 3, 3, 2, 1] "mirrored"
  // even results: [1, 2, 3, 2, 1] "palindromic"
  const numWinningResults = winningResultsHalf.length * 2 - evenOffset

  return numWinningResults
}

describe('day 6.1', () => {
  describe('test 6.1', () => {
    const FILENAME = '6.1-test-data.txt'
    it('can parse test data', () => {
      const result = parseFile(FILENAME)

      expect(result.length).toBe(3)
      expect(result[0].timeMs).toBe(7)
      expect(result[0].distanceMm).toBe(9)
      expect(result[2].timeMs).toBe(30)
      expect(result[2].distanceMm).toBe(200)
    })

    it('can calculate distances for race 1', () => {
      const inputs = Array(8)
        .fill(0)
        .map((_, i) => i)

      const results = inputs.map((i) => calcDistance(7, i))

      // palindromic results, surely a formula to use
      // odd numbers will mirror (have 2 max numbers)
      // even numbers will have one highest number
      expect(results).toEqual([0, 6, 10, 12, 12, 10, 6, 0])
    })

    it('can calculate even raceMs', () => {
      const results = getRaceResults(30)

      expect(results).toEqual([
        29, 56, 81, 104, 125, 144, 161, 176, 189, 200, 209, 216, 221, 224, 225,
        224, 221, 216, 209, 200, 189, 176, 161, 144, 125, 104, 81, 56, 29,
      ])
    })

    it('can calculate distances for all races', () => {
      const inputs = [7, 15, 30]

      const results = inputs.map((n) => getRaceResults(n))

      expect(results.length).toBe(3)
      expect(results[0].length).toBe(6)
      expect(results[1].length).toBe(14)
      expect(results[2].length).toBe(29)
    })

    it('can calculate firstHalf for odd race', () => {
      const results = getFirstHalfResults(7)

      expect(results).toEqual([6, 10, 12])
    })

    it('can calculate firstHalf for even race', () => {
      const results = getFirstHalfResults(30)

      expect(results).toEqual([
        29, 56, 81, 104, 125, 144, 161, 176, 189, 200, 209, 216, 221, 224, 225,
      ])
    })

    it('can eval odd race', () => {
      const results = evaulateRace(7, 9)

      expect(results).toBe(4)
    })

    it('can eval even race', () => {
      const results = evaulateRace(30, 200)

      expect(results).toBe(9)
    })

    it('can solve test 6.1', () => {
      const input = parseFile(FILENAME)

      const raceResults = input.map((i) => evaulateRace(i.timeMs, i.distanceMm))

      const answer = raceResults.reduce((tot, n) => tot * n, 1)

      expect(raceResults.length).toBe(3)
      expect(answer).toBe(288)
    })
  })

  describe('question 6.1', () => {
    const FILENAME = '6.1-data.txt'

    it('can solve question 6.1', () => {
      const input = parseFile(FILENAME)

      const raceResults = input.map((i) => evaulateRace(i.timeMs, i.distanceMm))

      const answer1 = raceResults.reduce((tot, n) => tot * n, 1)

      console.log({
        answer1,
      })

      expect(raceResults.length).toBe(4)
      expect(answer1).toBeGreaterThan(0)
    })
  })
})
