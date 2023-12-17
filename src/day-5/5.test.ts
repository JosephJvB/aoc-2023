import { readFileSync } from 'fs'
import { join } from 'path'

const MAP_TITLES = [
  'seed-to-soil',
  'soil-to-fertilizer',
  'fertilizer-to-water',
  'water-to-light',
  'light-to-temperature',
  'temperature-to-humidity',
  'humidity-to-location',
] as const

export type Range = {
  min: number
  max: number
  offset: number
}
export type GardenMap = {
  title: (typeof MAP_TITLES)[number]
  ranges: Range[]
}

const parseNumberLine = (line: string) =>
  line
    .trim()
    .split(' ')
    .map((s) => parseInt(s.trim()))
const lineToRange = (line: number[]) => {
  const [destination, source, range] = line
  return {
    min: source,
    max: source + range,
    offset: destination - source,
  }
}

const parseFile = (fileName: string) => {
  const raw = readFileSync(join(__dirname, fileName), 'utf-8')
  const lines = raw.split('\n')

  const seeds = parseNumberLine(lines[0].split(':')[1])

  const maps = raw
    .split('\n\n')
    .slice(1)
    .map((chunk, i) => ({
      title: MAP_TITLES[i],
      ranges: chunk
        .split('\n')
        .slice(1)
        .filter((l) => !!l)
        .map((l) => parseNumberLine(l))
        .map((l) => lineToRange(l)),
    }))

  return { seeds, maps }
}

const traverseMaps = (seed: number, maps: GardenMap[]) => {
  return maps.reduce(
    (prevValues, map) => {
      const prevValue = prevValues[prevValues.length - 1]
      const offset =
        map.ranges.find((r) => prevValue >= r.min && prevValue <= r.max)
          ?.offset ?? 0

      return [...prevValues, prevValue + offset]
    },
    [seed]
  )
}

describe('day 5.1', () => {
  describe('test 5.1', () => {
    const FILENAME = '5.1-test-data.txt'

    it('can parse test data', () => {
      const parsed = parseFile(FILENAME)

      expect(parsed.seeds).toHaveLength(4)
      expect(parsed.maps).toHaveLength(MAP_TITLES.length)
      expect(parsed.maps[0].ranges).toHaveLength(2)
      expect(parsed.maps[1].ranges).toHaveLength(3)
      expect(parsed.maps[2].ranges).toHaveLength(4)
      expect(parsed.maps[3].ranges).toHaveLength(2)
      expect(parsed.maps[4].ranges).toHaveLength(3)
      expect(parsed.maps[5].ranges).toHaveLength(2)
      expect(parsed.maps[6].ranges).toHaveLength(2)

      expect(parsed.maps[0].ranges[0]).toEqual({
        min: 98,
        max: 100,
        offset: -48,
      })
    })

    it('x1 seed (79) -> fertilizer', () => {
      const TRIM_FILENAME = '5.1-test-data-trim.txt'
      const parsed = parseFile(TRIM_FILENAME)

      expect(parsed.seeds).toHaveLength(1)
      expect(parsed.maps).toHaveLength(2)
      expect(parsed.seeds[0]).toBe(79)

      const traversed = traverseMaps(parsed.seeds[0], parsed.maps)

      expect(traversed).toEqual([79, 81, 81])
    })

    it('maps seed-to-soil (79)', () => {
      const parsed = parseFile(FILENAME)

      const traversed = traverseMaps(79, parsed.maps.slice(0, 1))

      expect(traversed).toEqual([79, 81])
    })

    it('x1 seed (79) -> location', () => {
      const parsed = parseFile(FILENAME)

      const traversed = traverseMaps(parsed.seeds[0], parsed.maps)

      expect(traversed).toEqual([79, 81, 81, 81, 74, 78, 78, 82])
    })

    it('can traverse all maps for all seeds', () => {
      const parsed = parseFile(FILENAME)

      const results = parsed.seeds
        .map((s) => traverseMaps(s, parsed.maps))
        .map((result) => result.pop())

      expect(results).toEqual([82, 43, 86, 35])
    })

    it('can solve test 5.1', () => {
      const parsed = parseFile(FILENAME)

      const result = Math.min(
        ...parsed.seeds
          .map((s) => traverseMaps(s, parsed.maps))
          .map((result) => result.pop() as number)
      )

      expect(result).toBe(35)
    })
  })

  describe('question 5.1', () => {
    const FILENAME = '5.1-data.txt'

    it('can solve question 5.1', () => {
      const parsed = parseFile(FILENAME)

      const result = Math.min(
        ...parsed.seeds
          .map((s) => traverseMaps(s, parsed.maps))
          .map((result) => result.pop() as number)
      )

      console.log({ answer1: result })

      expect(result).toBeGreaterThan(0)
    })
  })
})

const seedsToRanges = (seeds: number[]) => {
  return seeds.reduce((acc, seed, i, seeds) => {
    if (i % 2) return acc
    const min = seed
    const max = seeds[i + 1]
    const range = [min, max] as [number, number]
    range.sort()

    acc.push(range)
    return acc
  }, [] as number[][])
}

// 14, 79 v 50, 98
const rangesIntersect = (a: number[], b: number[]) =>
  Math.max(a[0], b[0]) <= Math.min(a[1], b[1])

const traverseMapsAsRange = (seedRange: number[], maps: GardenMap[]) => {
  // one range and one map
  const map = maps[0]
  // find intersection if any
  // 14, 79 v 50, 98

  // return maps.reduce((acc, map) => {
  //   return acc.reduce
  // }, [seedRange])
}

describe('day 5.2', () => {
  describe('test 5.2', () => {
    const FILENAME = '5.1-test-data.txt'

    it('can split seed ranges', () => {
      const parsed = parseFile(FILENAME)

      const ranges = seedsToRanges(parsed.seeds)

      expect(ranges.length).toBe(2)
      expect(ranges).toEqual([
        [14, 79],
        [13, 55],
      ])
    })

    it('findIntersection: no overlap', () => {
      const input = [
        [0, 5],
        [10, 15],
      ]

      const result = rangesIntersect(input[0], input[1])

      expect(result).toBe(false)
    })

    it('findIntersection: overlap', () => {
      const input = [
        [0, 5],
        [3, 15],
      ]

      const result = rangesIntersect(input[0], input[1])

      expect(result).toBe(true)
    })

    it('findIntersection: contained', () => {
      const input = [
        [4, 6],
        [3, 15],
      ]

      const result = rangesIntersect(input[0], input[1])

      expect(result).toBe(true)
    })

    it('findIntersection: edges', () => {
      const input = [
        [4, 6],
        [6, 15],
      ]

      const result = rangesIntersect(input[0], input[1])

      expect(result).toBe(true)
    })

    it('can split a range', () => {
      const input = [0, 10]

      const target = [5, 20]

      // no intersection - return seed
      // seed:            |-----|
      // range:     |--|
      // result:          |-----|
      // intersection - x2 ranges
      // seed:        |-------|
      // range:  |--------|
      // result:      |---|---|
      // case: range is contained by seed - x3 ranges
      // seed:    |---------|
      // range:      |--|
      // result:  |--|--|----|

      const splitPoint = input[1] - target[0]

      const result = [
        [input[0], splitPoint],
        [splitPoint + 1, target[1]],
      ]

      expect(result).toEqual([
        [0, 5],
        [6, 20],
      ])
    })

    // it('can traverse a single range', () => {
    //   const input = [14, 79]

    //   const map: GardenMap = {
    //     title: 'seed-to-soil',
    //     ranges: [
    //       {
    //         min: 98,
    //         max: 100,
    //         offset: -48,
    //       },
    //       {
    //         min: 50,
    //         max: 98,
    //         offset: 2,
    //       },
    //     ],
    //   }
    // })
  })
})
