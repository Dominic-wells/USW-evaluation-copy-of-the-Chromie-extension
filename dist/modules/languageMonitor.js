/**
 * languageMonitor.js
 * Monitors text input for potentially harmful language and provides
 * friendly suggestions for kinder communication
 * All code follows UK English conventions.*
 */

import { showSpeechBubble } from "./speechUi.js";
import { getPet, temporarilyShowCow } from "./pet.js";

class LanguageMonitor {
  constructor() {
    this.patterns = null;
    this.inputTracker = {
      cache: new Map(),
      lastWarning: 0,
      warningCooldown: 2000,
      processingInput: false,
    };
  }

  async initialise() {
    try {
      console.log("Initializing LanguageMonitor...");
      const jsonURL = chrome.runtime.getURL("wordlists/languagePatterns.json");
      console.log("Attempting to fetch from:", jsonURL);

      const response = await fetch(jsonURL);
      if (!response.ok) {
        throw new Error(
          `Failed to load language patterns. Status: ${response.status}`
        );
      }

      this.patterns = await response.json();
      console.log("Language patterns loaded successfully");

      // Convert string patterns to RegExp
      Object.values(this.patterns.categories).forEach((category) => {
        category.patterns = category.patterns.map(
          (pattern) => new RegExp(pattern, "i")
        );
      });

      // Add event listeners after patterns are loaded
      this.addEventListeners();
      return true;
    } catch (error) {
      console.error("Error initialising language patterns:", error);
      if (error instanceof TypeError) {
        console.log(
          "Network error - check if the file path is correct and the file is being copied to the dist folder"
        );
      }
      return false;
    }
  }

  addEventListeners() {
    document.addEventListener("input", this.handleInput.bind(this), true);
    document.addEventListener("paste", this.handlePaste.bind(this), true);

    // Monitor dynamic elements
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (this.isEditableElement(node)) {
                node.addEventListener(
                  "input",
                  this.handleInput.bind(this),
                  true
                );
              }
              // Check child elements
              const editableChildren = node.querySelectorAll(
                'input[type="text"], textarea, [contenteditable="true"]'
              );
              editableChildren.forEach((child) => {
                child.addEventListener(
                  "input",
                  this.handleInput.bind(this),
                  true
                );
              });
            }
          });
        }
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  tidyUp() {
    if (this.observer) {
      this.observer.disconnect();
    }
    document.removeEventListener("input", this.handleInput.bind(this), true);
    document.removeEventListener("paste", this.handlePaste.bind(this), true);
    this.inputTracker.cache.clear();
  }

  isEditableElement(element) {
    return (
      element.isContentEditable ||
      element.tagName === "TEXTAREA" ||
      (element.tagName === "INPUT" && element.type === "text") ||
      element.tagName === "DIV"
    );
  }

  getElementText(element) {
    if (element.isContentEditable || element.tagName === "DIV") {
      return element.textContent;
    }
    return element.value;
  }

  checkLanguage(text) {
    if (!this.patterns) return null;

    for (const [category, data] of Object.entries(this.patterns.categories)) {
      for (const pattern of data.patterns) {
        if (pattern.test(text)) {
          const severity = this.getSeverityLevel(text);
          return {
            category,
            severity,
            message: this.getRandomMessage(category),
            suggestions: this.getSuggestions(category),
          };
        }
      }
    }
    return null;
  }

  getSeverityLevel(text) {
    for (const [level, words] of Object.entries(
      this.patterns.severity_levels
    )) {
      if (words.some((word) => text.toLowerCase().includes(word))) {
        return level;
      }
    }
    return "low";
  }

  getRandomMessage(category) {
    const messages = this.patterns.categories[category].messages;
    return messages[Math.floor(Math.random() * messages.length)];
  }

  getSuggestions(category) {
    const categoryData = this.patterns.categories[category];
    return categoryData.suggestions || categoryData.alternatives || [];
  }

  canShowWarning() {
    const now = Date.now();
    if (
      now - this.inputTracker.lastWarning >=
      this.inputTracker.warningCooldown
    ) {
      this.inputTracker.lastWarning = now;
      return true;
    }
    return false;
  }

  async showKindReminder(result) {
    try {
      let message = result.message;
      if (result.suggestions && result.suggestions.length > 0) {
        message += "\n\n💡 Suggestion: " + result.suggestions[0];
      }

      // Get the settings and show cow if needed
      await new Promise((resolve) => {
        chrome.storage.sync.get({ isCowHidden: false }, async (settings) => {
          if (settings.isCowHidden) {
            const duration = 13000; // 12000ms message + 1000ms buffer
            temporarilyShowCow(duration);
            // Small delay to ensure cow appears
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
          this.playGentleAlert();
          this.showConcern();
          showSpeechBubble(message, 12000);
          resolve();
        });
      });
    } catch (error) {
      console.error("Error in showKindReminder:", error);
    }
  }

  playGentleAlert() {
    const audio = new Audio(chrome.runtime.getURL("assets/spacecowSound.mp3"));
    audio.volume = 0.5;
    audio.play().catch((err) => console.error("Audio playback failed:", err));
  }

  showConcern() {
    const pet = getPet();
    if (!pet) return;

    pet.classList.remove("concern-animation");
    void pet.offsetWidth; // Force reflow
    pet.classList.add("concern-animation");

    const shadowRoot = pet.getRootNode();
    if (shadowRoot.querySelector("#concern-animation-style")) return;

    const style = document.createElement("style");
    style.id = "concern-animation-style";
    style.textContent = `
            @keyframes spacecow-concern {
                0% { transform: rotate(0deg) translateY(0); }
                25% { transform: rotate(-5deg) translateY(-5px); }
                50% { transform: rotate(0deg) translateY(-7px); }
                75% { transform: rotate(5deg) translateY(-5px); }
                100% { transform: rotate(0deg) translateY(0); }
            }

            .concern-animation {
                animation: spacecow-concern 2s ease-in-out;
                transform-origin: center bottom;
            }
        `;
    shadowRoot.appendChild(style);
  }

  handleInput(event) {
    if (this.inputTracker.processingInput) return;
    this.inputTracker.processingInput = true;

    try {
      const element = event.target;
      if (!this.isEditableElement(element)) return;

      const currentText = this.getElementText(element);
      if (!currentText) return;

      if (this.canShowWarning()) {
        const result = this.checkLanguage(currentText);
        if (result) {
          this.showKindReminder(result);
        }
      }

      this.inputTracker.cache.set(element, currentText);
    } finally {
      this.inputTracker.processingInput = false;
    }
  }

  handlePaste(event) {
    const element = event.target;
    if (!this.isEditableElement(element)) return;

    const pastedText = event.clipboardData.getData("text");
    if (pastedText.trim() && this.canShowWarning()) {
      const result = this.checkLanguage(pastedText);
      if (result) {
        this.showKindReminder(result);
      }
    }
  }
}

// Create and export instance
const languageMonitor = new LanguageMonitor();

export function monitorLanguage() {
  return languageMonitor.initialise();
}
