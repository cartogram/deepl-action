import * as core from '@actions/core'
import * as glob from '@actions/glob'
import * as path from 'path'
import * as fs from 'fs/promises'

async function run(): Promise<void> {
  const languageDirectory = core.getInput('language-directory')
  const targetLanguages = core.getInput('target-languages')
  const sourceLanguage = core.getInput('source-language')
  const authKey = core.getInput('auth-key')

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

      const result = await transform(parsed, uppercaseTransform(lang))

      await fs.writeFile(targetLanguageFile, JSON.stringify(result, null, 2))
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }

  try {
    const ms: string = core.getInput('lagnuageDirectory')
    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    core.debug(new Date().toTimeString())
    core.debug(new Date().toTimeString())

    core.setOutput('time', new Date().toTimeString())

    core.error('This is a bad error, action may still succeed though.')

    core.warning(
      "Something went wrong, but it's not bad enough to fail the build."
    )
    core.notice('Something happened that you might want to know about.')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()

type Transform<T> = (value: T) => T

async function transform<T>(obj: T, transformer: Transform<any>): Promise<T> {
  if (typeof obj !== 'object' || obj === null) {
    return transformer(obj)
  }

  // Recursively transform each value in the object
  const transformedObj: any = {}
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      transformedObj[key] = await transform(value, transformer)
    }
  }

  return transformedObj
}

function uppercaseTransform(lang: string) {
  return async (value: string) => {
    if (typeof value === 'string') {
      // TODO: Translate value using DeepL API
      return value.toUpperCase()
    }
    return value
  }
}
