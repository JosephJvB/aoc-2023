import { readFileSync } from 'fs'
import { join } from 'path'

const toNode = (line: string) => {
  const [id, _, l, r] = line.split(' ')

  return {
    id,
    L: l.replace('(', '').replace(',', ''),
    R: r.replace(')', ''),
  }
}

type Node = {
  id: string
  L: string
  R: string
}
type Instruction = 'L' | 'R'
type Network = {
  instructions: Instruction[]
  nodes: Map<string, Node>
}
const parseFile = (fileName: string): Network => {
  const [instructions, ...nodes] = readFileSync(
    join(__dirname, fileName),
    'utf-8'
  )
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => !!l)

  return {
    instructions: instructions.split('') as Instruction[],
    nodes: nodes
      .map((l) => toNode(l))
      .reduce((map, n) => {
        map.set(n.id, n)
        return map
      }, new Map<string, Node>()),
  }
}

const traverse = (network: Network) => {
  let steps = 0
  let current = network.nodes.get('AAA')!
  let i = 0
  while (current.id !== 'ZZZ') {
    const nextDirection = network.instructions[i]
    const nextNode = network.nodes.get(current[nextDirection])
    if (!nextNode) {
      throw new Error(
        `no next node ${JSON.stringify({
          nextDirection,
          current,
        })}`
      )
    }

    current = nextNode
    if (i === network.instructions.length - 1) {
      i = 0
    } else {
      i++
    }
    steps++
  }

  return steps
}

describe('day 8.1', () => {
  describe('test 8.1', () => {
    const FILENAME = '8-test-data.txt'

    it('can turn lines to nodes', () => {
      const input = ['AAA = (BBB, BBB)', 'BBB = (AAA, ZZZ)', 'ZZZ = (ZZZ, ZZZ)']

      const results = input.map((l) => toNode(l))

      expect(results).toEqual([
        {
          id: 'AAA',
          L: 'BBB',
          R: 'BBB',
        },
        {
          id: 'BBB',
          L: 'AAA',
          R: 'ZZZ',
        },
        {
          id: 'ZZZ',
          L: 'ZZZ',
          R: 'ZZZ',
        },
      ])
    })

    it('can parse file', () => {
      const results = parseFile(FILENAME)

      expect(results).toEqual({
        instructions: ['L', 'L', 'R'],
        nodes: new Map([
          [
            'AAA',
            {
              id: 'AAA',
              L: 'BBB',
              R: 'BBB',
            },
          ],
          [
            'BBB',
            {
              id: 'BBB',
              L: 'AAA',
              R: 'ZZZ',
            },
          ],
          [
            'ZZZ',
            {
              id: 'ZZZ',
              L: 'ZZZ',
              R: 'ZZZ',
            },
          ],
        ]),
      })
    })

    it('can solve test 8.1', () => {
      const network = parseFile(FILENAME)

      const steps = traverse(network)

      expect(steps).toBe(6)
    })
  })
})
