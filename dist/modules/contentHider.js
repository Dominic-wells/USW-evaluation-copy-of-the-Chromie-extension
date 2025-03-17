/**
 * contentHider.js
 * Handles hiding and managing unwanted content on websites
 */

import { showSpeechBubble, hideSpeechBubble } from "./speechUi.js";

/**
 * Plays a sound effect for content hider actions
 * @param {string} soundFile - The name of the sound file in assets/sounds folder
 */
function playContentHiderSound(soundFile) {
  try {
    const audio = new Audio(
      chrome.runtime.getURL(`assets/sounds/${soundFile}`)
    );
    audio.volume = 0.7;
    audio.play().catch((error) => {
      console.error("Failed to play content hider sound:", error);
    });
  } catch (error) {
    console.error("Error playing content hider sound:", error);
  }
}

/**
 * Creates a human-readable description of an element
 * @param {string} path - The DOM path to the element
 * @returns {string} A user-friendly description
 */
function createElementDescription(path) {
  try {
    const element = document.querySelector(path);
    if (!element) {
      return `Element (${path.split(">").pop().trim()})`;
    }

    // Start with element type
    let description = element.tagName.toLowerCase();

    // Add ID if available
    if (element.id) {
      description += ` #${element.id}`;
    }

    // Check for images
    if (element.tagName === "IMG") {
      const altText = element.alt || "Image";
      const imageName = element.src
        ? element.src.split("/").pop().split("?")[0]
        : "";
      return `${altText}${imageName ? ` (${imageName})` : ""}`;
    }

    // Check for headings
    if (element.tagName.match(/^H[1-6]$/)) {
      const content = element.textContent.trim();
      return `Heading: "${content.substring(0, 30)}${
        content.length > 30 ? "..." : ""
      }"`;
    }

    // Check for links
    if (element.tagName === "A") {
      const content = element.textContent.trim() || element.href;
      return `Link: "${content.substring(0, 30)}${
        content.length > 30 ? "..." : ""
      }"`;
    }

    // Check for buttons
    if (
      element.tagName === "BUTTON" ||
      (element.tagName === "INPUT" && element.type === "button")
    ) {
      const content = element.textContent.trim() || element.value || "Button";
      return `Button: "${content.substring(0, 30)}${
        content.length > 30 ? "..." : ""
      }"`;
    }

    // Check for text content
    if (element.textContent) {
      const content = element.textContent.trim();
      if (content && content.length > 0) {
        if (content.length > 40) {
          return `"${content.substring(0, 40)}..."`;
        }
        return `"${content}"`;
      }
    }

    // Check for special elements
    if (element.tagName === "DIV" || element.tagName === "SECTION") {
      // For container elements, check children
      if (element.children.length) {
        // Count children by type
        const childTypes = {};
        Array.from(element.children).forEach((child) => {
          const type = child.tagName.toLowerCase();
          childTypes[type] = (childTypes[type] || 0) + 1;
        });

        const childDescription = Object.entries(childTypes)
          .map(([type, count]) => `${count} ${type}${count > 1 ? "s" : ""}`)
          .join(", ");

        return `Container with ${childDescription}`;
      }
    }

    // Add size information for visual elements
    const rect = element.getBoundingClientRect();
    if (rect.width > 50 || rect.height > 50) {
      if (element.classList && element.classList.length > 0) {
        return `${description}.${element.classList[0]} (${Math.round(
          rect.width
        )}×${Math.round(rect.height)}px)`;
      }
      return `${description} (${Math.round(rect.width)}×${Math.round(
        rect.height
      )}px)`;
    }

    // Add class if available
    if (element.classList && element.classList.length > 0) {
      return `${description}.${element.classList[0]}`;
    }

    // Fallback to basic element description
    return description;
  } catch (error) {
    console.error("Error creating element description:", error);
    return `Element (${path.split(">").pop().trim()})`;
  }
}

// State management
let isHidingMode = false;
let hoveredElement = null;
let hiddenElements = new Map(); // URL -> Set of element paths

// Track active event listeners
let activeListeners = {
  mousemove: null,
  click: null,
  keydown: null,
  contextmenu: null,
};

// DOM Observer for handling page changes
const domObserver = new MutationObserver((mutations) => {
  if (isHidingMode) {
    // Re-apply event listeners to ensure they're active
    removeEventListeners();
    attachEventListeners();
  }
});

/**
 * Export the hiding mode state
 */
export function isInHidingMode() {
  return isHidingMode;
}

/**
 * Attach event listeners with proper capture settings
 */
function attachEventListeners() {
  // Create bound functions that we can reference later for removal
  activeListeners.mousemove = handleMouseMove.bind(this);
  activeListeners.click = handleClick.bind(this);
  activeListeners.keydown = handleKeyDown.bind(this);
  activeListeners.contextmenu = handleContextMenu.bind(this);

  // Attach with capture and higher priority
  document.addEventListener("mousemove", activeListeners.mousemove, {
    capture: true,
    passive: false,
  });
  document.addEventListener("click", activeListeners.click, {
    capture: true,
    passive: false,
  });
  document.addEventListener("keydown", activeListeners.keydown, {
    capture: true,
    passive: false,
  });
  document.addEventListener("contextmenu", activeListeners.contextmenu, {
    capture: true,
    passive: false,
  });

  // Add specific styles to show we're in hiding mode
  document.body.style.cursor = "crosshair";
}

/**
 * Remove all active event listeners
 */
function removeEventListeners() {
  if (activeListeners.mousemove) {
    document.removeEventListener("mousemove", activeListeners.mousemove, {
      capture: true,
    });
    activeListeners.mousemove = null;
  }
  if (activeListeners.click) {
    document.removeEventListener("click", activeListeners.click, {
      capture: true,
    });
    activeListeners.click = null;
  }
  if (activeListeners.keydown) {
    document.removeEventListener("keydown", activeListeners.keydown, {
      capture: true,
    });
    activeListeners.keydown = null;
  }
  if (activeListeners.contextmenu) {
    document.removeEventListener("contextmenu", activeListeners.contextmenu, {
      capture: true,
    });
    activeListeners.contextmenu = null;
  }

  // Reset cursor
  document.body.style.cursor = "";
}

/**
 * Handle keydown events for hiding mode
 */
function handleKeyDown(event) {
  if (event.key === "Escape" && isHidingMode) {
    event.preventDefault();
    event.stopPropagation();
    forceDisableHidingMode();
  }
}

/**
 * Handle right-click events
 */
function handleContextMenu(event) {
  if (isHidingMode) {
    event.preventDefault();
    event.stopPropagation();
    forceDisableHidingMode();
  }
}

/**
 * Force disable hiding mode
 * This will be called from pet.js and when pressing Escape
 */
export function forceDisableHidingMode() {
  if (isHidingMode) {
    cleanupHidingMode();
    setTimeout(() => {
      showSpeechBubble("Content hiding mode disabled!", 3000);
    }, 100);
  }
}

/**
 * Cleanup function for hiding mode
 */
function cleanupHidingMode() {
  // Remove all active listeners
  removeEventListeners();

  // Clean up any highlighted elements
  if (hoveredElement) {
    unhighlightElement(hoveredElement);
    hoveredElement = null;
  }

  // Stop observing DOM changes
  domObserver.disconnect();

  // Reset cursor explicitly
  document.body.style.cursor = "";

  // Reset state
  isHidingMode = false;
}

/**
 * Checks if an element is protected from being hidden
 */
function isProtectedElement(element) {
  const protectedIds = [
    "spacecow-wrapper",
    "speech-bubble-wrapper",
    "spacecow-menu-wrapper",
    "spacecow-pet",
    "speech-bubble",
    "close-button",
  ];

  let current = element;
  while (current) {
    if (current.id && protectedIds.includes(current.id)) {
      return true;
    }
    if (
      current.classList &&
      (current.classList.contains("hidden-element-item") ||
        current.classList.contains("restore-all-button") ||
        current.classList.contains("close-list-button"))
    ) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

/**
 * Gets a unique selector path for an element
 */
function getElementPath(element) {
  const path = [];
  while (element && element.nodeType === Node.ELEMENT_NODE) {
    let selector = element.nodeName.toLowerCase();
    if (element.id) {
      selector += "#" + element.id;
    } else {
      let sib = element;
      let nth = 1;
      while (sib.previousElementSibling) {
        sib = sib.previousElementSibling;
        nth++;
      }
      selector += ":nth-child(" + nth + ")";
    }
    path.unshift(selector);
    element = element.parentNode;
  }
  return path.join(" > ");
}

/**
 * Highlights an element for hiding
 */
function highlightElement(element) {
  if (!element || isProtectedElement(element)) return;

  // Store original styles
  element.dataset.originalOutline = element.style.outline;
  element.dataset.originalCursor = element.style.cursor;

  // Apply highlighting styles
  element.style.outline = "2px dashed red";
  element.style.cursor = "not-allowed";
}

/**
 * Removes highlight from element
 */
function unhighlightElement(element) {
  if (!element) return;

  // Restore original styles
  element.style.outline = element.dataset.originalOutline || "";
  element.style.cursor = element.dataset.originalCursor || "";

  // Clean up dataset
  delete element.dataset.originalOutline;
  delete element.dataset.originalCursor;
}

/**
 * Handles mouse movement in hiding mode
 */
function handleMouseMove(event) {
  if (!isHidingMode) return;

  // Unhighlight previous element
  if (hoveredElement) {
    unhighlightElement(hoveredElement);
  }

  // Find new target element
  hoveredElement = event.target;

  // Don't highlight protected elements
  if (isProtectedElement(hoveredElement)) {
    hoveredElement = null;
    return;
  }

  // Only highlight valid elements
  if (
    hoveredElement &&
    hoveredElement.nodeName !== "BODY" &&
    hoveredElement.nodeName !== "HTML"
  ) {
    highlightElement(hoveredElement);
  }
}

/**
 * Handles clicks in hiding mode
 */
function handleClick(event) {
  // Check for spacecow pet click first, regardless of hiding mode
  if (
    event.target.id === "spacecow-pet" ||
    (event.target.parentElement &&
      event.target.parentElement.id === "spacecow-wrapper")
  ) {
    if (isHidingMode) {
      event.preventDefault();
      event.stopPropagation();
      forceDisableHidingMode();
      return;
    }
  }

  if (!isHidingMode) return;

  // Always prevent default click behavior in hiding mode
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  // Check if clicked element is protected
  if (isProtectedElement(event.target)) {
    // Remove highlight from last element before returning
    if (hoveredElement) {
      unhighlightElement(hoveredElement);
      hoveredElement = null;
    }
    return;
  }

  if (
    hoveredElement &&
    !isProtectedElement(hoveredElement) &&
    hoveredElement.nodeName !== "BODY" &&
    hoveredElement.nodeName !== "HTML"
  ) {
    hideElement(hoveredElement);
  }
}

/**
 * Hides an element and stores its path
 */
async function hideElement(element) {
  if (!element || isProtectedElement(element)) return;

  const path = getElementPath(element);
  const url = window.location.href;

  try {
    const storedData = (await chrome.storage.sync.get("hiddenElements")) || {};
    const urlHidden = storedData.hiddenElements?.[url] || [];

    if (!urlHidden.includes(path)) {
      urlHidden.push(path);
      await chrome.storage.sync.set({
        hiddenElements: {
          ...storedData.hiddenElements,
          [url]: urlHidden,
        },
      });

      element.style.display = "none";
      showSpeechBubble(
        "Content hidden! Click me, press Escape, or right-click to exit hiding mode.",
        3000
      );

      // Play a random deletion sound
      const deletionSounds = [
        "hehe.mp3",
        "laters.mp3",
        "boop.mp3",
        "zap.mp3",
        "pop.mp3",
        "cya.mp3",
        "boop_and_your_gone.mp3",
      ];

      // Pick a random sound
      const randomSound =
        deletionSounds[Math.floor(Math.random() * deletionSounds.length)];
      playContentHiderSound(randomSound);
    }
  } catch (error) {
    console.error("Error storing hidden element:", error);
    showSpeechBubble("Oops! Couldn't save the hidden content.", 3000);
  }
}

/**
 * Toggles content hiding mode
 */
export function toggleHidingMode() {
  isHidingMode = !isHidingMode;

  if (isHidingMode) {
    // Start observing DOM changes
    domObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Attach event listeners
    attachEventListeners();
    showSpeechBubble(
      "Content hiding mode enabled! Click on content to hide it. Press Escape or click me to exit.",
      5000
    );
  } else {
    cleanupHidingMode();
  }

  return isHidingMode;
}

/**
 * Applies hidden elements on page load
 */
export async function applyHiddenElements() {
  const url = window.location.href;
  try {
    const storedData = await chrome.storage.sync.get("hiddenElements");
    const urlHidden = storedData.hiddenElements?.[url] || [];

    urlHidden.forEach((path) => {
      try {
        const element = document.querySelector(path);
        if (element && !isProtectedElement(element)) {
          element.style.display = "none";
        }
      } catch (error) {
        console.error("Error applying hidden element:", error);
      }
    });
  } catch (error) {
    console.error("Error retrieving hidden elements:", error);
  }
}

/**
 * Restores a single hidden element
 */
async function restoreElement(path) {
  try {
    const url = window.location.href;
    const storedData = await chrome.storage.sync.get("hiddenElements");
    let urlHidden = storedData.hiddenElements?.[url] || [];

    urlHidden = urlHidden.filter((p) => p !== path);
    await chrome.storage.sync.set({
      hiddenElements: {
        ...storedData.hiddenElements,
        [url]: urlHidden,
      },
    });

    const element = document.querySelector(path);
    if (element) {
      element.style.display = "";
      showSpeechBubble("Element restored! 🎉", 2000);
      playContentHiderSound("Come_back.mp3");
    }
  } catch (error) {
    console.error("Error restoring element:", error);
    showSpeechBubble("Couldn't restore that element.", 2000);
  }
}

/**
 * Restores all hidden elements
 */
export async function restoreAllElements() {
  try {
    const url = window.location.href;
    const storedData = await chrome.storage.sync.get("hiddenElements");
    const urlHidden = storedData.hiddenElements?.[url] || [];

    for (const path of urlHidden) {
      const element = document.querySelector(path);
      if (element) {
        element.style.display = "";
      }
    }

    await chrome.storage.sync.set({
      hiddenElements: {
        ...storedData.hiddenElements,
        [url]: [],
      },
    });

    showSpeechBubble("All elements restored! 🎉", 3000);
    hideSpeechBubble();

    // Play restoration sound
    playContentHiderSound("Restore.mp3");
  } catch (error) {
    console.error("Error restoring all elements:", error);
    showSpeechBubble("Couldn't restore all elements.", 3000);
  }
}

/**
 * Shows list of hidden elements with restore options
 */
export async function showHiddenElements() {
  const url = window.location.href;
  try {
    const storedData = await chrome.storage.sync.get("hiddenElements");
    const urlHidden = storedData.hiddenElements?.[url] || [];

    if (urlHidden.length === 0) {
      showSpeechBubble("No hidden elements on this page!", 3000);
      return;
    }

    // Generate descriptions for hidden elements
    const elementsWithDescriptions = urlHidden.map((path) => {
      return {
        path,
        description: createElementDescription(path),
      };
    });

    let message = `
        <div style="max-height: 300px; overflow-y: auto;">
            <h3 style="margin-bottom: 10px;">Hidden Elements</h3>
            <div style="margin-bottom: 10px;">Click an item to restore it:</div>
            <div class="hidden-elements-list">
                ${elementsWithDescriptions
                  .map(
                    (item, index) => `
                    <div class="hidden-element-item" 
                         data-path="${item.path}"
                         style="padding: 10px;
                                margin: 6px 0;
                                background: #f0f0f0;
                                border-radius: 4px;
                                cursor: pointer;
                                transition: background-color 0.2s;">
                        <div style="font-weight: bold; margin-bottom: 3px;">
                            ${index + 1}. ${item.description}
                        </div>
                        <div style="font-size: 0.8em; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${item.path.split(">").pop().trim()}
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
            <div style="margin-top: 10px;">
                <button class="restore-all-button"
                        style="background: #4CAF50;
                               color: white;
                               border: none;
                               padding: 8px 16px;
                               border-radius: 4px;
                               cursor: pointer;
                               margin-right: 10px;">
                    Restore All
                </button>
                <button class="close-list-button"
                        style="background: #666;
                               color: white;
                               border: none;
                               padding: 8px 16px;
                               border-radius: 4px;
                               cursor: pointer;">
                    Close
                </button>
            </div>
        </div>`;

    showSpeechBubble(message, null);

    const bubbleWrapper = document.getElementById("speech-bubble-wrapper");
    if (bubbleWrapper && bubbleWrapper.shadowRoot) {
      const shadow = bubbleWrapper.shadowRoot;

      shadow.querySelectorAll(".hidden-element-item").forEach((item) => {
        item.addEventListener("mouseover", () => {
          item.style.backgroundColor = "#e0e0e0";
        });
        item.addEventListener("mouseout", () => {
          item.style.backgroundColor = "#f0f0f0";
        });
        item.addEventListener("click", async () => {
          const path = item.dataset.path;
          await restoreElement(path);
          item.style.opacity = "0.5";
          item.style.cursor = "default";
          item.style.backgroundColor = "#ccc";
        });
      });

      const restoreAllBtn = shadow.querySelector(".restore-all-button");
      if (restoreAllBtn) {
        restoreAllBtn.addEventListener("click", () => restoreAllElements());
      }

      const closeBtn = shadow.querySelector(".close-list-button");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => hideSpeechBubble());
      }
    }
  } catch (error) {
    console.error("Error showing hidden elements:", error);
    showSpeechBubble("Oops! Couldn't retrieve hidden elements.", 3000);
  }
}
