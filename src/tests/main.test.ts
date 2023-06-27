import {expect, test, beforeEach, afterEach} from 'vitest'
import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import * as fs from 'fs/promises'

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
  // await fs.rm(FIXTURES_DIR, {recursive: true})
})

test('generates the requested translation files from the action input', async () => {
  process.env['INPUT_LANGUAGE-DIRECTORY'] = path.join(
    FIXTURES_DIR,
    'translations'
  )
  process.env['INPUT_SOURCE-LANGUAGE'] = 'en'
  process.env['INPUT_TARGET-LANGUAGES'] = 'de,fr'

  const np = process.execPath
  const ip = path.join(__dirname, '..', '..', 'dist', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }

  // cp.execFileSync(np, [ip], options)
  console.log(cp.execFileSync(np, [ip], options).toString())

  const de = await fs.readFile(
    path.join(FIXTURES_DIR, 'translations', 'de.json'),
    'utf8'
  )

  const fr = await fs.readFile(
    path.join(FIXTURES_DIR, 'translations', 'fr.json'),
    'utf8'
  )

  expect(JSON.parse(de)).toMatchInlineSnapshot(``)
  expect(JSON.parse(fr)).toMatchInlineSnapshot(``)
})
