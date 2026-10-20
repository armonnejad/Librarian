import { launchSteam } from "./steam.js";

async function main(): Promise<void> {
  console.log("Launching Steam...");

  launchSteam();

  console.log("Launch command submitted.");
}

main().catch((error: unknown) => {
  console.error("Application failed:", error);
  process.exitCode = 1;
});
