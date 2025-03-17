/**
 * TypingMonitor.js
 *
 * This module monitors text input across the page and provides writing statistics.
 * It tracks total word count, session duration and writing pace, then displays these
 * statistics using the speech UI.
 * All code follows UK English conventions.
 */

import { showSpeechBubble } from "./speechUi.js";

// State management
let globalWordCount = 0;
let startTime = Date.now();
let isMonitoring = false;
let isPaused = false;
let breakTimer = null;

// Settings
let settings = {
  wordCountThreshold: 50,
  typingBreakDuration: 5,
  enableTypingAlerts: true,
  pauseMonitoring: false,
};

/**
 * Loads user settings from storage
 */
async function loadSettings() {
  try {
    const stored = await chrome.storage.sync.get({
      wordCountThreshold: 50,
      typingBreakDuration: 5,
      enableTypingAlerts: true,
      pauseMonitoring: false,
    });
    settings = stored;
    isPaused = settings.pauseMonitoring;
  } catch (error) {
    console.error("Error loading typing monitor settings:", error);
  }
}

/**
 * Counts the number of words in a given text.
 * @param {string} text - The text to count words from.
 * @returns {number} The number of words.
 */
function countWords(text) {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

/**
 * Handles input events on text fields and content‐editable elements.
 * @param {Event} event - The input event.
 */
function handleInput(event) {
  if (isPaused || !settings.enableTypingAlerts) return;

  const target = event.target;
  if (
    target.isContentEditable ||
    target.tagName === "TEXTAREA" ||
    (target.tagName === "INPUT" && target.type === "text")
  ) {
    const text = target.isContentEditable ? target.textContent : target.value;
    const newWords = countWords(text);

    if (newWords > globalWordCount) {
      globalWordCount = newWords;
      if (globalWordCount % settings.wordCountThreshold === 0) {
        showBreakNotification();
      }
    }
  }
}

/**
 * Shows break notification with timer option
 */
function showBreakNotification() {
  const message = `
    <div>
      <h3>You're doing great! 🌟</h3>
      <p>You've written ${globalWordCount} words! Take a ${settings.typingBreakDuration} minute break to:</p>
      <ul style="margin-left: 20px;">
        <li>Stand up and stretch</li>
        <li>Rest your eyes</li>
        <li>Get some water</li>
        <li>Save your work!</li>
      </ul>
      <div style="margin-top: 10px; text-align: center;">
        <button class="start-break-button"
                style="background: #007bff; color: white; border: none;
                       padding: 8px 16px; border-radius: 4px; cursor: pointer;
                       font-weight: bold; transition: background-color 0.2s;">
          Start Break Timer
        </button>
      </div>
    </div>
  `;

  // Show the speech bubble notification
  showSpeechBubble(message, null);

  // Play the amazing work sound
  playNotificationSound("amazingwork.mp3");

  // Add break timer functionality
  const bubbleWrapper = document.getElementById("speech-bubble-wrapper");
  if (bubbleWrapper && bubbleWrapper.shadowRoot) {
    const startBreakButton = bubbleWrapper.shadowRoot.querySelector(
      ".start-break-button"
    );
    if (startBreakButton) {
      startBreakButton.addEventListener("click", startBreakTimer);
    }
  }
}

/**
 * Plays a notification sound file
 * @param {string} soundFile - The name of the sound file in assets folder
 */
function playNotificationSound(soundFile) {
  const audio = new Audio(chrome.runtime.getURL(`assets/sounds/${soundFile}`));
  audio.volume = 0.7; // Set a reasonable volume
  audio
    .play()
    .catch((err) => console.error("Failed to play notification sound:", err));
}

/**
 * Starts the break timer
 */
function startBreakTimer() {
  // Play time for a brake sound
  playNotificationSound("Okay_time_for_a_break.mp3");

  isPaused = true;
  const duration = settings.typingBreakDuration * 60; // Convert to seconds
  let timeLeft = duration;

  // Clear any existing timer
  if (breakTimer) {
    clearInterval(breakTimer);
    breakTimer = null;
  }

  const updateBreakDisplay = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const breakHTML = `
      <div>
        <h3>Break Time! 🎯</h3>
        <p>Time remaining: ${minutes}:${seconds.toString().padStart(2, "0")}</p>
        <div style="margin-top: 10px; display: flex; justify-content: center; gap: 10px;">
          <button class="skip-break-button" style="
            background: #dc3545;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.2s;">
            Skip Break
          </button>
        </div>
      </div>
    `;

    showSpeechBubble(breakHTML, null);

    // Add skip break functionality
    const bubbleWrapper = document.getElementById("speech-bubble-wrapper");
    if (bubbleWrapper && bubbleWrapper.shadowRoot) {
      const skipButton =
        bubbleWrapper.shadowRoot.querySelector(".skip-break-button");
      if (skipButton) {
        // Remove any existing listeners
        skipButton.replaceWith(skipButton.cloneNode(true));
        // Get the new button reference
        const newSkipButton =
          bubbleWrapper.shadowRoot.querySelector(".skip-break-button");
        // Add the event listener
        newSkipButton.addEventListener("click", () => {
          console.log("Skip button clicked"); // Debug log
          if (breakTimer) {
            clearInterval(breakTimer);
            breakTimer = null;
          }
          isPaused = false;
          showSpeechBubble("Break skipped! Back to writing! 📝", 3000);
          // Could add another sound here for skipping but will keep the back to work sound
          playNotificationSound("Okay_back_to_work.mp3");
        });
      }
    }
  };

  // Initial display
  updateBreakDisplay();

  // Start the timer
  breakTimer = setInterval(() => {
    timeLeft--;

    if (timeLeft <= 0) {
      clearInterval(breakTimer);
      breakTimer = null;
      isPaused = false;
      showSpeechBubble("Break's over! Ready to write again! 🚀", 5000);
      // Play a sound when break is over
      playNotificationSound("Okay_back_to_work.mp3");
      return;
    }

    updateBreakDisplay();
  }, 1000);
}

/**
 * Returns a motivational message based on the current word count.
 * @param {number} wordCount - The current word count.
 * @returns {string} A motivational message.
 */
function getMotivationalMessage(wordCount) {
  const nextBreak =
    Math.ceil(wordCount / settings.wordCountThreshold) *
    settings.wordCountThreshold;
  const wordsToBreak = nextBreak - wordCount;

  if (wordCount === 0) {
    return "Ready to start writing? Moo-ve those fingers! 🐄";
  } else if (wordsToBreak <= 10) {
    return "Almost time for a break! Just a few more words! 🌟";
  } else if (wordCount < 100) {
    return `${wordsToBreak} words until your next break! Keep moo-ving! 🎉`;
  } else {
    return `Incredible progress! ${wordsToBreak} words until the next break! 🚀`;
  }
}

/**
 * Displays writing statistics in the speech bubble.
 */
export function showWritingStats() {
  const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;
  const wordsPerMinute =
    minutes > 0 ? Math.round(globalWordCount / minutes) : 0;
  const nextBreakAt =
    Math.ceil(globalWordCount / settings.wordCountThreshold) *
    settings.wordCountThreshold;

  const statsHTML = `
    <div>
      <h3 style="margin: 0 0 10px 0;">Writing Progress</h3>
      <div style="padding: 12px; border-radius: 6px; margin-bottom: 10px;">
        <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
          <span>Words Written:</span>
          <span style="font-weight: bold;">${globalWordCount}</span>
        </div>
        <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
          <span>Session Time:</span>
          <span style="font-weight: bold;">${minutes}m ${seconds}s</span>
        </div>
        <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
          <span>Next Break At:</span>
          <span style="font-weight: bold;">${nextBreakAt} words</span>
        </div>
        ${
          wordsPerMinute > 0
            ? `
          <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
            <span>Writing Pace:</span>
            <span style="font-weight: bold;">${wordsPerMinute} words/min</span>
          </div>
        `
            : ""
        }
        <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
          <span>Monitoring Status:</span>
          <span style="font-weight: bold;">${
            isPaused ? "Paused" : "Active"
          }</span>
        </div>
      </div>
      <div style="text-align: center;">
        ${getMotivationalMessage(globalWordCount)}
      </div>
      ${
        isPaused
          ? `
        <div style="text-align: center; margin-top: 10px;">
          <button class="resume-monitoring-button"
                  style="background: #28a745; color: white; border: none; 
                         padding: 8px 16px; border-radius: 4px; cursor: pointer;
                         font-weight: bold;">
            Resume Monitoring
          </button>
        </div>
      `
          : ""
      }
    </div>
  `;

  showSpeechBubble(statsHTML, null);

  // Add resume functionality if paused
  if (isPaused) {
    const bubbleWrapper = document.getElementById("speech-bubble-wrapper");
    if (bubbleWrapper && bubbleWrapper.shadowRoot) {
      const resumeButton = bubbleWrapper.shadowRoot.querySelector(
        ".resume-monitoring-button"
      );
      if (resumeButton) {
        resumeButton.addEventListener("click", () => {
          isPaused = false;
          settings.pauseMonitoring = false;
          chrome.storage.sync.set({ pauseMonitoring: false });
          showSpeechBubble("Monitoring resumed! Keep writing! 📝", 3000);
        });
      }
    }
  }
}

/**
 * Initialises the typing monitor
 */
export function initialiseTypingMonitor() {
  if (isMonitoring) return;

  loadSettings().then(() => {
    isMonitoring = true;
    document.addEventListener("input", handleInput, true);

    // Observe new elements added to the DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (
                node.isContentEditable ||
                node.tagName === "TEXTAREA" ||
                (node.tagName === "INPUT" && node.type === "text")
              ) {
                node.addEventListener("input", handleInput, true);
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

// Listen for setting changes
chrome.storage.onChanged.addListener((changes) => {
  Object.keys(changes).forEach((key) => {
    if (key in settings) {
      settings[key] = changes[key].newValue;
      if (key === "pauseMonitoring") {
        isPaused = changes[key].newValue;
      }
    }
  });
});
