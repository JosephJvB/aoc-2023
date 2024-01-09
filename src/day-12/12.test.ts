import { readFileSync } from 'fs'
import { join } from 'path'

const parseFile = (fileName: string) =>
  readFileSync(join(__dirname, fileName), 'utf-8').split('\n')

type Char = '?' | '#' | '.'

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
