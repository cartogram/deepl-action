"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/main.ts
var core = __toESM(require("@actions/core"));
var glob = __toESM(require("@actions/glob"));
var http = __toESM(require("@actions/http-client"));
var path = __toESM(require("path"));
var fs = __toESM(require("fs/promises"));
function isFreeAccountAuthKey(authKey) {
  return authKey.endsWith(":fx");
}
async function transform(obj, transformer) {
  if (typeof obj !== "object" || obj === null) {
    return transformer(obj);
  }
  const transformedObj = {};
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      transformedObj[key] = await transform(value, transformer);
    }
  }
  return transformedObj;
}
async function run() {
  const languageDirectory = core.getInput("language_directory");
  const targetLanguages = core.getInput("target_languages");
  const sourceLanguage = core.getInput("source_language");
  const authKey = core.getInput("auth_key");
  const httpClient = new http.HttpClient();
  httpClient.requestOptions = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `DeepL-Auth-Key ${authKey}`
    }
  };
  const baseUrl = isFreeAccountAuthKey(authKey) ? "https://api-free.deepl.com" : "https://api.deepl.com";
  const apiUrl = `${baseUrl}/v2/translate`;
  let baseLanguageFile;
  const globber = await glob.create(`${languageDirectory}/**/*.json`);
  try {
    for await (const file of globber.globGenerator()) {
      const lang = path.basename(file, ".json");
      if (lang === sourceLanguage) {
        baseLanguageFile = file;
      }
    }
    if (!baseLanguageFile) {
      throw new Error(
        `No base language file found for source language ${sourceLanguage}.`
      );
    }
    core.debug(`Base languages file: ${baseLanguageFile}`);
    core.debug(`Target languages: ${targetLanguages}`);
    core.debug("Parsing base language file...");
    const contents = await fs.readFile(baseLanguageFile, "utf8");
    const parsed = JSON.parse(contents);
    for await (const langs of targetLanguages.split(",")) {
      const lang = langs.trim();
      const targetLanguageFile = path.join(languageDirectory, `${lang}.json`);
      if (lang === sourceLanguage) {
        continue;
      }
      const result = await transform(parsed, async (value) => {
        if (typeof value === "string") {
          core.debug(apiUrl);
          core.debug(apiUrl);
          const requestData = {
            text: Array.isArray(value) ? value : [value],
            target_lang: lang,
            source_lang: sourceLanguage
          };
          const res = await httpClient.postJson(apiUrl, requestData);
          if (!res.result.translations) {
            throw new Error(
              `Error translating ${value} to ${lang}: ${res.result.message}`
            );
          }
          return res.result.translations[0].text;
        }
      });
      await fs.writeFile(targetLanguageFile, JSON.stringify(result, null, 2));
    }
  } catch (error) {
    if (error instanceof Error)
      core.setFailed(error.message);
  }
}
run();
