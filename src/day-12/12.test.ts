import { readFileSync } from 'fs'
import { join } from 'path'

// dynamic programming? grazy stuff
// https://www.reddit.com/r/adventofcode/comments/18ge41g/comment/kd09kvj/

const parseFile = (fileName: string) =>
  readFileSync(join(__dirname, fileName), 'utf-8').split('\n')

type Char = '?' | '#' | '.'

it.skip('skips day 12', () => {})

describe('day 12.1', () => {
  describe('test 12.1', () => {
    const FILENAME = '12-test-data.txt'
  })
  describe('question 12.1', () => {
    const FILENAME = '12-data.txt'
  })
})

describe('day 12.2', () => {
  describe('test 12.2', () => {
    const FILENAME = '12-test-data.txt'
  })
  describe('question 12.2', () => {
    const FILENAME = '12-data.txt'
  })
})
