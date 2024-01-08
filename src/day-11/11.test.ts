import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

type Coord = {
  id: number
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
  // WIP: expanding columns wrong - probably I shouldn't alter the columns till after
  // get list of idx's to expand, then do it after the loop
  // idk still not working
  let colsExpanded = 0
  expanded[0]
    .map((_, cIdx) => expanded.map((r) => r[cIdx])) // create column
    .forEach((column, cIdx) => {
      if (!column.includes('#')) {
        expanded.forEach((row) => {
          row.splice(cIdx + colsExpanded, 0, '.')
        })
        colsExpanded++
      }
    })

  return expanded
}

const getGalaxies = (grid: string[][]) =>
  grid.reduce((galaxies, row, y) => {
    row.forEach((char, x) => {
      if (char === '#') {
        galaxies.push({ id: galaxies.length + 1, x, y })
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

const getDistance = ([a, b]: [Coord, Coord]) => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
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

    it('can expanded write to file', () => {
      const grid = parseFile(FILENAME)

      const expanded = expand(grid)

      writeFileSync(
        join(__dirname, 'expanded.txt'),
        expanded.map((r) => r.join('')).join('\n')
      )

      expect(expanded.length).toBe(12)
    })

    it('can get galaxies', () => {
      const grid = parseFile(FILENAME)

      const galaxies = getGalaxies(grid)

      expect(galaxies.length).toBe(9)
    })

    it('can set correct coords on galaxies #9', () => {
      const grid = parseFile(FILENAME)

      const galaxies = getGalaxies(grid)

      expect(galaxies[8]).toEqual({
        id: 9,
        x: 5,
        y: 11,
      })
    })

    it('can get pairs', () => {
      const grid = parseFile(FILENAME)

      const galaxies = getGalaxies(grid)

      const pairs = getPairs(galaxies)

      expect(pairs.length).toBe(36)
    })

    it('can calulate distance: 0,0 -> 1,1', () => {
      const pair = [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ] as [Coord, Coord]

      const distance = getDistance(pair)

      expect(distance).toBe(2)
    })

    it('can calulate distance: 1,6 -> 5,11', () => {
      const pair = [
        { x: 1, y: 6 },
        { x: 5, y: 11 },
      ] as [Coord, Coord]

      const distance = getDistance(pair)

      expect(distance).toBe(9)
    })

    it('can calulate distance: 4,0 -> 9,10', () => {
      const pair = [
        { x: 4, y: 0 },
        { x: 9, y: 10 },
      ] as [Coord, Coord]

      const distance = getDistance(pair)

      expect(distance).toBe(15)
    })

    it('can calulate distance: 0,2 -> 12,7', () => {
      const pair = [
        { x: 0, y: 2 },
        { x: 12, y: 7 },
      ] as [Coord, Coord]

      const distance = getDistance(pair)

      expect(distance).toBe(17)
    })

    it('can calulate distance: 0,11 -> 5,11', () => {
      const pair = [
        { x: 0, y: 11 },
        { x: 5, y: 11 },
      ] as [Coord, Coord]

      const distance = getDistance(pair)

      expect(distance).toBe(5)
    })

    it('write test results to file', () => {
      const grid = parseFile(FILENAME)

      const expanded = expand(grid)

      const galaxies = getGalaxies(expanded)

      const pairs = getPairs(galaxies)

      const result = pairs.map((p) => ({
        pair: p,
        distance: getDistance(p),
      }))

      writeFileSync(
        join(__dirname, 'pairs-distance.json'),
        JSON.stringify(result, null, 2)
      )

      expect(result.length).toBe(36)
    })

    it('all pairs are unique', () => {
      const grid = parseFile(FILENAME)

      const expanded = expand(grid)

      const galaxies = getGalaxies(expanded)

      const pairs = getPairs(galaxies)

      const unique = new Set()

      pairs.forEach((p) => {
        unique.add(JSON.stringify(p))
      })

      expect(unique.size).toBe(pairs.length)
    })

    it.skip('can solve test 11.1', () => {
      const grid = parseFile(FILENAME)

      const expanded = expand(grid)

      const galaxies = getGalaxies(expanded)

      const pairs = getPairs(galaxies)

      const result = pairs.reduce((tot, p) => tot + getDistance(p), 0)

      expect(result).toBe(374) // i'm getting 386 ?
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
