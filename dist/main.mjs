// src/main.ts
import * as core from "@actions/core";

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
