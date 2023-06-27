import * as core from '@actions/core'
import * as glob from '@actions/glob'
import * as http from '@actions/http-client'
import * as path from 'path'
import * as fs from 'fs/promises'

type Transform<T> = (value: T) => T

function isFreeAccountAuthKey(authKey: string): boolean {
  return authKey.endsWith(':fx')
}

async function transform<T>(obj: T, transformer: Transform<any>): Promise<T> {
  if (typeof obj !== 'object' || obj === null) {
    return transformer(obj)
  }

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
  const languageDirectory = core.getInput('language_directory')
  const targetLanguages = core.getInput('target_languages')
  const sourceLanguage = core.getInput('source_language')
  const authKey = core.getInput('auth_key')

  const httpClient = new http.HttpClient()
  httpClient.requestOptions = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `DeepL-Auth-Key ${authKey}`
    }
  }

  const baseUrl = isFreeAccountAuthKey(authKey)
    ? 'https://api-free.deepl.com'
    : 'https://api.deepl.com'

  const apiUrl = `${baseUrl}/v2/translate`

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

    for await (const langs of targetLanguages.split(',')) {
      const lang = langs.trim()
      const targetLanguageFile = path.join(languageDirectory, `${lang}.json`)

      if (lang === sourceLanguage) {
        continue
      }

      // TODO: translate the entire file in one request

      const result = await transform(parsed, async value => {
        if (typeof value === 'string') {
          core.debug(apiUrl)
          core.debug(apiUrl)
          const requestData = {
            text: Array.isArray(value) ? value : [value],
            target_lang: lang,
            source_lang: sourceLanguage
          }

          const res = await httpClient.postJson<any>(apiUrl, requestData)

          if (!res.result.translations) {
            throw new Error(
              `Error translating ${value} to ${lang}: ${res.result.message}`
            )
          }
          return res.result.translations[0].text
        }
      })

      await fs.writeFile(targetLanguageFile, JSON.stringify(result, null, 2))
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
