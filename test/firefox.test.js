import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { delimiter, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const sourceDir = join(projectRoot, "src");

function findOnPath(binary) {
  const extensions = process.platform === "win32" ? [".exe", ".cmd", ""] : [""];
  for (const directory of (process.env.PATH ?? "").split(delimiter)) {
    if (!directory) {
      continue;
    }
    for (const extension of extensions) {
      const candidate = join(directory, `${binary}${extension}`);
      if (existsSync(candidate)) {
        return candidate;
      }
    }
  }
  return null;
}

function findFirefox() {
  if (process.env.FIREFOX_BINARY) {
    return process.env.FIREFOX_BINARY;
  }
  return findOnPath("firefox") ?? findOnPath("firefox-esr");
}

function findWebExt() {
  if (process.env.WEB_EXT_BINARY) {
    return process.env.WEB_EXT_BINARY;
  }
  const local = join(projectRoot, "node_modules", ".bin", "web-ext");
  if (existsSync(local)) {
    return local;
  }
  return findOnPath("web-ext");
}

test("installs the extension into headless Firefox", { timeout: 120_000 }, async (t) => {
  const firefox = findFirefox();
  if (!firefox) {
    t.skip("Firefox was not found; set FIREFOX_BINARY to run this test");
    return;
  }

  const webExt = findWebExt();
  if (!webExt) {
    t.skip("web-ext was not found; run `npm install` or `make lint` first");
    return;
  }

  const child = spawn(
    webExt,
    [
      "run",
      "--source-dir", sourceDir,
      "--firefox", firefox,
      "--no-reload",
      "--no-input",
      "--args=-headless",
    ],
    {
      env: { ...process.env, MOZ_HEADLESS: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  let output = "";

  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) {
      const exited = new Promise((resolve) => child.once("exit", resolve));
      child.kill("SIGKILL");
      await exited;
    }
  });

  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timed out waiting for the extension to install.\n${output}`));
    }, 90_000);

    const onData = (chunk) => {
      output += chunk.toString();
      if (output.includes("as a temporary add-on")) {
        clearTimeout(timer);
        resolve();
      }
    };

    child.stdout.on("data", onData);
    child.stderr.on("data", onData);
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`web-ext exited before installing the extension (code ${code}).\n${output}`));
    });
  });

  assert.match(output, /as a temporary add-on/);
});
