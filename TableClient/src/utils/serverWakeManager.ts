// const IDLE_TIME = 12 * 60 * 1000; // 12 minutes for PROD
const IDLE_TIME = 10 * 1000; // 10 seconds for DEV testing
const MAX_WAKE_COUNT = 4;

let wakeCount = 0;
let timer: ReturnType<typeof setTimeout> | null = null;

let enabled = false;
let exhausted = false;
let serverUrl = "";

let onWakeLimitReached: (() => void) | null = null;

const clearTimer = () => {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
};

const scheduleWakeUp = () => {
  clearTimer();

  if (!enabled || exhausted) return;

  timer = setTimeout(async () => {
    if (!enabled || exhausted) return;

    try {
      await fetch(serverUrl, {
        mode: "no-cors",
      });
    } catch (error) {
      console.error("Server wake-up request failed:", error);
    }

    wakeCount++;

    console.log(`Server wake-up ${wakeCount}/${MAX_WAKE_COUNT}`);

    if (wakeCount >= MAX_WAKE_COUNT) {
    exhausted = true;
    clearTimer();

    console.log("Server wake-up limit reached - logging out");

    onWakeLimitReached?.();

    return;
    }

    scheduleWakeUp();
  }, IDLE_TIME);
};


// Start after successful login
export const startServerWakeManager = (
  url: string,
  onLimitReached: () => void
) => {
  serverUrl = url;
  onWakeLimitReached = onLimitReached;

  enabled = true;
  exhausted = false;
  wakeCount = 0;

  console.log("Server wake manager started");

  scheduleWakeUp();
};


// Stop, for example after logout
export const stopServerWakeManager = () => {
  enabled = false;

  clearTimer();

  console.log("Server wake manager stopped");
};


// Call this whenever another function communicates with the server
export const registerServerActivity = () => {
  if (!enabled || exhausted) return;

  wakeCount = 0;

  console.log("Server activity detected - wake counter reset");

  scheduleWakeUp();
};
