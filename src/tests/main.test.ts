import {expect, test, beforeEach, afterEach} from 'vitest'
import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import * as fs from 'fs/promises'

import {wait} from '../wait'

const FIXTURES_DIR = path.join(__dirname, 'fixtures')

beforeEach(async () => {
  await fs.mkdir(path.join(FIXTURES_DIR, 'translations'), {
    recursive: true
  })
  await fs.writeFile(
    path.join(FIXTURES_DIR, 'translations', 'en.json'),
    JSON.stringify(
      {
        write: {
          headline: 'Perfect your writing with DeepL Write',
          body: 'DeepL Write is a tool that helps you improve your writing. It analyzes your text and provides suggestions for improvement. It also provides a dictionary and a thesaurus to help you find the right words.',
          button: 'Try DeepL Write'
        },
        apps: {
          headline: 'Translate even faster with DeepL apps',
          mac: {
            headline: 'DeepL for Mac',
            body: 'Download for free'
          },
          mobile: {
            headline: "DeepL for <a href=''>iOS</a> <a href=''>Android</a>",
            body: 'Download for free'
          }
        }
      },
      null,
      2
    )
  )
})

afterEach(async () => {
  await fs.rmdir(FIXTURES_DIR, {recursive: true})
})

test('generates the requested translation files from the action input', async () => {
  const input = parseInt('foo', 10)
  await expect(wait(input)).rejects.toThrow('milliseconds not a number')
})

// test('wait 500 ms', async () => {
//   const start = new Date()
//   await wait(500)
//   const end = new Date()
//   var delta = Math.abs(end.getTime() - start.getTime())
//   expect(delta).toBeGreaterThan(450)
// })

// // shows how the runner will run a javascript action with env / stdout protocol
// test('test runs', () => {
//   process.env['INPUT_MILLISECONDS'] = '500'
//   const np = process.execPath
//   const ip = path.join(__dirname, '..', '..', 'dist', 'main.js')
//   const options: cp.ExecFileSyncOptions = {
//     env: process.env
//   }
//   console.log(cp.execFileSync(np, [ip], options).toString())
// })
