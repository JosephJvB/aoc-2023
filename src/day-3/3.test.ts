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
type Gear = {
  coord: string
  numbers: [GridNumber, GridNumber]
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
        symbolCoords.add(coordToString({ x, y }))
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
      prevOffset = xOffset + n.toString().length

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

    it('lineToNumbers returns no negatives', () => {
      const gridNumbers = toGrid(FILENAME).flatMap((l) =>
        lineToNumbers(l.join(''))
      )

      const negativeNumber = gridNumbers.find((n) => parseInt(n) < 0)
      expect(negativeNumber).toBeUndefined()
    })

    it('lineToNumbers handles arithmetic correctly', () => {
      const input = '10-617....34+123...5*5..5^2.'

      const result = lineToNumbers(input)

      expect(result).toEqual(['10', '617', '34', '123', '5', '5', '5', '2'])
    })

    it('lineToNumbers handles end of line', () => {
      const input = '.123..123'

      const result = lineToNumbers(input)

      expect(result).toEqual(['123', '123'])
    })

    it('getNeighbours', () => {
      const input = { x: -1, y: 1000 }

      const result = getNeighbours(input)

      expect(result).toHaveLength(8)

      const unique = new Set(result)
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

      // writeFileSync(
      //   join(__dirname, '3.1-parsedGrid.json'),
      //   JSON.stringify(
      //     {
      //       gridNumbers: result.gridNumbers,
      //       symbolCoords: [...result.symbolCoords],
      //     },
      //     null,
      //     2
      //   )
      // )
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

    it('no symbol has invalid coord', () => {
      const grid = toGrid(FILENAME)

      const results = parseGrid(grid)

      const invalid: string[] = []
      results.symbolCoords.forEach((c) => {
        const ints = c.split('x').map((c) => parseInt(c))
        const invalidValue = ints.find((v) => v < 0 || v >= 140)
        if (invalidValue) {
          invalid.push(c)
        }
      })

      expect(invalid).toHaveLength(0)
    })

    it('every number has unique coordinates', () => {
      const partNumbers = getPartNumbers(FILENAME)

      const numCoords = partNumbers.reduce(
        (tot, n) => tot + n.ownCoords.length,
        0
      )

      const unique = new Set<string>()
      partNumbers.forEach((n) => {
        n.ownCoords.forEach((c) => {
          unique.add(c)
        })
      })

      expect(unique.size).toBe(numCoords)
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

const parseGearGrid = (grid: string[][]) => {
  const gridNumbers: GridNumber[] = []
  const gearCoords = new Set<string>()

  grid.forEach((line, y) => {
    line.forEach((char, x) => {
      if (char === '*') {
        gearCoords.add(coordToString({ x, y }))
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
      prevOffset = xOffset + n.toString().length

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
    gearCoords,
  }
}

const getGearNumbers = (fileName: string) => {
  const grid = toGrid(fileName)

  const parsed = parseGearGrid(grid)

  const gearMap = new Map<string, GridNumber[]>()
  parsed.gridNumbers.forEach((gn) => {
    gn.neighbours.forEach((c) => {
      if (!parsed.gearCoords.has(c)) {
        return
      }

      const soFar = gearMap.get(c) ?? []
      gearMap.set(c, [...soFar, gn])
    })
  })

  const gears: Gear[] = []
  gearMap.forEach((numbers, coord) => {
    if (numbers.length === 2) {
      gears.push({
        coord,
        numbers: numbers as [GridNumber, GridNumber],
      })
    }
  })

  return gears
}

const calcGearRatioTotal = (gears: Gear[]) =>
  gears.reduce((tot, g) => tot + g.numbers[0].value * g.numbers[1].value, 0)

describe('day 3.2', () => {
  describe('test 3.2', () => {
    const FILENAME = '3.1-test-data.txt'

    it('can detect just star chars', () => {
      const grid = toGrid(FILENAME)

      const parsed = parseGearGrid(grid)

      expect(parsed.gearCoords.size).toBe(3)
      expect(parsed.gridNumbers.length).toBe(10)
    })

    it('can get gears and associated numbers', () => {
      const gears = getGearNumbers(FILENAME)

      expect(gears.length).toBe(2)
      const numbers = gears.flatMap((g) => g.numbers.map((n) => n.value))
      numbers.sort()
      expect(numbers.length).toBe(4)
      expect(numbers).toEqual([35, 467, 598, 755])
    })

    it('can calc gear ratios', () => {
      const gears = getGearNumbers(FILENAME)

      const ratioTotal = calcGearRatioTotal(gears)

      expect(ratioTotal).toBe(467835)
    })
  })

  describe('question 3.2', () => {
    const FILENAME = '3.1-data.txt'
    it('can solve 3.2', () => {
      const gears = getGearNumbers(FILENAME)

      const ratioTotal = calcGearRatioTotal(gears)

      console.log({
        answer2: ratioTotal,
      })

      expect(ratioTotal).toBeGreaterThan(467835)
    })
  })
})
