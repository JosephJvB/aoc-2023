import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const Mirrors = ['/', '\\'] as const
type Mirror = (typeof Mirrors)[number]
const Splitters = ['|', '-'] as const
type Splitter = (typeof Splitters)[number]

const BouncyTiles = new Set([...Mirrors, Splitters])

type Coord = {
  x: number
  y: number
}
type Direction = 'N' | 'E' | 'S' | 'W'
type Beam = Coord & {
  direction: Direction
}
const b: Beam = {
  x: 0,
  y: 0,
  direction: Math.random() > 0.5 ? 'N' : 'S',
}

const parseFile = (fileName: string) =>
  readFileSync(join(__dirname, fileName), 'utf-8').trim().split('\n')

const toGrid = (lines: string[]) =>
  lines.filter((l) => !!l).map((l) => l.trim().split(''))

const coordToId = (coord: Coord) => [coord.x, coord.y].join('x')

const moveBeam = (beam: Beam) => {
  switch (beam.direction) {
    case 'N':
      beam.y--
      break
    case 'E':
      beam.x++
      break
    case 'S':
      beam.y++
      break
    case 'W':
      beam.x--
      break
  }
}

const getGridCoordHandler = (grid: string[][]) => (coord: Coord) =>
  coord.x >= 0 &&
  coord.y >= 0 &&
  coord.x < grid[0].length &&
  coord.y < grid.length

const solveGrid = (grid: string[][]) => {
  const coordInBounds = getGridCoordHandler(grid)

  const energizedTiles = new Set()

  let beams: Beam[] = [{ x: 0, y: 0, direction: 'E' }]
  const allSeenTiles = new Set(['0x0'])
  while (beams.length) {
    const nextBeams: Beam[] = []

    beams.forEach((beam) => {
      const tileId = coordToId(beam)
      allSeenTiles.add(tileId)
      if (!coordInBounds(beam)) {
        return
      }
      moveBeam(beam)

      const currentTile = grid[beam.y][beam.x]
      if (currentTile === '.') {
        energizedTiles.add(tileId)
        nextBeams.push(beam)
        return
      }

      // if a beam bounces on to another mirror/splitter
      // i need to move that beam again!
      // moveBeam '.' => '|'
      //

      if (currentTile === '/') {
        beam.direction = beam.direction === 'N' ? 'E' : 'W'
        beam.x = beam.x + beam.direction === 'N' ? 1 : -1
        nextBeams.push(beam)
        return
      }
      if (currentTile === '\\') {
        beam.direction = beam.direction === 'N' ? 'W' : 'E'
        beam.x = beam.x + beam.direction === 'N' ? -1 : 1
        nextBeams.push(beam)
        return
      }

      if (currentTile === '|') {
        if (['E', 'W'].includes(beam.direction)) {
          nextBeams.push(
            {
              x: beam.x,
              y: beam.y - 1,
              direction: 'N',
            },
            {
              x: beam.x,
              y: beam.y + 1,
              direction: 'S',
            }
          )
        } else {
          nextBeams.push(beam)
        }
        return
      }

      if (currentTile === '-') {
        if (['N', 'S'].includes(beam.direction)) {
          nextBeams.push(
            {
              x: beam.x + 1,
              y: beam.y,
              direction: 'E',
            },
            {
              x: beam.x - 1,
              y: beam.y,
              direction: 'W',
            }
          )
        } else {
          nextBeams.push(beam)
        }
        return
      }
    })

    beams = nextBeams
  }

  const nextGrid = grid.map((row, rowIndex) =>
    row.map((col, colIndex) => {
      const id = coordToId({ x: colIndex, y: rowIndex })
      return allSeenTiles.has(id) ? '#' : col
    })
  )
  writeFileSync(
    join(__dirname, 'beam-path.txt'),
    nextGrid.map((r) => r.join('')).join('\n')
  )

  return energizedTiles.size
}

describe('day 16.1', () => {
  describe('test 16.1', () => {
    const FILENAME = '16-test-data.txt'

    it('can detect in bound coord 0x0', () => {
      const grid: string[][] = Array(5)
        .fill(0)
        .map(() => Array(5).fill('.'))

      const coord = { x: 0, y: 0 }

      const coordInBounds = getGridCoordHandler(grid)

      const result = coordInBounds(coord)

      expect(result).toBe(true)
    })

    it('can detect in bound coord 4x4', () => {
      const grid: string[][] = Array(5)
        .fill(0)
        .map(() => Array(5).fill('.'))

      const coord = { x: 4, y: 4 }

      const coordInBounds = getGridCoordHandler(grid)

      const result = coordInBounds(coord)

      expect(result).toBe(true)
    })

    it('can detect in oob coord 4x5', () => {
      const grid: string[][] = Array(5)
        .fill(0)
        .map(() => Array(5).fill('.'))

      const coord = { x: 4, y: 5 }

      const coordInBounds = getGridCoordHandler(grid)

      const result = coordInBounds(coord)

      expect(result).toBe(false)
    })

    it('can detect in oob coord 5x4', () => {
      const grid: string[][] = Array(5)
        .fill(0)
        .map(() => Array(5).fill('.'))

      const coord = { x: 5, y: 4 }

      const coordInBounds = getGridCoordHandler(grid)

      const result = coordInBounds(coord)

      expect(result).toBe(false)
    })

    it('can detect in oob coord 4x-1', () => {
      const grid: string[][] = Array(5)
        .fill(0)
        .map(() => Array(5).fill('.'))

      const coord = { x: 4, y: -1 }

      const coordInBounds = getGridCoordHandler(grid)

      const result = coordInBounds(coord)

      expect(result).toBe(false)
    })

    it('can detect in oob coord -1x4', () => {
      const grid: string[][] = Array(5)
        .fill(0)
        .map(() => Array(5).fill('.'))

      const coord = { x: -1, y: 4 }

      const coordInBounds = getGridCoordHandler(grid)

      const result = coordInBounds(coord)

      expect(result).toBe(false)
    })

    it('can solve test 16.1', () => {
      const lines = parseFile(FILENAME)

      const grid = toGrid(lines)

      const energizedTiles = solveGrid(grid)

      expect(energizedTiles).toBe(46)
    })
  })
  describe('question 16.1', () => {
    const FILENAME = '16-data.txt'
  })
})

describe('day 16.2', () => {
  describe('test 16.2', () => {
    const FILENAME = '16-test-data.txt'
  })
  describe('question 16.2', () => {
    const FILENAME = '16-data.txt'
  })
})
