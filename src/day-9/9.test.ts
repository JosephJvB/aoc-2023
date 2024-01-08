import { readFileSync } from 'fs'
import { join } from 'path'

const parseFile = (fileName: string) =>
  readFileSync(join(__dirname, fileName), 'utf8')
    .split('\n')
    .filter((l) => !!l)
    .map((l) =>
      l
        .trim()
        .split(' ')
        .map((s) => parseInt(s))
    )

const lineToGrid = (l: number[]) => {
  const grid = [l]
  while (!grid[grid.length - 1].every((n) => n === 0)) {
    const lastLine = grid[grid.length - 1]
    const next = []
    for (let i = 0; i < lastLine.length - 1; i++) {
      const lower = lastLine[i]
      const higher = lastLine[i + 1]
      next.push(higher - lower)
    }
    grid.push(next)
  }

  return grid
}

const getNextGridNumber = (g: number[][]) =>
  g.reduce((tot, l) => tot + l[l.length - 1], 0)

describe('day 9.1', () => {
  describe('test 9.1', () => {
    const FILENAME = '9-test-data.txt'

    it('can turn line 1 to grid', () => {
      const input = [0, 3, 6, 9, 12, 15]

      const result = lineToGrid(input)

      expect(result).toEqual([
        [0, 3, 6, 9, 12, 15],
        [3, 3, 3, 3, 3],
        [0, 0, 0, 0],
      ])
    })

    it('can solve line 1', () => {
      const input = [0, 3, 6, 9, 12, 15]

      const grid = lineToGrid(input)

      const result = getNextGridNumber(grid)

      expect(result).toBe(18)
    })

    it('can solve line 2', () => {
      const input = [1, 3, 6, 10, 15, 21]

      const grid = lineToGrid(input)

      const result = getNextGridNumber(grid)

      expect(result).toBe(28)
    })

    it('can solve line 3', () => {
      const input = [10, 13, 16, 21, 30, 45]

      const grid = lineToGrid(input)

      const result = getNextGridNumber(grid)

      expect(result).toBe(68)
    })

    it('can solve test 9.1', () => {
      const lines = parseFile(FILENAME)

      const grids = lines.map((l) => lineToGrid(l))

      const numbers = grids.map((g) => getNextGridNumber(g))

      const result = numbers.reduce((tot, n) => tot + n, 0)

      expect(result).toBe(114)
    })
  })

  describe('question 9.1', () => {
    const FILENAME = '9-data.txt'

    it('can solve question 9.1', () => {
      const lines = parseFile(FILENAME)

      const grids = lines.map((l) => lineToGrid(l))

      const numbers = grids.map((g) => getNextGridNumber(g))

      const result = numbers.reduce((tot, n) => tot + n, 0)

      console.log({
        answer1: result,
      })

      expect(result).toBeGreaterThan(114)
    })
  })
})

const getPrevGridNumber = (g: number[][]) => {
  let n = 0

  for (let i = g.length - 1; i > 0; i--) {
    const nextLineValue = g[i - 1][0]
    const nextN = nextLineValue - n
    n = nextN
  }

  return n
}

describe('day 9.2', () => {
  describe('test 9.2', () => {
    const FILENAME = '9-test-data.txt'

    it('can get prevGridNumber from [10, 13, 16, 21, 30, 45]', () => {
      const input = [10, 13, 16, 21, 30, 45]

      const grid = lineToGrid(input)

      const result = getPrevGridNumber(grid)

      expect(result).toBe(5)
    })

    it('can solve test 9.2', () => {
      const lines = parseFile(FILENAME)

      const grids = lines.map((l) => lineToGrid(l))

      const numbers = grids.map((g) => getPrevGridNumber(g))

      const result = numbers.reduce((tot, n) => tot + n, 0)

      expect(result).toBe(2)
    })
  })

  describe('question 9.2', () => {
    const FILENAME = '9-data.txt'

    it('can get prevGridNumber from [10, 13, 16, 21, 30, 45]', () => {
      const lines = parseFile(FILENAME)

      const grids = lines.map((l) => lineToGrid(l))

      const numbers = grids.map((g) => getPrevGridNumber(g))

      const result = numbers.reduce((tot, n) => tot + n, 0)

      console.log({
        answer2: result,
      })

      expect(result).not.toBeNaN()
    })
  })
})
