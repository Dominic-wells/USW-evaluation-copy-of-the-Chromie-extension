/**
 * settings.js
 *
 * This module handles the application and persistence of accessibility settings.
 * It updates the speech bubble's style accordingly and stores the settings using Chrome storage.
 * * All code follows UK English conventions.
 */

import { showSpeechBubble, updateSpeechBubbleStyles } from "./speechUi.js";

/**
 * Applies the accessibility settings to the speech UI.
 *
 * @param {object} settings - An object containing accessibility settings.
 *   Expected properties:
 *     - fontSize: number (in pixels)
 *     - fontFamily: string
 *     - lineSpacing: string (e.g. "1.5")
 *     - textColour: string (hex value or colour name)
 *     - backgroundColour: string (hex value or colour name)
 *     - highContrast: boolean
 * @param {boolean} [showMessage=false] - Whether to display a confirmation message.
 * @returns {Promise<boolean>} - Resolves to true if settings were applied successfully
 */
export async function applyAccessibilitySettings(
  settings,
  showMessage = false
) {
  try {
    console.log("Applying settings:", settings);

    // Validate settings
    const requiredSettings = [
      "fontSize",
      "fontFamily",
      "lineSpacing",
      "textColour",
      "backgroundColour",
      "highContrast",
    ];

    if (!requiredSettings.every((key) => key in settings)) {
      throw new Error("Missing required settings");
    }

    // Update the speech bubble's style using the speechUi module
    updateSpeechBubbleStyles(settings);

    // Save the settings in Chrome storage for persistence
    await new Promise((resolve, reject) => {
      chrome.storage.sync.set(settings, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });

    console.log("Settings saved successfully");

    // Display a confirmation message if requested
    if (showMessage) {
      showSpeechBubble("Settings applied successfully!", 2000);
    }

    return true;
  } catch (error) {
    console.error("Error applying settings:", error);
    if (showMessage) {
      showSpeechBubble("Failed to apply settings. Please try again.", 2000);
    }
    return false;
  }
}
