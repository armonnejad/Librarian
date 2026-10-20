import { execFile } from "node:child_process";

export function launchSteam(): void {
  console.log("Sending Steam launch command...");

  execFile(
    "cmd.exe",
    ["/c", "start", "", "steam://open/library"],
    (error) => {
      if (error) {
        console.error("Failed to launch Steam:", error);
        return;
      }

      console.log("Steam launch command completed.");
    },
  );
}