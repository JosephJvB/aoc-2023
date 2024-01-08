// it's pathfinding
// dijkstras (spelling?)
// maybe I could brute force part 1
// but that's only cos I assume there aren't dead ends or anything
// no idea about part 2

import { readFileSync } from 'fs'
import { join } from 'path'

type Direction = 'N' | 'E' | 'S' | 'W'

type Pipe = 'S' | '|' | '-' | 'L' | 'J' | '7' | 'F'

type Coord = {
  x: number
  y: number
}
type Tile = Coord & {
  char: Pipe | '.'
}
type PipeTile = Coord & {
  char: Pipe
}
type Move = Coord & {
  direction: Direction
}

const getNextDirections = (t: PipeTile): Direction[] => {
  switch (t.char) {
    case 'S':
      return ['N', 'E', 'S', 'W']
    case '-':
      return ['E', 'W']
    case '|':
      return ['N', 'S']
    case 'F':
      return ['S', 'E']
    case 'L':
      return ['N', 'E']
    case 'J':
      return ['N', 'W']
    case '7':
      return ['S', 'W']
  }
}

const parseFile = (fileName: string): Tile[][] =>
  readFileSync(join(__dirname, fileName), 'utf-8')
    .split('\n')
    .filter((l) => !!l)
    .map((l, y) =>
      l.split('').map((c, x) => ({
        char: c as Pipe | '.',
        x,
        y,
      }))
    )

const getCoordId = (c: Coord) => [c.x, c.y].join('x')

const toCoordMap = (g: Tile[][]) =>
  g.reduce((map, line) => {
    line.forEach((t) => {
      map.set(getCoordId(t), t)
    })
    return map
  }, new Map<string, Tile>())

const toCharMap = (g: Tile[][]) =>
  g.reduce((map, line) => {
    line.forEach((t) => {
      map.set(t.char, t)
    })
    return map
  }, new Map<string, Tile>())

// top left = 0, 0
const MoveMap = new Map<Direction, Move>([
  ['N', { x: 0, y: -1, direction: 'N' }],
  ['E', { x: 1, y: 0, direction: 'E' }],
  ['S', { x: 0, y: 1, direction: 'S' }],
  ['W', { x: -1, y: 0, direction: 'W' }],
])

// type Pipe = 'S' | '|' | '-' | 'L' | 'J' | '7' | 'F'
const getValidPipes = (d: Direction): Pipe[] => {
  switch (d) {
    case 'N':
      return ['S', '|', '7', 'F']
    case 'E':
      return ['S', '-', 'J', '7']
    case 'S':
      return ['S', '|', 'L', 'J']
    case 'W':
      return ['S', '-', 'L', 'F']
  }
}

const solveLoop = (grid: Tile[][]) => {
  const charMap = toCharMap(grid)
  const coordMap = toCoordMap(grid)

  const start: PipeTile = charMap.get('S') as PipeTile
  if (!start) {
    throw new Error('unable to find start')
  }

  let steps: PipeTile[] = [start]
  do {
    const prevTile = steps[steps.length - 2]
    const currentTile = steps[steps.length - 1]
    const nextMove = getNextDirections(currentTile)
      .map((d) => MoveMap.get(d))
      // choose first nextMove
      .find((m) => {
        if (!m) {
          return false
        }

        const nextTile = coordMap.get(
          getCoordId({
            x: currentTile.x + m.x,
            y: currentTile.y + m.y,
          })
        )

        // dont move off grid
        if (!nextTile) {
          return false
        }
        // dont backtrack
        if (nextTile.x === prevTile?.x && nextTile.y === prevTile?.y) {
          return false
        }

        // must move to a valid pipe
        const validPipe = getValidPipes(m.direction).includes(
          nextTile.char as Pipe
        )

        return !!validPipe
      })

    if (!nextMove) {
      throw new Error(
        `unable to find nextMove ${JSON.stringify({
          currentTile,
          prevTile,
          stepsLength: steps.length,
        })}`
      )
    }

    const nextTile = coordMap.get(
      getCoordId({
        x: currentTile.x + nextMove.x,
        y: currentTile.y + nextMove.y,
      })
    ) as PipeTile
    if (!nextTile) {
      throw new Error(
        `unable to find nextPos ${JSON.stringify({
          currentTile,
          prevTile,
          nextMove,
          stepsLength: steps.length,
        })}`
      )
    }

    steps.push(nextTile)
  } while (steps[steps.length - 1].char !== 'S')

  return steps
}

describe('day 10.1', () => {
  describe('test 10.1', () => {
    const FILENAME = '10-test-data.txt'

    it('can find start point', () => {
      const grid = parseFile(FILENAME)

      const charMap = toCharMap(grid)

      const start = charMap.get('S')

      expect(start).toBeDefined()
      expect(start?.x).toBe(0)
      expect(start?.y).toBe(2)
    })

    it('can solveLoop for test data', () => {
      const grid = parseFile(FILENAME)

      const steps = solveLoop(grid)

      expect(steps.length).toBe(17)
    })
  })

  describe('question 10.1', () => {
    const FILENAME = '10-data.txt'

    it('can solve question 10.1', () => {
      const grid = parseFile(FILENAME)

      const steps = solveLoop(grid)

      console.log({
        answer1: (steps.length - 1) / 2,
      })

      expect(steps.length).toBeGreaterThan(17)
    })
  })
})
