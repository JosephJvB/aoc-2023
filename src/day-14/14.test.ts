import { readFileSync } from 'fs'
import { join } from 'path'

/**
  test data tilted north

  OOOO.#.O..
  OO..#....#
  OO..O##..O
  O..#.OO...
  ........#.
  ..#....#.#
  ..O..#.O.O
  ..O.......
  #....###..
  #....#....
 */

type Grid = {
  rows: string[][]
  columns: string[][]
}

const parseFile = (fileName: string) =>
  readFileSync(join(__dirname, fileName), 'utf-8').trim().split('\n')

const toGrid = (lines: string[]) => {
  const rows = lines.map((l) => l.split(''))
  const columns: string[][] = []
  rows[0].forEach((_, colIdx) => {
    const col = rows.map((r) => r[colIdx])
    columns.push(col)
  })

  return { rows, columns }
}

const tiltNorth = (grid: Grid) => {
  const columns = grid.columns.map((c) => translateColumnNorth(c))

  const rows: string[][] = []
  columns[0].forEach((_, rowIdx) => {
    const row = columns.map((c) => c[rowIdx])
    rows.push(row)
  })

  return {
    rows,
    columns,
  }
}

// same as rolling to the left..
const translateColumnNorth = (column: string[]) => {
  const next: string[] = []

  let rollers = 0
  let empties = 0

  column.forEach((char) => {
    switch (char) {
      case '#':
        next.push(...Array(rollers).fill('O'))
        next.push(...Array(empties).fill('.'))
        rollers = 0
        empties = 0
        next.push('#')
        break
      case 'O':
        rollers++
        break
      case '.':
        empties++
        break
    }
  })

  next.push(...Array(rollers).fill('O'))
  next.push(...Array(empties).fill('.'))
  // console.log('@end', {
  //   input: column.join(''),
  //   result: next.join(''),
  //   rollers,
  //   empties,
  // })

  return next
}

const scoreGrid = (grid: Grid) =>
  grid.rows.reduce((tot, r, idx) => {
    const rollers = r.filter((c) => c === 'O').length
    const rowScore = (grid.rows.length - idx) * rollers
    return tot + rowScore
  }, 0)

describe('day 14.1', () => {
  describe('test 14.1', () => {
    const FILENAME = '14-test-data.txt'

    it('can create a grid', () => {
      const lines = parseFile(FILENAME)

      const grid = toGrid(lines)

      expect(grid.rows.length).toBe(10)
      expect(grid.columns.length).toBe(10)

      expect(grid.rows[3].join('')).toBe('OO.#O....O')
      expect(grid.columns[5].join('')).toBe('#.#..O#.##')
    })

    it('can translate #1 column north', () => {
      const input = 'OO.O.O..##'.split('')

      const result = translateColumnNorth(input)

      // console.log({
      //   result: result.join(''),
      //   expected: 'OOOO....##',
      // })

      expect(result).toEqual('OOOO....##'.split(''))
    })

    it('can translate #2 column north', () => {
      const input = '#.O#.O#.O.#.OO'.split('')

      const result = translateColumnNorth(input)

      // console.log({
      //   result: result.join(''),
      //   expected: '#O.#O.#O..#OO.',
      // })

      expect(result).toEqual('#O.#O.#O..#OO.'.split(''))
    })

    it('can translate a grid', () => {
      const lines = parseFile(FILENAME)

      const grid = toGrid(lines)

      const translated = tiltNorth(grid)

      expect(translated.rows.map((r) => r.join(''))).toEqual([
        'OOOO.#.O..',
        'OO..#....#',
        'OO..O##..O',
        'O..#.OO...',
        '........#.',
        '..#....#.#',
        '..O..#.O.O',
        '..O.......',
        '#....###..',
        '#....#....',
      ])
    })

    it('can solve test 14.1', () => {
      const lines = parseFile(FILENAME)

      const grid = toGrid(lines)

      const translated = tiltNorth(grid)

      const score = scoreGrid(translated)

      expect(score).toBe(136)
    })
  })
  describe('question 14.1', () => {
    const FILENAME = '14-data.txt'

    const lines = parseFile(FILENAME)

    const grid = toGrid(lines)

    const translated = tiltNorth(grid)

    const score = scoreGrid(translated)

    console.log({
      answer1: score,
    })

    expect(score).toBeGreaterThan(136)
  })
})

/**
 * surely another LCM
 * after a certain number of cycles it will repeat no?
 * so it's
 * 1. handle rotating a grid / tilting in any direction
 * 2. lcm of pattern
 * 3. extrapolate to 1000000000
 * 4. easier said than done
 */
describe('day 14.2', () => {
  describe('test 14.2', () => {
    const FILENAME = '14-test-data.txt'
  })
  describe('question 14.2', () => {
    const FILENAME = '14-data.txt'
  })
})
