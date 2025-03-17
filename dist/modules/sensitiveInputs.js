/**
 * sensitiveInputs.js
 *
 * This module handles the monitoring of form fields for potential sensitive data entry.
 * It checks for common patterns in input names, labels and placeholders to warn users
 * All code follows UK English conventions.
 */

import { showSpeechBubble } from "./speechUi.js";
import { getPet } from "./pet.js";

// Play the spacecow sound
function playSpacecowSound() {
  const audio = new Audio(chrome.runtime.getURL("assets/spacecowSound.mp3"));
  audio.play().catch((err) => console.error("Audio play failed:", err));
}

// Add spin animation to the cow
function spinCow() {
  const pet = getPet();
  if (!pet) return;

  // Add the spin animation class
  pet.classList.remove("spin-animation");
  void pet.offsetWidth; // Force reflow
  pet.classList.add("spin-animation");

  // Add the animation styles if they don't exist
  const shadowRoot = pet.getRootNode();
  if (shadowRoot.querySelector("#spin-animation-style")) return;

  const style = document.createElement("style");
  style.id = "spin-animation-style";
  style.textContent = `
    @keyframes spacecow-spin {
      0% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(180deg) scale(1.2); }
      100% { transform: rotate(360deg) scale(1); }
    }

    .spin-animation {
      animation: spacecow-spin 1s ease-in-out;
      transform-origin: center center;
    }
  `;
  shadowRoot.appendChild(style);
}

// Show alert with animation and sound
function showSecurityAlert(message) {
  playSpacecowSound();
  spinCow();
  showSpeechBubble(message, 15000);
}

/**
 * Monitors form fields for potential sensitive data entry
 */
export function monitorSensitiveInputs() {
  // Keep track of warned fields to prevent repeated warnings
  const warnedFields = new Set();

  // Skip monitoring on our own password strength tester
  const isOurPasswordTester = (element) => {
    return element.hasAttribute("data-spacecow-test");
  };

  // List of sensitive input types to monitor
  const sensitiveTypes = ["password", "tel", "email", "number", "text"];

  // Patterns that might indicate sensitive information
  const sensitivePatterns = {
    personal: /name|username|user|firstname|lastname|fullname/i,
    contact: /phone|mobile|tel|contact|email|mail/i,
    location: /address|location|city|state|zip|postal|country/i,
    financial: /card|credit|debit|payment|bank|account/i,
    sensitive: /ssn|social|security|passport|license|birth|age|date/i,
    health: /health|medical|insurance|condition/i,
  };

  // Function to check if an input might be for sensitive data
  const checkInputSensitivity = (input) => {
    if (!sensitiveTypes.includes(input.type)) {
      return null;
    }

    // Get all relevant attributes to check
    const textToCheck = [
      input.name,
      input.id,
      input.placeholder,
      input.getAttribute("aria-label"),
      input.getAttribute("label"),
      input.getAttribute("data-label"),
      // Check label text if there's an associated label
      input.labels &&
        Array.from(input.labels)
          .map((label) => label.textContent)
          .join(" "),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    // Check for sensitive patterns
    for (const [category, pattern] of Object.entries(sensitivePatterns)) {
      if (pattern.test(textToCheck)) {
        return category;
      }
    }

    // Also consider password fields sensitive
    if (input.type === "password") {
      return "personal";
    }

    return null;
  };

  // Function to get site security info
  const getSiteSecurityInfo = () => {
    const isSecure = window.location.protocol === "https:";
    const domain = window.location.hostname;
    const hasSSL = isSecure || domain.includes("localhost");

    return {
      isSecure: hasSSL,
      domain: domain,
      securityLevel: hasSSL ? "secure" : "not secure",
    };
  };

  // Function to create warning message
  const createWarningMessage = (category, security) => {
    let message = "Hold on a moment! 🛡️\n\n";

    // Add security status
    if (!security.isSecure) {
      message +=
        "⚠️ Just so you know, this site isn't using secure HTTPS! Be extra careful!\n\n";
    }

    message += `📍 You're on: ${security.domain}\n\n`;

    // Category specific messages
    const categoryMessages = {
      personal: "Looks like you're about to enter personal information!",
      contact: "I see you're entering contact details!",
      location: "I notice you're about to share location information!",
      financial: "Heads up! This looks like financial information!",
      sensitive: "This seems like sensitive information!",
      health: "I see you're entering health-related information!",
    };

    message += categoryMessages[category] + "\n\n";

    // Add safety tips
    message += "✨ Remember these safety tips:\n";
    message += "- Only share information on sites you trust\n";
    message += "- Look for the padlock 🔒 in your browser\n";
    message += "- Double-check the website address\n";
    message += "- Ask an adult if you're not sure!\n\n";

    message += "Stay safe online! 🌟";

    return message;
  };

  // Main event listener for input focus
  const handleInputFocus = (event) => {
    const input = event.target;

    // Skip if it's not an input or if it's our password tester
    if (input.tagName !== "INPUT" || isOurPasswordTester(input)) {
      return;
    }

    // Skip if we've already warned about this field
    const fieldIdentifier = `${input.type}-${input.name}-${input.id}`;
    if (warnedFields.has(fieldIdentifier)) {
      return;
    }

    // Check if input is sensitive
    const sensitivityCategory = checkInputSensitivity(input);
    if (sensitivityCategory) {
      // Get security info
      const security = getSiteSecurityInfo();

      // Create and show warning message with animation and sound
      const message = createWarningMessage(sensitivityCategory, security);
      showSecurityAlert(message);

      // Remember we've warned about this field
      warnedFields.add(fieldIdentifier);

      // Clear the warned field after 5 minutes
      setTimeout(() => {
        warnedFields.delete(fieldIdentifier);
      }, 5 * 60 * 1000);
    }
  };

  // Form submission handler
  const handleFormSubmit = (event) => {
    const security = getSiteSecurityInfo();

    if (!security.isSecure) {
      event.preventDefault();
      showSecurityAlert(
        "⚠️ Wait! This form isn't secure!\n\n" +
          "The information you're sending might not be protected.\n\n" +
          "Please check with an adult before continuing! 🛡️"
      );
    }
  };

  // Add event listeners
  document.addEventListener("focusin", handleInputFocus, true);
  document.addEventListener("submit", handleFormSubmit, true);

  // Return a cleanup function
  return () => {
    document.removeEventListener("focusin", handleInputFocus, true);
    document.removeEventListener("submit", handleFormSubmit, true);
  };
}
