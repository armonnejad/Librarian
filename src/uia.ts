import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const WINAPP = "winapp";

/**
 * Runs a WinApp CLI command and returns its standard output.
 */
export async function runWinApp(args: string[]): Promise<string> {
  const { stdout } = await execFileAsync(WINAPP, args, {
    windowsHide: true,
    timeout: 30_000,
    maxBuffer: 10 * 1024 * 1024, //if output is greater than 10 MB, function will throw an error
  });

  return stdout;
}

/**
 * Inspects a specific window using its HWND.
 */
export async function inspectWindow(
  hwnd: number,
  depth = 5,
): Promise<string> {
  return runWinApp([
    "ui",
    "inspect",
    "-w",
    String(hwnd),
    "--depth",
    String(depth),
  ]);
}