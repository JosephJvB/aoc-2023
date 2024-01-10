import { readFileSync } from 'fs'
import { join } from 'path'

const parseFile = (fileName: string) =>
  readFileSync(join(__dirname, fileName), 'utf-8').split('\n')

const getGrids = (lines: string[]) => {
  const grids: string[][] = []

  let grid: string[] = []
  lines.forEach((line) => {
    if (!line) {
      grids.push(grid)
      grid = []
      return
    }

    grid.push(line)
  })

  return grids
}

const getColumns = (grid: string[]) => {
  const columns: string[] = []

  for (let i = 0; i < grid[0].length; i++) {
    let column = ''

    for (let j = 0; j < grid.length; j++) {
      column += grid[j][i]
    }

    columns.push(column)
  }

  return columns
}

/**
 * maybe more efficient to start from middle of list
 * and check outwards, if lines either side match, then check next offset etc etc
 */
const findMirrorIndexByMatchingPair = (lines: string[]) =>
  lines.findIndex((l1, i) => l1 === lines[i + 1] && verifyMirrorIndex(lines, i))

const verifyMirrorIndex = (lines: string[], idx: number) => {
  if (!lines[idx]) {
    return false
  }

  for (
    let offset = 1;
    idx - offset >= 0 && // left limit
    idx + offset < lines.length - 1; // right limit
    offset++
  ) {
    const left = lines[idx - offset]
    const right = lines[idx + offset + 1]

    if (left !== right) {
      // console.log('exit false', {
      //   idx,
      //   offset,
      //   left,
      //   right,
      // })
      return false
    }
  }

  return true
}

const scoreGrid = (g: string[]) => {
  const rowIndex = findMirrorIndexByMatchingPair(g)
  if (rowIndex > -1) {
    return 100 * (rowIndex + 1)
  }

  const columns = getColumns(g)
  const columnIndex = findMirrorIndexByMatchingPair(columns)
  if (columnIndex > -1) {
    return columnIndex + 1
  }

  return -1
}

describe('day 13.1', () => {
  /**
   * find vertical / horizontal mirror in a 2D grid
   * find a pair of columns / rows that are identical
   * then iterate outwards from that pair - make sure each of those are identical too
   */
  describe('test 13.1', () => {
    const FILENAME = '13-test-data.txt'

    it('can get grids from file', () => {
      const lines = parseFile(FILENAME)

      const grids = getGrids(lines)

      expect(grids.length).toBe(2)
    })

    it('can parse grid 1', () => {
      const lines = parseFile(FILENAME)

      const grids = getGrids(lines)

      expect(grids[0].length).toBe(7)

      const columns = getColumns(grids[0])

      expect(columns.length).toBe(9)
      expect(grids[0]).toEqual([
        '#.##..##.',
        '..#.##.#.',
        '##......#',
        '##......#',
        '..#.##.#.',
        '..##..##.',
        '#.#.##.#.',
      ])
      expect(columns).toEqual([
        '#.##..#',
        '..##...',
        '##..###',
        '#....#.',
        '.#..#.#',
        '.#..#.#',
        '#....#.',
        '##..###',
        '..##...',
      ])
    })

    it('can find row mirrorIndex in grid 1', () => {
      const lines = parseFile(FILENAME)

      const grids = getGrids(lines)

      const rowMirror = findMirrorIndexByMatchingPair(grids[0])

      expect(rowMirror).toBe(-1)
    })

    it('can find column mirrorIndex in grid 1', () => {
      const lines = parseFile(FILENAME)

      const grids = getGrids(lines)

      const columns = getColumns(grids[0])

      expect(columns[4]).toBe(columns[5])

      const columnMirror = findMirrorIndexByMatchingPair(columns)

      expect(columnMirror).toBe(4)
    })

    it('can find row mirrorIndex in grid 2', () => {
      const lines = parseFile(FILENAME)

      const grids = getGrids(lines)

      expect(grids[1][3]).toBe(grids[1][4])

      const rowMirror = findMirrorIndexByMatchingPair(grids[1])

      expect(rowMirror).toBe(3)
    })

    it('can find column mirrorIndex in grid 2', () => {
      const lines = parseFile(FILENAME)

      const grids = getGrids(lines)

      const columns = getColumns(grids[1])

      const columnMirror = findMirrorIndexByMatchingPair(columns)

      expect(columnMirror).toBe(-1)
    })

    it('can score grid 1', () => {
      const lines = parseFile(FILENAME)

      const grids = getGrids(lines)

      const gridScore = scoreGrid(grids[0])

      expect(gridScore).toBe(5)
    })

    it('can score grid 2', () => {
      const lines = parseFile(FILENAME)

      const grids = getGrids(lines)

      const gridScore = scoreGrid(grids[1])

      expect(gridScore).toBe(400)
    })

    it('can solve test 13.1', () => {
      const lines = parseFile(FILENAME)

      const grids = getGrids(lines)

      const total = grids.reduce((tot, g, i) => {
        const gridScore = scoreGrid(g)
        if (gridScore === -1) {
          throw new Error(`failed to score grid[${i}]`)
        }

        return tot + gridScore
      }, 0)

      expect(total).toBe(405)
    })
  })
  describe('question 13.1', () => {
    const FILENAME = '13-data.txt'

    it('can solve question 13.1', () => {
      const lines = parseFile(FILENAME)

      const grids = getGrids(lines)

      const total = grids.reduce((tot, g, i) => {
        const gridScore = scoreGrid(g)
        if (gridScore === -1) {
          throw new Error(`failed to score grid[${i}]`)
        }

        return tot + gridScore
      }, 0)

      console.log({
        answer1: total,
      })

      expect(total).toBeGreaterThan(405)
    })
  })
})

describe('day 13.2', () => {
  describe('test 13.2', () => {
    const FILENAME = '13-test-data.txt'
  })
  describe('question 13.2', () => {
    const FILENAME = '13-data.txt'
  })
})
