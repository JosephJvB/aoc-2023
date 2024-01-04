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
  let i = 0

  let currentNode = network.nodes.get('AAA')
  if (!currentNode) {
    throw new Error('unable to find start node "AAA"')
  }

  while (currentNode.id !== 'ZZZ') {
    const nextDirection = network.instructions[i]
    const nextNode = network.nodes.get(currentNode[nextDirection])
    if (!nextNode) {
      throw new Error(
        `no next node ${JSON.stringify({
          nextDirection,
          currentNode,
        })}`
      )
    }

    currentNode = nextNode
    steps++
    i = i + 1 === network.instructions.length ? 0 : i + 1
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

  describe('question 8.1', () => {
    const FILENAME = '8-data.txt'

    it('can solve question 8.1', () => {
      const network = parseFile(FILENAME)

      const steps = traverse(network)

      console.log({
        answer1: steps,
      })

      expect(steps).toBeGreaterThan(6)
    })
  })
})

const multiTraverse = (network: Network) => {
  let steps = 0
  let i = 0

  let nodes = [...network.nodes.values()].filter((n) => n.id.endsWith('A'))

  while (!!nodes.find((n) => !n.id.endsWith('Z'))) {
    const nextDirection = network.instructions[i]
    const nextNodes = nodes.map((n) => {
      const nextNode = network.nodes.get(n[nextDirection])
      if (!nextNode) {
        throw new Error(
          `Failed to find nextNode ${JSON.stringify({
            node: n,
            nextDirection,
          })}`
        )
      }

      return nextNode
    })

    nodes = nextNodes
    i = i + 1 === network.instructions.length ? 0 : i + 1
    steps++
  }

  return steps
}

const getNextNode = (network: Network) => (i: number, currentNode: Node) => {
  const nextDirection = network.instructions[i]
  const nextNode = network.nodes.get(currentNode[nextDirection])
  if (!nextNode) {
    throw new Error(
      `no next node ${JSON.stringify({
        nextDirection,
        currentNode,
      })}`
    )
  }

  return nextNode
}

const getLowestMultiples = (network: Network) => {
  let nodes = [...network.nodes.values()].filter((n) => n.id.endsWith('A'))
  const startNodesLength = nodes.length

  const multiples: number[] = []
  let i = 0
  let steps = 1

  const nextNodeGetter = getNextNode(network)
  while (multiples.length < startNodesLength) {
    const nextNodes: Node[] = []
    nodes.forEach((n) => {
      const nextNode = nextNodeGetter(i, n)
      if (nextNode.id.endsWith('Z')) {
        multiples.push(steps)
      } else {
        nextNodes.push(nextNode)
      }
    })

    steps++
    i = i + 1 === network.instructions.length ? 0 : i + 1
    nodes = nextNodes
  }

  return multiples
}

const gcd = (a: number, b: number): number => (!b ? a : gcd(b, a % b))

const solveLcm = (multiples: number[]) => {
  console.log(multiples)
  const numerator = multiples.reduce((tot, n) => tot * n, 1)
  const denominator = multiples.reduce(gcd)

  return numerator / denominator
}

describe('day 8.2', () => {
  describe('test 8.2', () => {
    const FILENAME = '8.2-test-data.txt'

    it('can solve test 8.2', () => {
      const network = parseFile(FILENAME)

      const steps = multiTraverse(network)

      expect(steps).toBe(6)
    })

    it('can find multiples for 8.2', () => {
      const network = parseFile(FILENAME)

      const multiples = getLowestMultiples(network)

      expect(multiples.length).toBe(2)
      expect(multiples).toEqual([2, 3])
    })

    it('can solve LCM [2, 3]', () => {
      const input = [2, 3]

      const result = solveLcm(input)

      expect(result).toBe(6)
    })

    it('can solve LCM [23, 7]', () => {
      const input = [23, 7]

      const result = solveLcm(input)

      expect(result).toBe(161)
    })
  })

  describe('question 8.2', () => {
    const FILENAME = '8-data.txt'

    // use Lowest Common Multiple approach says reddit
    it.skip('can solve question 8.2 naive', () => {
      const network = parseFile(FILENAME)

      const steps = multiTraverse(network)

      console.log({
        answer2: steps,
      })

      expect(steps).toBeGreaterThan(6)
    })

    it('can solve question 8.2 LCM', () => {
      const network = parseFile(FILENAME)

      // [ 11309, 12361, 13939, 16043, 18673, 19199 ] ?
      // { answer2: 4.261200501047576e+22 } ??
      const multiples = getLowestMultiples(network)

      const result = solveLcm(multiples)

      console.log({
        answer2: result,
      })

      expect(result).toBeGreaterThan(6)
    })
  })
})
