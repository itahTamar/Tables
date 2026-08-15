const MIN_IDLE_MINUTES = 8; // DEV
const MAX_IDLE_MINUTES = 13; // DEV

const MAX_WAKE_COUNT = 4;

let wakeCount = 0;
let timer: ReturnType<typeof setTimeout> | null = null;

let enabled = false;
let exhausted = false;
let serverUrl = "";

let onWakeLimitReached: (() => void) | null = null;
let lastIdleMinutes: number | null = null;

const getNextIdleTime = () => {
  const numberOfOptions = MAX_IDLE_MINUTES - MIN_IDLE_MINUTES + 1;

  // If there is only one possible value
  if (numberOfOptions <= 1) {
    lastIdleMinutes = MIN_IDLE_MINUTES;
    return MIN_IDLE_MINUTES * 60 * 1000;
  }

  let randomMinutes: number;

  do {
    randomMinutes =
      Math.floor(Math.random() * numberOfOptions) + MIN_IDLE_MINUTES;
  } while (randomMinutes === lastIdleMinutes);

  lastIdleMinutes = randomMinutes;

  return randomMinutes * 60 * 1000;
};

const clearTimer = () => {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
};

const scheduleWakeUp = () => {
  clearTimer();

  if (!enabled || exhausted) return;

  const nextIdleTime = getNextIdleTime();

  console.log(
    `Next server wake-up in ${nextIdleTime / 60000} minutes`
  );

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
  }, nextIdleTime);
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
  wakeCount = 0;
  lastIdleMinutes = null;

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