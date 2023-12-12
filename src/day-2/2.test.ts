import { readFileSync } from 'fs'
import { join } from 'path'

type ValidColour = 'red' | 'blue' | 'green'
type GameLimits = {
  blue: number
  green: number
  red: number
}
type Game = GameLimits & {
  id: number
}

// 'Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green'
const toGame = (line: string): Game => {
  const [title, roundsStr] = line.split(':').map((s) => s.trim())
  const game: Game = {
    id: parseInt(title.split(' ')[1]),
    blue: 0,
    green: 0,
    red: 0,
  }

  roundsStr
    .split(';')
    .map((s) => s.trim())
    .forEach((r) => {
      r.split(',')
        .map((s) => s.trim())
        .forEach((cube) => {
          const [count, colour] = cube.split(' ')

          const countInt = parseInt(count)

          if (!count || !colour || isNaN(countInt)) {
            throw new Error(`invalid cube input "${cube}"`)
          }

          const validColour = colour as ValidColour
          game[validColour] = Math.max(game[validColour], parseInt(count))
        })
    })

  return game
}
const gameValidator = (limits: GameLimits) => (game: Game) =>
  game.red <= limits.red &&
  game.blue <= limits.blue &&
  game.green <= limits.green

const solve = (fileName: string, limits: GameLimits) => {
  const isPossible = gameValidator(limits)

  const games = readFileSync(join(__dirname, fileName), 'utf-8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => !!l)
    .map((l) => toGame(l))

  return games.filter((g) => isPossible(g))
}

describe('day 2.1', () => {
  describe('test 2.1', () => {
    const FILENAME = '2.1-test-data.txt'
    const LIMITS: GameLimits = {
      red: 12,
      green: 13,
      blue: 14,
    }

    it('turns line to a game', () => {
      const input = 'Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green'

      const result = toGame(input)

      expect(result.id).toBe(1)
      expect(result.blue).toBe(6)
      expect(result.red).toBe(4)
      expect(result.green).toBe(2)
    })

    it('solves test 2.1', () => {
      const result = solve(FILENAME, LIMITS)

      const answer = result.reduce((tot, g) => tot + g.id, 0)

      expect(answer).toBe(8)
    })
  })

  describe('question 2.1', () => {
    it('solves 2.1', () => {})
    const FILENAME = '2-data.txt'
    const LIMITS: GameLimits = {
      red: 12,
      green: 13,
      blue: 14,
    }

    const result = solve(FILENAME, LIMITS)
    const answer = result.reduce((tot, g) => tot + g.id, 0)

    console.log({
      answer,
    })

    expect(answer).toBeGreaterThan(0)
  })
})
