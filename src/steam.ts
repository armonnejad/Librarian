import { execFile } from "node:child_process";
import { runWinApp } from "./uia.js";
import { promisify } from "node:util";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const execFileAsync = promisify(execFile);

const WINAPP = "winapp";

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Launches steam.
 */
export async function launchSteam(): Promise<void> {
  // Request that Steam open its library.
  await execFileAsync("cmd.exe", [
    "/c",
    "start",
    "",
    "steam://open/library",
    "-silent",
  ]);

  // Wait up to 30 seconds for Steam's main process.
  for (let attempt = 0; attempt < 30; attempt++) {
    const { stdout } = await execFileAsync("tasklist", [
      "/FI",
      "IMAGENAME eq steam.exe",
      "/FO",
      "CSV",
      "/NH",
    ]);

    if (stdout.toLowerCase().includes('"steam.exe"')) {
      console.log("Steam is running.");
      return;
    }

    await delay(1000);
  }

  throw new Error("Steam did not start within 30 seconds.");
}

/**
 * Inspects Steam's UI, retrying until elements are found
 * or 30 seconds have elapsed.
 */
export async function inspectSteam(): Promise<string> {
  const timeoutMs = 30_000;
  const retryIntervalMs = 5_000;
  const startTime = Date.now();
  let lastError: unknown;

  while (Date.now() - startTime < timeoutMs) {
    try {
      const result = await runWinApp([
        "ui",
        "inspect",
        "-a",
        "steamwebhelper",
        "--depth",
        "8",
      ]);

      if (result.trim().length > 0) {
        console.log("Steam UI elements found.");
        return result;
      }

      console.log("No Steam UI elements found. Retrying in 5 seconds...");
    } catch (error: unknown) {
      lastError = error;
      console.log("Steam UI inspection failed. Retrying in 5 seconds...");
    }

    const remainingMs = timeoutMs - (Date.now() - startTime);

    if (remainingMs <= 0) {
      break;
    }

    await delay(Math.min(retryIntervalMs, remainingMs));
  }

  throw new Error(
    "Steam UI inspection timed out after 30 seconds.",
    { cause: lastError }
  );
}

export async function closeSteam(): Promise<void> {
  const rl = readline.createInterface({ input, output });

  try {
    const answer = await rl.question(
      "Do you want to close Steam? (Y/N): "
    );

    if (answer.trim().toLowerCase() !== "y") {
      console.log("Keeping Steam open.");
      return;
    }

    console.log("Closing Steam...");

    execFile("taskkill", ["/F", "/T", "/IM", "steam.exe"], (error) => {
    if (error) {
      console.error("Failed to close Steam:", error);
      return;
    }

    console.log("Steam closed.");
    });

  } finally {
    rl.close();
  }
}