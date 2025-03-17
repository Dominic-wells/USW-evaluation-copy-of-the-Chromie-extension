/**
 * passwordGenerator.js
 * Handles password generation and strength testing functionality.
 * All code follows UK English conventions.*
 */

import { showSpeechBubble } from "./speechUi.js";

// Keep track of the last generated result
let lastGeneratedResult = null;

/**
 * Generates a standard secure password
 * @returns {string} Generated password
 */
export function generateStandardPassword() {
  try {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    const length = 12;

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset.charAt(randomIndex);
    }

    displayGeneratedPassword(password);
    return password;
  } catch (error) {
    console.error("Error generating standard password:", error);
    showSpeechBubble(
      "Oops! Something went wrong while generating the password."
    );
    return null;
  }
}

/**
 * Story password generator class with enhanced coherence checking
 */
export class StoryPasswordGenerator {
  constructor() {
    this.wordLists = {};
    // Enhanced theme-specific templates with better grammar and storytelling
    this.themeTemplates = {
      space: {
        simple: [
          "The {colour} {character} discovered a {object} on the {place}.",
          "An {character} traveled to the {place} carrying a {colour} {object}.",
          "While exploring the {place}, the {character} found a {colour} {object}.",
          "The {character} used a {colour} {object} to navigate the {place}.",
        ],
        advanced: [
          "The {character} {action} carefully with the {colour} {object} while exploring the distant {place}.",
          "After finding a {colour} {object}, the {character} {action} across the mysterious {place}.",
          "The brave {character} {action} to the {place} using only a {colour} {object} as a guide.",
          "Using the {colour} {object}, the clever {character} managed to {action} around the {place}.",
        ],
      },
      magic: {
        simple: [
          "The {colour} {character} enchanted a {object} inside the {place}.",
          "A {character} journeyed to the {place} with a {colour} {object}.",
          "Deep within the {place}, the {character} discovered a {colour} {object}.",
          "The {character} cast a spell using a {colour} {object} near the {place}.",
        ],
        advanced: [
          "The {character} {action} mysteriously with the {colour} {object} while exploring the ancient {place}.",
          "After enchanting a {colour} {object}, the {character} {action} through the magical {place}.",
          "The wise {character} {action} to the {place} wielding only a {colour} {object}.",
          "Channeling power through the {colour} {object}, the {character} {action} confidently around the {place}.",
        ],
      },
      ocean: {
        simple: [
          "The {colour} {character} discovered a {object} beneath the {place}.",
          "A {character} ventured to the {place} carrying a {colour} {object}.",
          "Deep within the {place}, the {character} found a {colour} {object}.",
          "The {character} used a {colour} {object} to navigate the {place}.",
        ],
        advanced: [
          "The {character} {action} gracefully with the {colour} {object} while exploring the mysterious {place}.",
          "After finding a {colour} {object}, the {character} {action} through the vast {place}.",
          "The agile {character} {action} to the {place} guided only by a {colour} {object}.",
          "Using the {colour} {object}, the clever {character} managed to {action} around the dangerous {place}.",
        ],
      },
    };

    // Fallback templates if theme-specific ones aren't available
    this.defaultTemplates = {
      simple: [
        "The {colour} {character} with the {object}.",
        "A {character} finds a {object}.",
        "The {character} at the {place}.",
        "The {colour} {object} in the {place}.",
      ],
      advanced: [
        "The {character} {action} with the {object} in the {place}.",
        "The {character} {action} to the {place} with the {object}.",
        "The {colour} {character} {action} through the {place}.",
        "The {character} uses the {object} while {action} near the {place}.",
      ],
    };

    this.currentTheme = "";
    this.complexity = "simple";
  }

  async initialise(defaultTheme = "space") {
    try {
      // Get saved settings
      const { storyTheme, storyComplexity } = await chrome.storage.sync.get({
        storyTheme: defaultTheme,
        storyComplexity: "simple",
      });

      console.log("Loading theme from storage:", storyTheme);
      this.complexity = storyComplexity;
      await this.loadTheme(storyTheme);
      return true;
    } catch (error) {
      console.error("Error initialising story generator:", error);
      return false;
    }
  }

  async loadTheme(theme) {
    try {
      console.log(`Loading theme: ${theme}`);
      const response = await fetch(
        chrome.runtime.getURL(`wordlists/${theme}.json`)
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.wordLists[theme] = data;
      this.currentTheme = theme;
      console.log("Theme loaded successfully:", data);
      return true;
    } catch (error) {
      console.error(`Error loading theme ${theme}:`, error);
      return false;
    }
  }

  /**
   * Gets a random word with its metadata from a category
   * @param {string} category - The word category to pick from
   * @returns {Object} The word and its metadata
   */
  getRandomWord(category) {
    try {
      // Handle UK/US spelling difference
      const actualCategory = category === "colours" ? "colors" : category;
      const words = this.wordLists[this.currentTheme].words[actualCategory];

      if (!words) {
        console.error(`No words found for category: ${actualCategory}`);
        return { word: category };
      }

      // Get a random word from the list
      const randomWord = words[Math.floor(Math.random() * words.length)];

      // Handle both formats (simple strings or objects with metadata)
      if (typeof randomWord === "string") {
        return { word: randomWord };
      } else {
        return randomWord;
      }
    } catch (error) {
      console.error(`Error getting random word for ${category}:`, error);
      return { word: category };
    }
  }

  /**
   * Checks if the combination of words creates a coherent story
   * @param {Object} wordBank - The selected words for the story
   * @returns {boolean} Whether the story is coherent
   */
  checkStoryCoherence(wordBank) {
    // Extract word objects and simple words
    const character = wordBank.character;
    const place = wordBank.place;
    const object = wordBank.object;
    const action = wordBank.action;

    // Handle both metadata objects and simple words
    const characterWord =
      typeof character === "object" ? character.word : character;
    const objectWord = typeof object === "object" ? object.word : object;
    const actionWord = typeof action === "object" ? action.word : action;
    const placeWord = typeof place === "object" ? place.word : place;

    // Basic coherence checks that apply to all themes

    // Check 1: Avoid duplicate words in key positions
    if (characterWord === objectWord || placeWord === objectWord) {
      return false;
    }

    // Check 2: Check if action is compatible with character
    if (
      action &&
      character &&
      typeof action === "object" &&
      typeof character === "object"
    ) {
      if (actionWord === "runs" && character.canRun === false) {
        return false;
      }

      if (actionWord === "hides" && character.canHide === false) {
        return false;
      }
    }

    // Check 3: Check if character can use object properly
    if (
      character &&
      object &&
      typeof character === "object" &&
      typeof object === "object"
    ) {
      // Large characters can't use tiny objects effectively
      if (character.size === "large" && object.size === "tiny") {
        return false;
      }

      // Small characters can't carry large objects
      if (
        character.size === "small" &&
        object.size === "large" &&
        object.canBeCarried === false
      ) {
        return false;
      }
    }

    // Check 4: Check if action makes sense with object
    if (
      action &&
      object &&
      typeof action === "object" &&
      typeof object === "object"
    ) {
      if (actionWord === "flies" && object.canFly === false) {
        return false;
      }
    }

    return true;
  }

  /**
   * Improves story readability with proper capitalization and punctuation
   * @param {string} story - The generated story
   * @returns {string} Improved story text
   */
  improveStoryReadability(story) {
    // Check if the story already starts with a capital letter
    if (!/^[A-Z]/.test(story)) {
      // Ensure the first letter is capitalized
      story = story.charAt(0).toUpperCase() + story.slice(1);
    }

    // Ensure story ends with proper punctuation
    if (!story.endsWith(".") && !story.endsWith("!") && !story.endsWith("?")) {
      story += ".";
    }

    return story;
  }

  generateStoryPassword() {
    try {
      // Play a story sound when generating a password if function exists
      if (typeof playNotificationSound === "function") {
        playNotificationSound("Once_upon_a_time.mp3");
      }

      // Select templates based on theme if available, otherwise use default templates
      const templatesSource =
        this.themeTemplates[this.currentTheme] || this.defaultTemplates;
      const templates = templatesSource[this.complexity];
      const template = templates[Math.floor(Math.random() * templates.length)];

      // Try up to 3 times to generate a coherent story
      let wordBank;
      let attempts = 0;
      let isCoherent = false;

      while (!isCoherent && attempts < 3) {
        // Get random words with their metadata
        const characterObj = this.getRandomWord("characters");
        const placeObj = this.getRandomWord("places");
        const objectObj = this.getRandomWord("objects");
        const actionObj = this.getRandomWord("actions");
        const colourObj = this.getRandomWord("colours");

        wordBank = {
          character: characterObj,
          place: placeObj,
          object: objectObj,
          action: actionObj,
          colour: colourObj,
        };

        // Check for basic coherence
        isCoherent = this.checkStoryCoherence(wordBank);
        attempts++;
      }

      // Extract just the words for template replacement
      const simpleWordBank = {
        character:
          typeof wordBank.character === "object"
            ? wordBank.character.word
            : wordBank.character,
        place:
          typeof wordBank.place === "object"
            ? wordBank.place.word
            : wordBank.place,
        object:
          typeof wordBank.object === "object"
            ? wordBank.object.word
            : wordBank.object,
        action:
          typeof wordBank.action === "object"
            ? wordBank.action.word
            : wordBank.action,
        colour:
          typeof wordBank.colour === "object"
            ? wordBank.colour.word
            : wordBank.colour,
      };

      // Apply template
      let story = template;
      Object.entries(simpleWordBank).forEach(([key, word]) => {
        const placeholder = `{${key}}`;
        while (story.includes(placeholder)) {
          story = story.replace(placeholder, word);
        }
      });

      // Improve readability with proper capitalization and punctuation
      story = this.improveStoryReadability(story);

      // NEW CODE: Extract words in the order they appear in the story
      const usedWords = [];
      const wordEntries = Object.entries(simpleWordBank);

      // First, get the list of words actually used in the template
      const templateUsedWords = wordEntries
        .filter(([key]) => template.includes(`{${key}}`))
        .map(([key, word]) => ({ key, word }));

      // For each word, find its position in the final story text
      templateUsedWords.forEach(({ word }) => {
        // Create a regex to find the word with word boundaries
        const wordRegex = new RegExp(`\\b${word}\\b`, "i");
        if (wordRegex.test(story)) {
          const match = story.match(wordRegex);
          if (match) {
            const position = match.index;
            usedWords.push({ word, position });
          }
        }
      });

      // Sort words by their position in the story
      usedWords.sort((a, b) => a.position - b.position);

      // Extract just the ordered words
      const orderedWords = usedWords.map((item) => item.word);

      // Create the final password by taking the first letter of each word
      const password = orderedWords
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");

      const result = { story, words: orderedWords, password };

      if (typeof displayStoryPassword === "function") {
        displayStoryPassword(result);
      }

      return result;
    } catch (error) {
      console.error("Error generating story password:", error);
      if (typeof showSpeechBubble === "function") {
        showSpeechBubble(
          "Oops! Something went wrong generating your password.",
          3000
        );
      }
      return null;
    }
  }
}

/**
 * Plays a notification sound file
 * @param {string} soundFile - The name of the sound file in assets folder
 */
function playNotificationSound(soundFile) {
  try {
    // Check if Chrome context is still valid
    if (!chrome || !chrome.runtime || !chrome.runtime.id) {
      console.warn("Chrome context invalid, cannot play sound");
      return;
    }

    const audioUrl = chrome.runtime.getURL(`assets/sounds/${soundFile}`);
    const audio = new Audio(audioUrl);
    audio.volume = 0.7;

    audio.play().catch((err) => {
      console.error("Failed to play notification sound:", err);
      // If this fails due to context issues, suppress the error to the user
      if (err.message && !err.message.includes("user gesture")) {
        console.warn("Audio playback failed silently");
      }
    });
  } catch (error) {
    // Silently fail rather than crashing the extension
    console.error("Error playing notification sound:", error);
  }
}

/**
 * Highlights password words in the story for better visibility
 * @param {string} story - The story text
 * @param {Array<string>} words - The words to highlight
 * @returns {string} HTML with highlighted words
 */
function highlightPasswordWords(story, words) {
  let result = story;
  words.forEach((word) => {
    // Create a regex that matches the word with word boundaries
    const regex = new RegExp(`\\b${word}\\b`, "i");
    result = result.replace(
      regex,
      (match) => `<span class="highlight-word">${match}</span>`
    );
  });
  return result;
}

/**
 * Displays the story password result
 * @param {Object} result - The generated password result
 */
function displayStoryPassword(result) {
  if (!result) return;
  lastGeneratedResult = result;

  // Play a sound when displaying a story password
  if (typeof playNotificationSound === "function") {
    playNotificationSound("password_created.mp3");
  }

  updateStoryDisplay(result);
}

/**
 * Updates the story display with current accessibility settings
 * @param {Object} result - The password result to display
 */
function updateStoryDisplay(result) {
  if (!result) return;

  chrome.storage.sync.get(
    {
      fontSize: 14,
      fontFamily: "Arial, sans-serif",
      lineSpacing: "1.5",
      textColour: "#333333",
      backgroundColour: "#ffffff",
      highContrast: false,
    },
    function (settings) {
      // Create a visually highlighted version of the story
      const highlightedStory = highlightPasswordWords(
        result.story,
        result.words
      );

      const displayHTML = `
  <div class="story-password" style="width: 100% !important; max-width: 100% !important; box-sizing: border-box !important;">
    <style>
      .story-password {
        font-family: ${settings.fontFamily};
        font-size: ${settings.fontSize}px;
        line-height: ${settings.lineSpacing};
        color: ${settings.highContrast ? "white" : settings.textColour};
        background-color: ${
          settings.highContrast ? "black" : settings.backgroundColour
        };
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
      
      .story-section h3, 
      .words-section h3,
      .password-section h3 {
        margin-bottom: 10px !important;
        color: ${settings.highContrast ? "white" : "#2c3e50"} !important;
        font-size: ${Math.min(settings.fontSize + 2, 24)}px !important;
      }
      
      .story-section {
        border-left: 4px solid ${
          settings.highContrast ? "white" : "#007bff"
        } !important;
        padding-left: 12px !important;
        margin-bottom: 15px !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      
      .words-section {
        background: ${settings.highContrast ? "#333" : "#f8f9fa"} !important;
        padding: 10px !important;
        border-radius: 6px !important;
        margin: 15px 0 !important;
        border: ${
          settings.highContrast ? "1px solid white" : "none"
        } !important;
        overflow-wrap: break-word !important;
        word-wrap: break-word !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      
      .words-container {
        display: flex !important;
        flex-wrap: wrap !important;
        align-items: center !important;
        gap: 5px !important;
      }
      
      .word-item {
        display: inline-flex !important;
        align-items: center !important;
      }
      
      .password-section {
        text-align: center !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      
      .password-display {
        font-family: monospace !important;
        font-size: ${Math.min(settings.fontSize + 2, 24)}px !important;
        background: ${settings.highContrast ? "#333" : "#e9ecef"} !important;
        padding: 10px !important;
        border-radius: 4px !important;
        margin: 10px 0 !important;
        border: ${
          settings.highContrast ? "1px solid white" : "none"
        } !important;
        color: ${
          settings.highContrast ? "white" : settings.textColour
        } !important;
        word-break: break-all !important;
        overflow-wrap: break-word !important;
        max-width: 100% !important;
        white-space: normal !important;
      }
      
      .copy-button {
        display: inline-block !important;
        background: ${settings.highContrast ? "#fff" : "#007bff"} !important;
        color: ${settings.highContrast ? "#000" : "#fff"} !important;
        border: ${
          settings.highContrast ? "2px solid white" : "none"
        } !important;
        padding: 8px 16px !important;
        border-radius: 4px !important;
        cursor: pointer !important;
        font-size: ${settings.fontSize}px !important;
        font-family: ${settings.fontFamily} !important;
        font-weight: bold !important;
        transition: background-color 0.2s !important;
        margin: 10px auto !important;
        white-space: normal !important;
        word-break: break-word !important;
      }
      
      .copy-button:hover {
        background: ${settings.highContrast ? "#90EE90" : "#0056b3"} !important;
      }
      
      .highlight-word {
        font-weight: bold !important;
        color: ${settings.highContrast ? "#ffcc00" : "#d9534f"} !important;
        text-decoration: underline !important;
      }
      
      .password-mnemonic {
        font-style: italic !important;
        margin-top: 10px !important;
        padding: 8px !important;
        background: ${settings.highContrast ? "#333" : "#f0f9ff"} !important;
        border-radius: 4px !important;
        font-size: 0.9em !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }

      .word-arrow {
        color: ${settings.highContrast ? "#999" : "#6c757d"} !important;
        margin: 0 5px !important;
      }
    </style>

    <div class="story-section">
      <h3>Your Story:</h3>
      <p>${highlightedStory}</p>
      <div class="password-mnemonic">
        Remember your password by using the first letter of each highlighted word.
      </div>
    </div>
    
    <div class="words-section">
      <h3>Your Words:</h3>
      <div class="words-container">
        ${result.words
          .map(
            (word, index) => `
          <span class="word-item">
            ${word}${
              index < result.words.length - 1
                ? '<span class="word-arrow">→</span>'
                : ""
            }
          </span>
        `
          )
          .join("")}
      </div>
    </div>
    
    <div class="password-section">
      <h3>Your Password:</h3>
      <p class="password-display">${result.password}</p>
      <button class="copy-button" type="button">Copy Password</button>
    </div>
  </div>
`;

      showSpeechBubble(displayHTML, null);

      // Add copy button functionality through shadow root with a small delay
      setTimeout(() => {
        const bubbleWrapper = document.getElementById("speech-bubble-wrapper");
        if (bubbleWrapper && bubbleWrapper.shadowRoot) {
          const shadow = bubbleWrapper.shadowRoot;
          const copyButton = shadow.querySelector(".copy-button");

          if (copyButton) {
            // Apply styles directly to ensure they're applied
            copyButton.style.cssText = `
              display: inline-block !important;
              background-color: ${
                settings.highContrast ? "#fff" : "#007bff"
              } !important;
              color: ${settings.highContrast ? "#000" : "#fff"} !important;
              border: ${
                settings.highContrast ? "2px solid white" : "none"
              } !important;
              padding: 8px 16px !important;
              border-radius: 4px !important;
              cursor: pointer !important;
              font-size: ${settings.fontSize}px !important;
              font-weight: bold !important;
              margin: 10px auto !important;
            `;

            copyButton.addEventListener("click", () => {
              copyToClipboard(result.password);
              copyButton.textContent = "Copied!";
              copyButton.style.backgroundColor = settings.highContrast
                ? "#90EE90"
                : "#28a745";

              // Play a sound when copying
              if (typeof playNotificationSound === "function") {
                playNotificationSound("Okay_keep_it_secret.mp3");
              }
            });
          } else {
            console.error("Copy button not found in shadow DOM");
            // Create the button if it doesn't exist
            const passwordSection = shadow.querySelector(".password-section");
            if (passwordSection) {
              const newButton = document.createElement("button");
              newButton.textContent = "Copy Password";
              newButton.className = "copy-button";
              newButton.style.cssText = `
                display: inline-block !important;
                background-color: ${
                  settings.highContrast ? "#fff" : "#007bff"
                } !important;
                color: ${settings.highContrast ? "#000" : "#fff"} !important;
                border: ${
                  settings.highContrast ? "2px solid white" : "none"
                } !important;
                padding: 8px 16px !important;
                border-radius: 4px !important;
                cursor: pointer !important;
                font-size: ${settings.fontSize}px !important;
                font-weight: bold !important;
                margin: 10px auto !important;
              `;

              newButton.addEventListener("click", () => {
                copyToClipboard(result.password);
                newButton.textContent = "Copied!";
                newButton.style.backgroundColor = settings.highContrast
                  ? "#90EE90"
                  : "#28a745";

                // Play a sound when copying
                if (typeof playNotificationSound === "function") {
                  playNotificationSound("keep_it_secret.mp3");
                }
              });

              passwordSection.appendChild(newButton);
            }
          }
        }
      }, 100); // Small delay to ensure DOM is ready
    }
  );
}

/**
 * Tests password strength and displays results with improved visibility
 */
export function testPasswordStrength() {
  try {
    // First check if extension context is still valid
    if (!chrome || !chrome.runtime || !chrome.runtime.id) {
      if (typeof showSpeechBubble === "function") {
        showSpeechBubble(
          "Extension context has been invalidated. Please refresh the page and try again.",
          5000
        );
      }
      return;
    }

    chrome.storage.sync.get(
      {
        fontSize: 14,
        fontFamily: "Arial, sans-serif",
        lineSpacing: "1.5",
        textColour: "#333333",
        backgroundColour: "#ffffff",
        highContrast: false,
      },
      function (settings) {
        try {
          // Check again inside the callback to handle async context loss
          if (!chrome || !chrome.runtime || !chrome.runtime.id) {
            if (typeof showSpeechBubble === "function") {
              showSpeechBubble(
                "Extension context was lost. Please refresh the page and try again.",
                5000
              );
            }
            return;
          }

          const inputHTML = `
            <div class="password-tester">
              <style>
                .password-tester {
                  font-family: ${settings.fontFamily} !important;
                  background: ${
                    settings.highContrast ? "black" : "white"
                  } !important;
                  padding: 16px !important;
                  border-radius: 8px !important;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
                  color: ${
                    settings.highContrast ? "white" : settings.textColour
                  } !important;
                  ${
                    settings.highContrast
                      ? "border: 2px solid white !important;"
                      : ""
                  }
                  width: 100% !important;
                  box-sizing: border-box !important;
                }

                .input-container {
                  margin-bottom: 16px !important;
                }

                .input-container label {
                  display: block !important;
                  margin-bottom: 8px !important;
                  color: ${settings.highContrast ? "white" : "#333"} !important;
                  font-weight: bold !important;
                }

                .password-input {
                  display: block !important;
                  width: 100% !important;
                  padding: 10px !important;
                  margin-bottom: 12px !important;
                  border: 2px solid ${
                    settings.highContrast ? "white" : "#ccc"
                  } !important;
                  border-radius: 4px !important;
                  font-size: 14px !important;
                  box-sizing: border-box !important;
                  background: ${
                    settings.highContrast ? "black" : "white"
                  } !important;
                  color: ${
                    settings.highContrast ? "white" : "black"
                  } !important;
                }

                .test-button {
                  display: block !important;
                  width: auto !important;
                  min-width: 200px !important;
                  max-width: 100% !important;
                  padding: 10px 16px !important;
                  border-radius: 4px !important;
                  cursor: pointer !important;
                  font-size: 14px !important;
                  font-weight: bold !important;
                  transition: all 0.2s ease !important;
                  background: ${
                    settings.highContrast ? "white" : "#007bff"
                  } !important;
                  color: ${
                    settings.highContrast ? "black" : "white"
                  } !important;
                  border: ${
                    settings.highContrast ? "2px solid white" : "none"
                  } !important;
                  margin: 0 auto !important;
                }

                .test-button:hover {
                  background: ${
                    settings.highContrast ? "black" : "#0056b3"
                  } !important;
                  color: white !important;
                  ${
                    settings.highContrast
                      ? "border: 2px solid white !important;"
                      : ""
                  }
                }

                .strength-result {
                  margin-top: 16px !important;
                  padding: 12px !important;
                  border-radius: 4px !important;
                  background: ${
                    settings.highContrast ? "#333" : "#f8f9fa"
                  } !important;
                }
              </style>

              <div class="input-container">
                <label for="password-test-input">Enter a password to test:</label>
                <input 
                  type="password" 
                  id="password-test-input"
                  class="password-input" 
                  aria-label="Password to test"
                  data-spacecow-test="true"
                >
              </div>
              <button class="test-button" type="button">Test Password Strength</button>
              <div class="strength-result" aria-live="polite"></div>
            </div>
          `;

          showSpeechBubble(inputHTML, null);

          // Use a timeout to ensure DOM is ready
          setTimeout(() => {
            try {
              const bubbleWrapper = document.getElementById(
                "speech-bubble-wrapper"
              );
              if (!bubbleWrapper || !bubbleWrapper.shadowRoot) {
                console.error("Speech bubble wrapper not found");
                return;
              }

              const shadow = bubbleWrapper.shadowRoot;
              const testButton = shadow.querySelector(".test-button");
              const passwordInput = shadow.querySelector(".password-input");
              const strengthResult = shadow.querySelector(".strength-result");

              if (!testButton || !passwordInput || !strengthResult) {
                console.error("Required elements not found in shadow DOM");
                return;
              }

              // Apply styles directly to ensure visibility
              testButton.style.cssText = `
                display: block !important;
                width: auto !important;
                min-width: 200px !important;
                max-width: 100% !important;
                padding: 10px 16px !important;
                border-radius: 4px !important;
                cursor: pointer !important;
                font-size: 14px !important;
                font-weight: bold !important;
                background-color: ${
                  settings.highContrast ? "white" : "#007bff"
                } !important;
                color: ${settings.highContrast ? "black" : "white"} !important;
                border: ${
                  settings.highContrast ? "2px solid white" : "none"
                } !important;
                margin: 10px auto !important;
              `;

              const checkStrength = () => {
                try {
                  // Check chrome context before any operations
                  if (!chrome || !chrome.runtime || !chrome.runtime.id) {
                    strengthResult.innerHTML = `
                      <div style="color: red !important; font-weight: bold !important; padding: 10px !important;">
                        Extension context has been lost. Please refresh the page and try again.
                      </div>
                    `;
                    return;
                  }

                  const password = passwordInput.value;
                  if (!password) {
                    strengthResult.innerHTML = `
                      <div style="color: ${
                        settings.highContrast ? "#ff6b6b" : "#dc3545"
                      }; font-weight: bold !important; padding: 10px !important;">
                        Please enter a password
                      </div>
                    `;
                    return;
                  }

                  let score = 0;
                  const feedback = [];

                  if (password.length >= 12) score += 2;
                  else if (password.length >= 8) score += 1;
                  else
                    feedback.push(
                      "Password should be at least 8 characters long"
                    );

                  if (/[A-Z]/.test(password)) score += 1;
                  else feedback.push("Add uppercase letters");

                  if (/[a-z]/.test(password)) score += 1;
                  else feedback.push("Add lowercase letters");

                  if (/[0-9]/.test(password)) score += 1;
                  else feedback.push("Add numbers");

                  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
                    score += 1;
                  else feedback.push("Add special characters");

                  // Determine strength with color values
                  let strength, strengthColor;
                  if (score >= 5) {
                    strength = "Strong";
                    strengthColor = settings.highContrast
                      ? "#90EE90"
                      : "#28a745";
                  } else if (score >= 3) {
                    strength = "Moderate";
                    strengthColor = settings.highContrast
                      ? "#ffd93d"
                      : "#ffc107";
                  } else {
                    strength = "Weak";
                    strengthColor = settings.highContrast
                      ? "#ff6b6b"
                      : "#dc3545";
                  }

                  // Apply result with inline styles for guaranteed visibility
                  strengthResult.innerHTML = `
                    <div style="
                      background: ${settings.highContrast ? "#333" : "white"}; 
                      padding: 12px !important; 
                      border-radius: 4px !important; 
                      border: ${
                        settings.highContrast
                          ? "1px solid white"
                          : "1px solid #ddd"
                      } !important;
                    ">
                      <div style="
                        color: ${strengthColor} !important; 
                        font-size: 16px !important; 
                        margin-bottom: 10px !important;
                        font-weight: bold !important;
                      ">
                        Password Strength: ${strength}
                      </div>
                      ${
                        feedback.length > 0
                          ? `
                        <div style="color: ${
                          settings.highContrast ? "white" : "#333"
                        } !important;">
                          <div style="font-weight: bold !important; margin-bottom: 8px !important;">
                            Suggestions to improve:
                          </div>
                          <ul style="
                            margin: 0 !important; 
                            padding-left: 20px !important;
                            color: ${
                              settings.highContrast ? "white" : "#666"
                            } !important;
                          ">
                            ${feedback
                              .map(
                                (f) => `<li style="
                              margin: 4px 0 !important; 
                              color: ${
                                settings.highContrast ? "white" : "#666"
                              } !important;
                            ">${f}</li>`
                              )
                              .join("")}
                          </ul>
                        </div>
                      `
                          : ""
                      }
                    </div>
                  `;

                  // Play sound effect based on password strength
                  if (typeof playNotificationSound === "function") {
                    let soundFile;
                    if (score >= 5) {
                      soundFile = "strong_password.mp3";
                    } else if (score >= 3) {
                      soundFile = "moderate_password.mp3";
                    } else {
                      soundFile = "weak_password.mp3";
                    }
                    playNotificationSound(soundFile);
                  }
                } catch (innerError) {
                  console.error("Error in checkStrength:", innerError);
                  strengthResult.innerHTML = `
                    <div style="color: red !important; font-weight: bold !important; padding: 10px !important;">
                      ${
                        innerError.message.includes(
                          "Extension context invalidated"
                        )
                          ? "Extension context has been lost. Please refresh the page and try again."
                          : "An error occurred while checking password strength."
                      }
                    </div>
                  `;
                }
              };

              testButton.addEventListener("click", checkStrength);
              passwordInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") checkStrength();
              });
            } catch (domError) {
              console.error("Error accessing DOM elements:", domError);
              showSpeechBubble(
                "Sorry, there was an error setting up the password tester. Please try again.",
                3000
              );
            }
          }, 100); // Small delay to ensure DOM is ready
        } catch (callbackError) {
          console.error("Error in chrome.storage callback:", callbackError);
          showSpeechBubble(
            "Sorry, there was an error accessing your settings. Please try again.",
            3000
          );
        }
      }
    );
  } catch (error) {
    console.error("Error in password strength test:", error);

    // For extension context errors, show a specific message
    if (
      error.message &&
      error.message.includes("Extension context invalidated")
    ) {
      showSpeechBubble(
        "The extension needs to be refreshed. Please reload the page and try again.",
        5000
      );
    } else {
      showSpeechBubble(
        "Sorry, I encountered an error while testing the password. Please try again.",
        3000
      );
    }
  }
}
/**
 * The copyToClipboard and settings listener can remain the same
 * as they don't interact with the DOM
 */
function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      console.log("Text copied successfully");
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err);
      showSpeechBubble(
        "Sorry, I couldn't copy the password. Please try copying it manually."
      );
    });
}

// Settings listener remains unchanged
chrome.storage.onChanged.addListener((changes) => {
  if (changes.storyTheme || changes.storyComplexity) {
    console.log("Password generator settings changed:", changes);
  }
});
