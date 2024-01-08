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
  from: Direction
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
  ['N', { x: 0, y: -1, direction: 'N', from: 'S' }],
  ['E', { x: 1, y: 0, direction: 'E', from: 'W' }],
  ['S', { x: 0, y: 1, direction: 'S', from: 'N' }],
  ['W', { x: -1, y: 0, direction: 'W', from: 'E' }],
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

  let pos: PipeTile = charMap.get('S') as PipeTile
  if (!pos) {
    throw new Error('unable to find start')
  }

  let steps: Move[] = []
  do {
    const prevMove = steps[steps.length - 1]
    const nextMove = getNextDirections(pos)
      .map((d) => MoveMap.get(d))
      // choose first nextMove
      .find((m) => {
        if (!m) {
          return false
        }

        const nextTile = coordMap.get(
          getCoordId({
            x: pos.x + m.x,
            y: pos.y + m.y,
          })
        )

        // dont move off grid
        if (!nextTile) {
          return false
        }
        // dont backtrack
        if (prevMove && m.from !== prevMove.direction) {
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
          pos,
          lastTile: prevMove,
          stepsLength: steps.length,
        })}`
      )
    }

    const nextTile = coordMap.get(
      getCoordId({
        x: pos.x + nextMove.x,
        y: pos.y + nextMove.y,
      })
    )
    if (!nextTile) {
      throw new Error(
        `unable to find nextPos ${JSON.stringify({
          pos,
          lastTile: prevMove,
          nextMove,
          stepsLength: steps.length,
        })}`
      )
    }

    console.log({
      prevTile: prevMove,
      prevTileId: prevMove && getCoordId(prevMove),
      nextMove,
      nextTile,
      nextTileId: getCoordId(nextTile),
    })

    pos = nextTile as PipeTile
    steps.push({
      ...nextMove, // from, to
      ...nextTile, // coords
    })
  } while (pos.char !== 'S')

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

      expect(steps.length).toBe(16)
    })
  })
})
