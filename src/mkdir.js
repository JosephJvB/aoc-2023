const { existsSync, mkdirSync, writeFileSync } = require('fs')
const { join } = require('path')

const lastArg = process.argv.pop()

const dayNumber = parseInt(lastArg ?? 'NaN time baby')
if (isNaN(dayNumber) || dayNumber > 25 || dayNumber < 1) {
  console.warn('invalid argument for dayNumber', {
    dayNumber,
  })
  process.exit(1)
}

const dirPath = join(__dirname, `day-${dayNumber}`)
if (existsSync(dirPath)) {
  process.exit(0)
}

console.log('mkdir', { dayNumber })

mkdirSync(dirPath)

const files = [
  { name: `${dayNumber}-data.txt`, contents: '' },
  { name: `${dayNumber}-test-data.txt`, contents: '' },
  {
    name: `${dayNumber}.test.ts`,
    contents: [
      "import { readFileSync } from 'fs'",
      "import { join } from 'path'",
      '',
      'const parseFile = (fileName: string) =>',
      "  readFileSync(join(__dirname, fileName), 'utf-8').split('\\n')",
      '',
      `describe('day ${dayNumber}.1', () => {`,
      `  describe('test ${dayNumber}.1', () => {`,
      `    const FILENAME = '${dayNumber}-test-data.txt'`,
      `  })`,
      `  describe('question ${dayNumber}.1', () => {`,
      `    const FILENAME = '${dayNumber}-data.txt'`,
      `  })`,
      `})`,
      '',
      `describe('day ${dayNumber}.2', () => {`,
      `  describe('test ${dayNumber}.2', () => {`,
      `    const FILENAME = '${dayNumber}-test-data.txt'`,
      `  })`,
      `  describe('question ${dayNumber}.2', () => {`,
      `    const FILENAME = '${dayNumber}-data.txt'`,
      `  })`,
      `})`,
    ].join('\n'),
  },
]

files.forEach((f) => {
  writeFileSync(join(dirPath, f.name), f.contents)
})
