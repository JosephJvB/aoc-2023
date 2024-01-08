import { readFileSync } from 'fs'
import { join } from 'path'

type Coord = {
  x: number
  y: number
}

const parseFile = (fileName: string) =>
  readFileSync(join(__dirname, fileName), 'utf-8')
    .split('\n')
    .filter((l) => !!l)
    .map((l) => l.trim().split(''))

const expand = (lines: string[][]) => {
  const expanded: string[][] = []

  // expand rows
  lines.forEach((row) => {
    expanded.push(row)
    if (!row.includes('#')) {
      expanded.push([...row])
    }
  })

  // expand columns
  expanded[0]
    .map((_, cIdx) => expanded.map((r) => r[cIdx])) // create column
    .forEach((column, cIdx) => {
      if (!column.includes('#')) {
        expanded.forEach((row) => {
          row.splice(cIdx, 0, '.')
        })
      }
    })

  return expanded
}

const getGalaxies = (grid: string[][]) =>
  grid.reduce((galaxies, row, y) => {
    row.forEach((char, x) => {
      if (char === '#') {
        galaxies.push({ x, y })
      }
    })

    return galaxies
  }, [] as Coord[])

const getPairs = (galaxies: Coord[]) => {
  const pairs: [Coord, Coord][] = []

  galaxies.forEach((a, i) => {
    galaxies.slice(i + 1).forEach((b) => {
      pairs.push([a, b])
    })
  })

  return pairs
}

describe('day 11.1', () => {
  describe('test 11.1', () => {
    const FILENAME = '11-test-data.txt'

    it('can parse file', () => {
      const result = parseFile(FILENAME)

      expect(result.length).toBe(10)
      expect(result[0].length).toBe(10)
    })

    it('can expand universe', () => {
      const grid = parseFile(FILENAME)

      const expanded = expand(grid)

      expect(expanded.length).toBe(12) // 12 rows
      const rowLengths = expanded.map((r) => r.length)
      expect(rowLengths).toEqual(Array(12).fill(13)) // each 13 long
    })

    it('can get pairs', () => {
      const grid = parseFile(FILENAME)

      const galaxies = getGalaxies(grid)

      const pairs = getPairs(galaxies)

      expect(pairs.length).toBe(36)
    })
  })
  describe('question 11.1', () => {
    const FILENAME = '11-data.txt'
  })
})

describe('day 11.2', () => {
  describe('test 11.2', () => {
    const FILENAME = '11-test-data.txt'
  })
  describe('question 11.2', () => {
    const FILENAME = '11-data.txt'
  })
})
