import * as steam from "./steam.js";
import * as uia from "./uia.js";

async function main(): Promise<void> {
  await steam.launchSteam();
  const result = await steam.inspectSteam();
  console.log(result);
  steam.closeSteam();
}

main().catch((error: unknown) => {
  console.error("Application failed:", error);
  process.exitCode = 1;
});
