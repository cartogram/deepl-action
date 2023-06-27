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

// src/wait.ts
async function wait(milliseconds) {
  return new Promise((resolve) => {
    if (isNaN(milliseconds)) {
      throw new Error("milliseconds not a number");
    }
    setTimeout(() => resolve("done!"), milliseconds);
  });
}

// src/main.ts
async function run() {
  try {
    const ms = core.getInput("milliseconds");
    core.debug(`Waiting ${ms} milliseconds ...`);
    core.debug((/* @__PURE__ */ new Date()).toTimeString());
    await wait(parseInt(ms, 10));
    core.debug((/* @__PURE__ */ new Date()).toTimeString());
    core.setOutput("time", (/* @__PURE__ */ new Date()).toTimeString());
  } catch (error) {
    if (error instanceof Error)
      core.setFailed(error.message);
  }
}
run();
