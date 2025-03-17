/**
 * contextMenu.js
 * Handles the custom context menu for the spacecow pet with Shadow DOM support.
 * All code follows UK English conventions.
 */

import { showSpeechBubble } from "./speechUi.js";
import {
  generateStandardPassword,
  StoryPasswordGenerator,
  testPasswordStrength,
} from "./passwordGenerator.js";
import { showWritingStats } from "./TypingMonitor.js";
import { toggleHidingMode, showHiddenElements } from "./contentHider.js";

let menuWrapper = null;
let contextMenu = null;
let currentSettings = null;

/**
 * Creates the context menu with Shadow DOM
 * @returns {HTMLElement} The context menu element
 */
export function createContextMenu() {
  if (menuWrapper) return contextMenu;

  // Create wrapper and shadow root
  menuWrapper = document.createElement("div");
  menuWrapper.id = "spacecow-menu-wrapper";
  const shadow = menuWrapper.attachShadow({ mode: "open" });

  // Create styles
  const style = document.createElement("style");
  style.textContent = `
        #spacecow-context-menu {
            position: fixed;
            display: none;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            padding: 4px 0;
            min-width: 200px;
            z-index: 10002;
            font-family: Arial, sans-serif;
            transition: all 0.2s ease;
        }

        .menu-item {
            padding: 8px 12px;
            cursor: pointer;
            transition: background-color 0.2s, color 0.2s;
            user-select: none;
        }

        .menu-item:hover {
            background-color: #f0f0f0;
        }

        .menu-separator {
            height: 1px;
            background-color: #e0e0e0;
            margin: 4px 0;
        }

        /* High contrast styles */
        .high-contrast {
            background: black !important;
            color: white !important;
            border: 2px solid white !important;
        }

        .high-contrast .menu-item {
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .high-contrast .menu-item:last-child {
            border-bottom: none;
        }

        .high-contrast .menu-item:hover {
            background-color: white !important;
            color: black !important;
        }

        /* Animation */
        @keyframes menuFadeIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        #spacecow-context-menu.visible {
            animation: menuFadeIn 0.2s ease;
        }
    `;

  // Create menu container
  contextMenu = document.createElement("div");
  contextMenu.id = "spacecow-context-menu";

  // Append elements to shadow root
  shadow.appendChild(style);
  shadow.appendChild(contextMenu);
  document.body.appendChild(menuWrapper);

  // Initialise settings
  loadAccessibilitySettings();

  return contextMenu;
}

/**
 * Updates menu position relative to pet
 * @param {number} x - The x coordinate
 * @param {number} y - The y coordinate
 */
function updateMenuPosition(x, y) {
  if (!contextMenu || contextMenu.style.display === "none") return;

  const menuRect = contextMenu.getBoundingClientRect();
  let menuX = x;
  let menuY = y;

  // Check horizontal bounds
  if (menuX + menuRect.width > window.innerWidth) {
    menuX = window.innerWidth - menuRect.width - 10;
  }

  // Check vertical bounds
  if (menuY + menuRect.height > window.innerHeight) {
    menuY = window.innerHeight - menuRect.height - 10;
  }

  contextMenu.style.left = `${menuX}px`;
  contextMenu.style.top = `${menuY}px`;
}

/**
 * Loads accessibility settings from storage
 */
async function loadAccessibilitySettings() {
  const defaultSettings = {
    fontSize: 14,
    fontFamily: "Arial, sans-serif",
    lineSpacing: "1.5",
    textColour: "#333333",
    backgroundColour: "#ffffff",
    highContrast: false,
  };

  chrome.storage.sync.get(defaultSettings, (settings) => {
    currentSettings = settings;
    applyAccessibilitySettings();
    updateContextMenu();
  });
}

/**
 * Applies accessibility settings to the context menu
 */
function applyAccessibilitySettings() {
  if (!contextMenu || !currentSettings) return;

  // Apply font settings
  contextMenu.style.fontSize = `${currentSettings.fontSize}px`;
  contextMenu.style.fontFamily = currentSettings.fontFamily;
  contextMenu.style.lineHeight = currentSettings.lineSpacing;

  // Apply colors and contrast
  if (currentSettings.highContrast) {
    contextMenu.classList.add("high-contrast");
  } else {
    contextMenu.classList.remove("high-contrast");
    contextMenu.style.backgroundColor = currentSettings.backgroundColour;
    contextMenu.style.color = currentSettings.textColour;
  }
}

/**
 * Updates the context menu content
 */
export async function updateContextMenu() {
  if (!contextMenu) return;

  const { passwordType } = await chrome.storage.sync.get({
    passwordType: "story",
  });

  contextMenu.innerHTML = `
        <div class="menu-item" data-action="generatePassword">
            ${
              passwordType === "story"
                ? "Generate Story Password"
                : "Generate Strong Password"
            }
        </div>
        <div class="menu-item" data-action="testPassword">
            Test Password Strength
        </div>
        <div class="menu-separator"></div>
        <div class="menu-item" data-action="showWritingStats">
            Show Writing Stats
        </div>
        <div class="menu-separator"></div>
        <div class="menu-item" data-action="toggleHiding">
            Toggle Content Hiding Mode
        </div>
        <div class="menu-item" data-action="showHidden">
            Show Hidden Elements
        </div>
    `;

  // Add click handlers within shadow DOM
  const menuItems = contextMenu.querySelectorAll(".menu-item");
  menuItems.forEach((item) => {
    item.addEventListener("click", async (e) => {
      e.stopPropagation();
      const action = item.dataset.action;
      await handleMenuAction(action);
      hideContextMenu();
    });
  });
}

/**
 * Shows the context menu
 * @param {number} x - The x coordinate
 * @param {number} y - The y coordinate
 */
export function showContextMenu(x, y) {
  if (!menuWrapper) createContextMenu();

  contextMenu.style.display = "block";
  contextMenu.classList.add("visible");
  updateMenuPosition(x, y);

  // Add click listener to handle clicking outside menu
  setTimeout(() => {
    document.addEventListener("click", handleOutsideClick);
  }, 0);
}

/**
 * Handles clicks outside the context menu
 * @param {MouseEvent} event
 */
function handleOutsideClick(event) {
  if (!menuWrapper.contains(event.target)) {
    hideContextMenu();
  }
}

/**
 * Hides the context menu
 */
export function hideContextMenu() {
  if (contextMenu) {
    contextMenu.classList.remove("visible");
    contextMenu.style.display = "none";
    document.removeEventListener("click", handleOutsideClick);
  }
}

/**
 * Handles menu item actions
 * @param {string} action - The action to perform
 */
async function handleMenuAction(action) {
  try {
    switch (action) {
      case "generatePassword":
        const { passwordType } = await chrome.storage.sync.get({
          passwordType: "story",
        });
        if (passwordType === "story") {
          const generator = new StoryPasswordGenerator();
          await generator.initialise();
          const result = generator.generateStoryPassword();
          if (result) {
            showSpeechBubble(result.story, null);
          }
        } else {
          generateStandardPassword();
        }
        break;

      case "testPassword":
        testPasswordStrength();
        break;

      case "showWritingStats":
        showWritingStats();
        break;

      case "toggleHiding":
        toggleHidingMode();
        break;

      case "showHidden":
        showHiddenElements();
        break;
    }
  } catch (error) {
    console.error("Error handling menu action:", error);
    showSpeechBubble("Oops! Something went wrong.", 3000);
  }
}

/**
 * Gets the menu wrapper element
 * @returns {HTMLElement|null}
 */
export function getMenuWrapper() {
  return menuWrapper;
}

/**
 * Gets the context menu element
 * @returns {HTMLElement|null}
 */
export function getContextMenu() {
  return contextMenu;
}

// Listen for settings changes
chrome.storage.onChanged.addListener((changes) => {
  const settingsKeys = [
    "fontSize",
    "fontFamily",
    "lineSpacing",
    "textColour",
    "backgroundColour",
    "highContrast",
  ];

  // Update context menu if any accessibility settings change
  if (settingsKeys.some((key) => changes[key])) {
    loadAccessibilitySettings();
  }

  // Update menu items if password type changes
  if (changes.passwordType) {
    updateContextMenu();
  }
});
