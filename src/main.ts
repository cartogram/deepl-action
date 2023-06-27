import * as core from '@actions/core'
import * as glob from '@actions/glob'
import * as path from 'path'
import * as fs from 'fs/promises'
import {DeepL} from '@cartogram/deepl'

type Transform<T> = (value: T) => T

async function transform<T>(
  obj: T,
  transformer: Transform<unknown>
): Promise<T> {
  const transformedObj: any = {}
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      transformedObj[key] = await transform(value, transformer)
    }
  }

  return transformedObj
}

async function run(): Promise<void> {
  const languageDirectory = core.getInput('language-directory')
  const targetLanguages = core.getInput('target-languages')
  const sourceLanguage = core.getInput('source-language')
  const authKey = core.getInput('auth-key')

  const translator = new DeepL({authKey})

  let baseLanguageFile: string | undefined

  const globber = await glob.create(`${languageDirectory}/**/*.json`)

  try {
    for await (const file of globber.globGenerator()) {
      const lang = path.basename(file, '.json')

      if (lang === sourceLanguage) {
        baseLanguageFile = file
      }
    }

    if (!baseLanguageFile) {
      throw new Error(
        `No base language file found for source language ${sourceLanguage}.`
      )
    }

    core.debug(`Base languages file: ${baseLanguageFile}`)
    core.debug(`Target languages: ${targetLanguages}`)

    core.debug('Parsing base language file...')

    const contents = await fs.readFile(baseLanguageFile, 'utf8')
    const parsed = JSON.parse(contents)

    for await (const [key, value] of Object.entries(parsed)) {
      core.debug(`Key: ${key}`)
      core.debug(`Value: ${value}`)
    }

    for await (const langs of targetLanguages.split(',')) {
      const lang = langs.trim()
      const targetLanguageFile = path.join(languageDirectory, `${lang}.json`)

      if (lang === sourceLanguage) {
        continue
      }

      // TODO: translate the entire file in one request
      const result = await transform(parsed, async value => {
        if (typeof value === 'string') {
          const translated = await translator.translate(value, lang, {
            sourceLang: sourceLanguage
          })

          if (!translated.translations) {
            throw new Error(
              `Error translating ${value} to ${lang}: ${translated.message}`
            )
          }
          return translated.translations[0].text
        }
      })

      await fs.writeFile(targetLanguageFile, JSON.stringify(result, null, 2))
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
