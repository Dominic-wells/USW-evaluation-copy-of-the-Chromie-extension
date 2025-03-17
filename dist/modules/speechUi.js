/**
 * speechUi.js
 * Handles the speech bubble UI with Shadow DOM support and style isolation.
 * * All code follows UK English conventions.
 */

import { temporarilyShowCow } from "./pet.js";

let bubbleWrapper = null;
let speechBubble = null;

/**
 * Initialises the speech bubble if it doesn't exist
 */
function initialiseSpeechBubble() {
  if (bubbleWrapper) return;

  // Create wrapper and shadow root
  bubbleWrapper = document.createElement("div");
  bubbleWrapper.id = "speech-bubble-wrapper";
  const shadow = bubbleWrapper.attachShadow({ mode: "open" });

  // Create separate style elements for base and dynamic styles
  const baseStyle = document.createElement("style");
  const dynamicStyle = document.createElement("style");
  dynamicStyle.id = "dynamic-styles";

  // Base styles that never change
  baseStyle.textContent = `
    :host {
      display: block;
    }

    #speech-bubble {
      all: initial;
      display: block;
      position: fixed;
      border-radius: 10px;
      padding: 15px;
      max-width: 500px;
      overflow-y: visible;
      box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
      z-index: 10001;
      transition: all 0.2s ease;
      box-sizing: border-box;
      background-color: #ffffff;
    }

    #speech-bubble * {
      all: initial;
      display: revert;
    }

    #speech-bubble p {
      display: block !important;
      margin: 0.5em 0 !important;
    }

    #speech-bubble h3 {
      display: block !important;
      margin: 0.5em 0 !important;
      font-weight: bold !important;
    }

    #speech-bubble div {
      display: block !important;
    }

    #speech-bubble::before {
      all: initial;
      content: '';
      display: block;
      position: absolute;
      width: 0;
      height: 0;
      left: -20px;
      top: 20px;
      border: 10px solid transparent;
      border-right-color: #ffffff;
    }

    #speech-bubble.left::before {
      left: auto;
      right: -20px;
      border-right-color: transparent;
      border-left-color: #ffffff;
    }

    .close-button {
      all: initial;
      display: flex !important;
      position: absolute !important;
      right: 5px !important;
      top: 5px !important;
      background: none !important;
      border: none !important;
      font-size: 20px !important;
      cursor: pointer !important;
      padding: 0 !important;
      width: 24px !important;
      height: 24px !important;
      align-items: center !important;
      justify-content: center !important;
      border-radius: 50% !important;
      transition: background-color 0.2s !important;
    }

    .close-button:hover {
      background-color: rgba(0, 0, 0, 0.1) !important;
    }
  `;

  // Initial dynamic styles
  dynamicStyle.textContent = `
    #speech-bubble {
      font-family: Arial, sans-serif !important;
      font-size: 14px !important;
      line-height: 1.5 !important;
      color: #333333 !important;
    }

    #speech-bubble * {
      font-family: Arial, sans-serif !important;
      font-size: 14px !important;
      line-height: 1.5 !important;
      color: #333333 !important;
    }

    #speech-bubble h3 {
      font-size: 16.8px !important;
    }

    .close-button {
      color: #666666 !important;
    }
  `;

  // Create speech bubble
  speechBubble = document.createElement("div");
  speechBubble.id = "speech-bubble";
  speechBubble.setAttribute("role", "dialog");
  speechBubble.setAttribute("aria-live", "polite");

  // Append elements to shadow root
  shadow.appendChild(baseStyle);
  shadow.appendChild(dynamicStyle);
  shadow.appendChild(speechBubble);
  document.body.appendChild(bubbleWrapper);
}

/**
 * Updates bubble position based on pet element position
 */
function updateBubblePosition() {
  if (!speechBubble) return;

  // Get pet position
  const petWrapper = document.querySelector("#spacecow-wrapper");
  let position = { x: 100, y: 100 }; // Default fallback position

  if (petWrapper && petWrapper.shadowRoot) {
    const petElement = petWrapper.shadowRoot.querySelector("#spacecow-pet");

    if (petElement) {
      // Get current position from style if element is hidden
      if (petElement.style.display === "none") {
        const left = parseInt(petElement.style.left) || 100;
        const top = parseInt(petElement.style.top) || 100;
        position = { x: left, y: top };
      } else {
        // Get position from bounding rect if element is visible
        const rect = petElement.getBoundingClientRect();
        position = { x: rect.left, y: rect.top };
      }
    }
  }

  // Position bubble
  const bubbleRect = speechBubble.getBoundingClientRect();
  let left = position.x + 110; // Position to right of pet
  let isLeftSide = false;

  // Check if bubble would go off screen
  if (left + bubbleRect.width > window.innerWidth) {
    left = position.x - bubbleRect.width - 20; // Position to left of pet
    isLeftSide = true;
  }

  // Update position
  speechBubble.style.left = `${left}px`;
  speechBubble.style.top = `${position.y}px`;
  speechBubble.classList.toggle("left", isLeftSide);

  // Ensure bubble stays in viewport vertically
  const topOffset = Math.max(
    0,
    Math.min(window.innerHeight - bubbleRect.height, position.y)
  );
  speechBubble.style.top = `${topOffset}px`;
}

/**
 * Calculate appropriate duration for speech bubble based on content length and complexity
 * @param {string|HTMLElement} message - The message to display
 * @returns {number} - Duration in milliseconds
 */
function calculateMessageDuration(message) {
  // Base duration: 3 seconds minimum
  let duration = 3000;

  // If it's HTML content with multiple elements, give more time
  if (typeof message === "string") {
    if (message.includes("<div") || message.includes("<h3")) {
      // For complex HTML, start with longer base duration
      duration = 5000;

      // Count approximate number of words
      const textContent = message.replace(/<[^>]*>?/gm, " ");
      const wordCount = textContent
        .split(/\s+/)
        .filter((w) => w.length > 0).length;

      // Add 200ms per word for reading time
      duration += wordCount * 200;
    } else {
      // Simple text - count words and calculate reading time
      const wordCount = message.split(/\s+/).filter((w) => w.length > 0).length;
      duration += wordCount * 250; // 250ms per word
    }
  }

  // Cap duration at reasonable maximum (prevents extremely long messages from staying too long)
  return Math.min(duration, 15000);
}

export function showSpeechBubble(message, duration = null) {
  initialiseSpeechBubble();

  // Clear any existing hide timer
  if (speechBubble.hideTimer) {
    clearTimeout(speechBubble.hideTimer);
    speechBubble.hideTimer = null;
  }

  // If duration is null, calculate based on content
  // If explicitly passed null, it means stay until manually closed
  const calculatedDuration =
    duration === null ? calculateMessageDuration(message) : duration;

  // Check chrome storage for cow hidden state and show if needed
  chrome.storage.sync.get({ isCowHidden: false }, (settings) => {
    if (settings.isCowHidden) {
      // Always show cow slightly longer than the bubble
      temporarilyShowCow(
        calculatedDuration !== null ? calculatedDuration + 1000 : 8000
      );
    }
  });

  const formattedMessage =
    typeof message === "string" && !message.includes("<div")
      ? `<div style="padding-right: 20px; margin: 0 !important;">${message}</div>`
      : message;

  speechBubble.innerHTML = formattedMessage;

  const closeButton = document.createElement("button");
  closeButton.className = "close-button";
  closeButton.innerHTML = "×";
  closeButton.setAttribute("aria-label", "Close message");
  closeButton.onclick = () => hideSpeechBubble();

  speechBubble.insertBefore(closeButton, speechBubble.firstChild);
  speechBubble.style.display = "block";

  // Position the bubble
  updateBubblePosition();

  // Set up hide timer if duration is provided and not explicitly null
  if (calculatedDuration !== null) {
    speechBubble.hideTimer = setTimeout(
      () => hideSpeechBubble(),
      calculatedDuration
    );

    // For debugging
    console.log(`Speech bubble will auto-hide after ${calculatedDuration}ms`, {
      original: duration,
      calculated: calculatedDuration,
      message: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
    });
  }
}

export function hideSpeechBubble() {
  if (speechBubble) {
    // Clear any existing hide timer
    if (speechBubble.hideTimer) {
      clearTimeout(speechBubble.hideTimer);
      speechBubble.hideTimer = null;
    }

    speechBubble.style.display = "none";
  }
}

export function updateSpeechBubbleStyles(settings) {
  if (!speechBubble || !bubbleWrapper) return;

  const shadow = bubbleWrapper.shadowRoot;
  const dynamicStyle = shadow.getElementById("dynamic-styles");

  if (dynamicStyle) {
    const h3FontSize = Math.min(settings.fontSize * 1.2, 24);

    if (settings.highContrast) {
      dynamicStyle.textContent = `
        #speech-bubble {
          background-color: black !important;
          border: 2px solid white !important;
        }

        #speech-bubble,
        #speech-bubble *:not(.close-button) {
          color: white !important;
          font-family: ${settings.fontFamily} !important;
          font-size: ${settings.fontSize}px !important;
          line-height: ${settings.lineSpacing} !important;
        }

        #speech-bubble h3 {
          font-size: ${h3FontSize}px !important;
          color: white !important;
        }

        #speech-bubble::before {
          border-right-color: black !important;
        }

        #speech-bubble.left::before {
          border-right-color: transparent !important;
          border-left-color: black !important;
        }

        .close-button {
          color: white !important;
        }

        .close-button:hover {
          background-color: white !important;
          color: black !important;
        }
      `;
    } else {
      dynamicStyle.textContent = `
        #speech-bubble {
          background-color: ${settings.backgroundColour};
          border: none;
        }

        #speech-bubble,
        #speech-bubble *:not(.close-button) {
          color: ${settings.textColour} !important;
          font-family: ${settings.fontFamily} !important;
          font-size: ${settings.fontSize}px !important;
          line-height: ${settings.lineSpacing} !important;
        }

        #speech-bubble h3 {
          font-size: ${h3FontSize}px !important;
        }

        #speech-bubble::before {
          border-right-color: ${settings.backgroundColour};
        }

        #speech-bubble.left::before {
          border-right-color: transparent;
          border-left-color: ${settings.backgroundColour};
        }

        .close-button {
          color: #666666 !important;
        }

        .close-button:hover {
          background-color: rgba(0, 0, 0, 0.1) !important;
          color: #333333 !important;
        }
      `;
    }
  }
}

export function getSpeechBubble() {
  return speechBubble;
}

export function getSpeechBubbleWrapper() {
  return bubbleWrapper;
}

export { initialiseSpeechBubble };
