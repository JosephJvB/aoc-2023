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
}
export type GardenMap = {
  title: (typeof MAP_TITLES)[number]
  ranges: Map<number, number>[]
}

const parseNumberLine = (line: string) =>
  line
    .trim()
    .split(' ')
    .map((s) => parseInt(s.trim()))
const parseMap = (line: number[]) => {
  const [source, destination, range] = line

  const map = new Map<number, number>()
  for (let i = 0; i < range; i++) {
    map.set(source + i, destination + i)
  }
  return map
}
const parseFile = (fileName: string) => {
  const raw = readFileSync(join(__dirname, fileName), 'utf-8')
  const lines = raw.split('\n')

  const seeds = parseNumberLine(lines[0].split(':')[1])

  const maps: GardenMap[] = raw
    .split('\n\n')
    .slice(1)
    .map((chunk, i) => ({
      title: MAP_TITLES[i],
      ranges: chunk
        .split('\n')
        .slice(1)
        .filter((l) => !!l)
        .map((l) => parseNumberLine(l))
        .map((l) => parseMap(l)),
    }))

  return { seeds, maps }
}

const traverseMaps = (seed: number, maps: GardenMap[]) => {
  const initialValue = [seed]

  const result = maps.reduce((prevValues, m) => {
    // each map returns a new set of values
    const nextValues = prevValues.flatMap((pv) => {
      const rangeValues = m.ranges.map((range) => {
        const nv = range.has(pv) ? range.get(pv) : pv
        return nv as number
      })

      return rangeValues
    }, [])

    return nextValues
  }, initialValue)

  return result
}

/**
  seed = 79
  seed-to-soil map:
  50 98 2
  52 50 48

  soil-to-fertilizer map:
  0 15 37
  37 52 2
  39 0 15

  first = [79, 77] seed to soil
  second = [79]

  obv a lot of duplication, using map keys could be good
  or even set
  ie: first = ['5']
      second = ['5,20', '5,5']
 */

describe('day 5.1', () => {
  /**
   * for each seed
   * traverse the maps to find location value
   * lowest location value is the answer?
   */
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
    })

    it('can create correct maps', () => {
      const input = [52, 50, 48]

      const result = parseMap(input)

      expect(result.size).toBe(48)
      expect(result.get(79)).toBe(77)
    })

    it('parse trimmed data', () => {
      const TRIM_FILENAME = '5.1-test-data-trim.txt'
      const parsed = parseFile(TRIM_FILENAME)

      expect(parsed.seeds).toHaveLength(1)
      expect(parsed.maps).toHaveLength(2)
      expect(parsed.seeds[0]).toBe(79)

      // seed to soil
      expect(parsed.maps[0].ranges[0].size).toBe(2)
      expect(parsed.maps[0].ranges[1].size).toBe(48)

      // soil to fertilizer
      expect(parsed.maps[1].ranges[0].size).toBe(37)
      expect(parsed.maps[1].ranges[1].size).toBe(2)
      expect(parsed.maps[1].ranges[2].size).toBe(15)
    })

    it('x1 seed (79) -> fertilizer', () => {
      const TRIM_FILENAME = '5.1-test-data-trim.txt'
      const parsed = parseFile(TRIM_FILENAME)

      expect(parsed.seeds).toHaveLength(1)
      expect(parsed.maps).toHaveLength(2)
      expect(parsed.seeds[0]).toBe(79)

      const fertilizerValues = traverseMaps(parsed.seeds[0], parsed.maps)

      const expectedLength = parsed.maps.reduce(
        (tot, m) => tot * m.ranges.length,
        1
      )

      expect(fertilizerValues).toHaveLength(expectedLength)
      expect(fertilizerValues).toEqual([79, 79, 79, 77, 77, 77])
    })

    it('x1 seed (13) -> location', () => {
      const parsed = parseFile(FILENAME)

      const fertilizerValues = traverseMaps(13, parsed.maps)

      const expectedLength = parsed.maps.reduce(
        (tot, m) => tot * m.ranges.length,
        1
      )

      expect(fertilizerValues).toHaveLength(expectedLength)

      const minValue = Math.min(...fertilizerValues)
      expect(minValue).toBe(35)
    })
  })
})
