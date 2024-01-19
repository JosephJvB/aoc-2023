import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const Mirrors = ['/', '\\'] as const
type Mirror = (typeof Mirrors)[number]
const Splitters = ['|', '-'] as const
type Splitter = (typeof Splitters)[number]

const BouncyTiles = new Set([...Mirrors, ...Splitters])

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
const beamToId = (beam: Beam) => [beam.direction, beam.x, beam.y].join('x')

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

const saveGrid = (grid: string[][], seenCoords: Set<string>) => {
  const gridStr = grid
    .map((r, rIdx) =>
      r
        .map((c, cIdx) => {
          const coordId = [cIdx, rIdx].join('x')
          if (BouncyTiles.has(c as any)) return c
          return seenCoords.has(coordId) ? '*' : c
        })
        .join('')
    )
    .join('\n')

  writeFileSync(__dirname + '/beam-path.txt', gridStr)
}

const solveGrid = (grid: string[][]) => {
  const coordInBounds = getGridCoordHandler(grid)

  const energizedTiles = new Set<string>()

  let beams: Beam[] = [{ x: 0, y: 0, direction: 'E' }]
  const prevBeams = new Set<string>()
  while (beams.length) {
    const nextBeams: Beam[] = []

    beams.forEach((beam) => {
      const beamClone = { ...beam }
      if (!coordInBounds(beam)) {
        return
      }
      // maybe check if beam @location&direction has been logged before
      // if so - don't calculate the beam again
      const beamId = beamToId(beam)
      if (prevBeams.has(beamId)) {
        return
      }
      prevBeams.add(beamId)

      const tileId = coordToId(beam)
      energizedTiles.add(tileId)

      const currentTile = grid[beam.y][beam.x]
      if (currentTile === '.') {
        moveBeam(beam)
        nextBeams.push(beam)
      }

      // a nicer way to write this please
      // mirrors
      if (currentTile === '/') {
        if (['N', 'S'].includes(beam.direction)) {
          beam.x = beam.x + (beam.direction === 'N' ? 1 : -1)
          beam.direction = beam.direction === 'N' ? 'E' : 'W'
          nextBeams.push(beam)
        } else if (['E', 'W'].includes(beam.direction)) {
          beam.y = beam.y + (beam.direction === 'E' ? -1 : 1)
          beam.direction = beam.direction === 'E' ? 'N' : 'S'
          nextBeams.push(beam)
        }
      }
      if (currentTile === '\\') {
        if (['N', 'S'].includes(beam.direction)) {
          beam.x = beam.x + (beam.direction === 'N' ? -1 : 1)
          beam.direction = beam.direction === 'N' ? 'W' : 'E'
          nextBeams.push(beam)
        } else if (['E', 'W'].includes(beam.direction)) {
          beam.y = beam.y + (beam.direction === 'E' ? 1 : -1)
          beam.direction = beam.direction === 'E' ? 'S' : 'N'
          nextBeams.push(beam)
        }
      }

      // splitters
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
          moveBeam(beam)
          nextBeams.push(beam)
        }
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
          moveBeam(beam)
          nextBeams.push(beam)
        }
      }
      if (nextBeams.find((b) => b.x === 4 && b.y === 5)) {
        throw new Error(
          `how did we get here? ${JSON.stringify({
            beam,
            beamClone,
            currentTile,
          })}`
        )
      }
    })

    beams = nextBeams
  }

  saveGrid(grid, energizedTiles)

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
