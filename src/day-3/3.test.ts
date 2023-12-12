import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

type Coord = {
  x: number
  y: number
}
type GridNumber = {
  value: number
  ownCoords: string[]
  neighbours: string[]
}

const toGrid = (fileName: string) =>
  readFileSync(join(__dirname, fileName), 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => !!l)
    .map((l) => l.split(''))

const isSymbol = (char: string) => {
  return isNaN(parseInt(char)) && char !== '.'
}
const coordToString = (c: Coord) => [c.y, c.x].join('x')
const lineToNumbers = (line: string) => line.match(/\d+/g) ?? []
const getNeighbours = ({ x, y }: Coord): string[] =>
  [
    [y - 1, x - 1], // top left
    [y - 1, x], // top middle
    [y - 1, x + 1], // top right
    [y, x - 1], // middle left
    [y, x + 1], // middle right
    [y + 1, x + 1], // bottom right
    [y + 1, x], // bottom middle
    [y + 1, x - 1], // bottom left
  ].map((c) => c.join('x'))

const parseGrid = (grid: string[][]) => {
  const gridNumbers: GridNumber[] = []
  const symbolCoords = new Set<string>()

  grid.forEach((line, y) => {
    line.forEach((char, x) => {
      if (isSymbol(char)) {
        symbolCoords.add(`${y}x${x}`)
      }
    })

    const lineStr = line.join('')
    const lineNumbers = lineToNumbers(lineStr)

    // if a number appears twice in one line
    // make sure to not repeat the same index for the same number
    let prevOffset = 0
    lineNumbers.forEach((n) => {
      let xOffset = lineStr.substring(prevOffset).indexOf(n)
      if (xOffset === -1) {
        throw new Error(
          `failed to find number "${n}" in line "${lineStr}" prevOffset:${prevOffset}`
        )
      }
      xOffset += prevOffset
      prevOffset = xOffset

      const neighboursSet = new Set<string>()
      const ownCoordsSet = new Set<string>()
      n.split('').forEach((_, xIdx) => {
        const coord = {
          x: xIdx + xOffset,
          y,
        }

        ownCoordsSet.add(coordToString(coord))

        getNeighbours(coord).forEach((c) => neighboursSet.add(c))
      })

      gridNumbers.push({
        value: parseInt(n),
        ownCoords: [...ownCoordsSet],
        neighbours: [...neighboursSet].filter((n) => !ownCoordsSet.has(n)),
      })
    })
  })

  return {
    gridNumbers,
    symbolCoords,
  }
}

const getPartNumbers = (fileName: string) => {
  const grid = toGrid(fileName)

  const { gridNumbers, symbolCoords } = parseGrid(grid)

  return gridNumbers.filter((n) =>
    n.neighbours.find((n) => symbolCoords.has(n))
  )
}

describe('day 3.1', () => {
  describe('test 3.1', () => {
    const FILENAME = '3.1-test-data.txt'
    it('toGrid 10x10', () => {
      const result = toGrid(FILENAME)

      expect(result).toHaveLength(10)
      expect(result.map((l) => l.length)).toEqual(Array(10).fill(10))
    })

    it('isSymbol', () => {
      const input = toGrid(FILENAME)

      const result = input.reduce(
        (tot, line) => tot + line.filter((c) => isSymbol(c)).length,
        0
      )
      expect(result).toBe(6)
    })

    it('lineToNumbers', () => {
      const input = '617*....123+..'

      const result = lineToNumbers(input)

      expect(result).toEqual(['617', '123'])
    })

    it('getNeighbours', () => {
      const input = { x: -1, y: 1000 }

      const result = getNeighbours(input)

      expect(result).toHaveLength(8)

      const unique = new Set(result.map((n) => JSON.stringify(n)))
      expect(unique.size).toBe(8)
    })

    it('getNeighbours 0x5 not include 1x3', () => {
      const input = { x: 5, y: 0 }

      const result = getNeighbours(input)

      expect(result).toHaveLength(8)

      const unique = new Set(result.map((n) => JSON.stringify(n)))
      expect(unique.size).toBe(8)

      expect(unique.has('1x3')).toBe(false)
    })

    it('parseGrid', () => {
      const input = toGrid(FILENAME)

      const result = parseGrid(input)

      expect(result.gridNumbers).toHaveLength(10)
      expect(result.symbolCoords.size).toBe(6)

      const values = result.gridNumbers.map((n) => n.value)
      const expected = [467, 114, 35, 633, 617, 58, 592, 755, 664, 598]
      expected.sort()
      values.sort()
      expect(values).toEqual(expected)

      writeFileSync(
        join(__dirname, '3.1-parsedGrid.json'),
        JSON.stringify(
          {
            gridNumbers: result.gridNumbers,
            symbolCoords: [...result.symbolCoords],
          },
          null,
          2
        )
      )
    })

    it('solves test 3.1', () => {
      const partNumbers = getPartNumbers(FILENAME)

      const result = partNumbers.map((n) => n.value)

      expect(result).toHaveLength(8)

      const expected = [467, 35, 633, 617, 592, 755, 664, 598]
      expected.sort()
      result.sort()
      expect(result).toEqual(expected)

      const sum = result.reduce((tot, n) => tot + n, 0)
      expect(sum).toBe(4361)
    })
  })

  describe('question 3.1', () => {
    const FILENAME = '3.1-data.txt'
    it(`can createGrid ${FILENAME} 140x140`, () => {
      const grid = toGrid(FILENAME)

      expect(grid.length).toBe(grid[0].length)
    })

    it(`can parseGrid ${FILENAME} line1`, () => {
      const grid = toGrid(FILENAME)

      const mockGrid = [grid[0]]

      const parsed = parseGrid(mockGrid)
      expect(parsed.gridNumbers).toHaveLength(7)
      const values = parsed.gridNumbers.map((n) => n.value)
      expect(values).toEqual([937, 309, 191, 745, 913, 256, 891])
      expect(parsed.symbolCoords.size).toBe(0)
    })

    it('has duplicated numbers in the grid lines', () => {
      const grid = toGrid(FILENAME)

      let duplicates = false

      grid.forEach((line, y) => {
        const lineStr = line.join('')
        const lineNumbers = lineToNumbers(lineStr)

        const unique = new Set(lineNumbers)
        if (unique.size < lineNumbers.length) {
          duplicates = true
        }
      })

      expect(duplicates).toBe(true)
    })

    it('has unique numbers by coords', () => {
      const partNumbers = getPartNumbers(FILENAME)

      const unique = new Set()
      partNumbers.forEach((n) => {
        const key = n.ownCoords.join(',')
        unique.add(key)
      })

      expect(partNumbers.length).toBe(unique.size)
    })

    it('has unique numbers by neighbours', () => {
      const partNumbers = getPartNumbers(FILENAME)

      const unique = new Set()
      partNumbers.forEach((n) => {
        const key = n.neighbours.join(',')
        unique.add(key)
      })

      expect(partNumbers.length).toBe(unique.size)
    })

    it('solves question 3.1', () => {
      const partNumbers = getPartNumbers(FILENAME)

      const result = partNumbers.map((n) => n.value)

      const answer1 = result.reduce((tot, n) => tot + n, 0)
      console.log({
        numPartNumbers: result.length,
        answer1,
      })
      expect(answer1).toBeGreaterThan(0)
      expect(answer1).toBeLessThan(532718) // fixed .indexOf()
      expect(answer1).toBeGreaterThan(532300) // still wrong
    })
  })
})
