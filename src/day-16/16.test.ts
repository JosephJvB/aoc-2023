import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const Mirrors = ['/', '\\'] as const
type Mirror = (typeof Mirrors)[number]
const Splitters = ['|', '-'] as const
type Splitter = (typeof Splitters)[number]
const VERTICAL_REDIRECTS: Direction[] = ['N', 'S']
const HORIZONTAL_REDIRECTS: Direction[] = ['E', 'W']
type Tile = Mirror | Splitter | '.'

const BouncyTiles = new Set([...Mirrors, ...Splitters])

type Coord = {
  x: number
  y: number
}
type Direction = 'N' | 'E' | 'S' | 'W'
type Beam = Coord & {
  direction: Direction
}

const parseFile = (fileName: string) =>
  readFileSync(join(__dirname, fileName), 'utf-8').trim().split('\n')

const toGrid = (lines: string[]) =>
  lines.filter((l) => !!l).map((l) => l.trim().split('')) as Tile[][]

const coordToId = (coord: Coord) => [coord.x, coord.y].join('x')
const beamToId = (beam: Beam) => [beam.direction, beam.x, beam.y].join('x')

const handleSplitter = (beam: Beam, redirects: Direction[]) => {
  if (redirects.includes(beam.direction)) {
    return [beam]
  }

  return redirects.map((d) => ({ ...beam, direction: d }))
}
const handleBackslash = (beam: Beam) => {
  switch (beam.direction) {
    case 'N':
      beam.direction = 'W'
      break
    case 'E':
      beam.direction = 'S'
      break
    case 'S':
      beam.direction = 'E'
      break
    case 'W':
      beam.direction = 'N'
      break
  }
  return [beam]
}
const handleFwdslash = (beam: Beam) => {
  switch (beam.direction) {
    case 'N':
      beam.direction = 'E'
      break
    case 'E':
      beam.direction = 'N'
      break
    case 'S':
      beam.direction = 'W'
      break
    case 'W':
      beam.direction = 'S'
      break
  }
  return [beam]
}
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
  return beam
}
const handleTiles = (beam: Beam, char: Tile): Beam[] => {
  switch (char) {
    case '-':
      return handleSplitter(beam, HORIZONTAL_REDIRECTS)
    case '|':
      return handleSplitter(beam, VERTICAL_REDIRECTS)
    case '/':
      return handleFwdslash(beam)
    case '\\':
      return handleBackslash(beam)
    case '.':
      return [beam]
    default:
      throw new Error(`unexpected tile:${char} @ beam:${JSON.stringify(beam)}`)
  }
}

const getGridCoordHandler = (grid: string[][]) => (coord: Coord) =>
  coord.x >= 0 &&
  coord.y >= 0 &&
  coord.x < grid[0].length &&
  coord.y < grid.length

const saveGrid = (grid: Tile[][], seenCoords: Set<string>) => {
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

const solveGrid = (grid: Tile[][], startingBeam: Beam) => {
  const coordInBounds = getGridCoordHandler(grid)

  const energizedTiles = new Set<string>()

  let beams: Beam[] = [startingBeam]
  const prevBeams = new Set<string>()
  while (beams.length) {
    const nextBeams: Beam[] = []

    beams.forEach((beam) => {
      // oob
      if (!coordInBounds(beam)) {
        return
      }

      // exit on repeats
      const beamId = beamToId(beam)
      if (prevBeams.has(beamId)) {
        return
      }
      prevBeams.add(beamId)

      energizedTiles.add(coordToId(beam))

      const currentTile = grid[beam.y][beam.x]
      const tileResults = handleTiles(beam, currentTile)
      const moveResults = tileResults.map((b) => moveBeam(b))

      nextBeams.push(...moveResults)
    })

    beams = nextBeams
  }

  // saveGrid(grid, energizedTiles)

  return energizedTiles.size
}

const getAllStartBeams = (grid: Tile[][]) => {
  const starts: Beam[] = []
  //top
  for (let i = 0; i < grid[0].length; i++) {
    // top
    starts.push({
      x: i,
      y: 0,
      direction: 'S',
    })
    // bottom
    starts.push({
      x: i,
      y: grid.length - 1,
      direction: 'N',
    })
    // left
    starts.push({
      x: 0,
      y: i,
      direction: 'E',
    })
    // right
    starts.push({
      x: grid.length - 1,
      y: i,
      direction: 'W',
    })
  }

  return starts
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

    // missing tests: moveBeam
    // for each tile, for each direction before / after

    it('can solve test 16.1', () => {
      const lines = parseFile(FILENAME)

      const grid = toGrid(lines)

      const energizedTiles = solveGrid(grid, {
        x: 0,
        y: 0,
        direction: 'E',
      })

      expect(energizedTiles).toBe(46)
    })
  })
  describe('question 16.1', () => {
    const FILENAME = '16-data.txt'

    it('can solve question 16.1', () => {
      const lines = parseFile(FILENAME)

      const grid = toGrid(lines)

      const energizedTiles = solveGrid(grid, {
        x: 0,
        y: 0,
        direction: 'E',
      })

      console.log({
        answer1: energizedTiles,
      })

      expect(energizedTiles).toBeGreaterThan(46)
    })
  })
})

// can you just brute force it?
describe('day 16.2', () => {
  describe('test 16.2', () => {
    const FILENAME = '16-test-data.txt'

    it('can get starting beams', () => {
      const lines = parseFile(FILENAME)

      const grid = toGrid(lines)

      const startBeams = getAllStartBeams(grid)

      expect(startBeams.length).toBe(40)

      const withZero = startBeams.filter((b) => b.x === 0 || b.y === 0)
      expect(withZero.length).toBe(22)
      const with9 = startBeams.filter((b) => b.x === 9 || b.y === 9)
      expect(with9.length).toBe(22)
    })

    it('can solve test 16.2', () => {
      const lines = parseFile(FILENAME)

      const grid = toGrid(lines)

      const startBeams = getAllStartBeams(grid)

      let maxCoverage = 0
      let maxBeam: Beam | null = null
      startBeams.forEach((b) => {
        const beam = { ...b }
        const coverage = solveGrid(grid, b)
        if (coverage > maxCoverage) {
          maxCoverage = coverage
          maxBeam = beam
        }
      })

      expect(maxCoverage).toBe(51)
      expect(maxBeam).toEqual({
        x: 3,
        y: 0,
        direction: 'S',
      })
    })
  })
  describe('question 16.2', () => {
    const FILENAME = '16-data.txt'

    it('can solve question 16.2', () => {
      const lines = parseFile(FILENAME)

      const grid = toGrid(lines)

      const startBeams = getAllStartBeams(grid)

      let maxCoverage = 0
      let maxBeam: Beam | null = null

      console.time('16.2')
      startBeams.forEach((b, i) => {
        const beam = { ...b }
        // let t1 = Date.now()
        const coverage = solveGrid(grid, b)
        // let t2 = Date.now()
        // const ts = Math.round(t2 - t1)
        // process.stdout.write(`beam:${i + 1} solved in ${ts}ms\r`)
        if (coverage > maxCoverage) {
          maxCoverage = coverage
          maxBeam = beam
        }
      })
      console.timeEnd('16.2')

      console.log({
        answer2: maxCoverage,
        beam: maxBeam,
      })

      expect(maxCoverage).toBeGreaterThan(51)
    })
  })
})
