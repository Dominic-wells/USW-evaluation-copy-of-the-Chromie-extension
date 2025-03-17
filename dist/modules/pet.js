/**
 * pet.js
 * Handles the creation and interaction of the spacecow pet element.
 * With direct style animation for better compatibility
 * All code follows UK English conventions.
 */

import { showSpeechBubble, hideSpeechBubble } from "./speechUi.js";
import { showContextMenu } from "./contextMenu.js";
import {
  toggleHidingMode,
  isInHidingMode,
  forceDisableHidingMode,
} from "./contentHider.js";

// State management
let wrapper = null;
let petElement = null;
let isDragging = false;
let offsetX = 0;
let offsetY = 0;
let didMove = false;
let lastPosition = { x: 100, y: 100 };
let isAnimating = false;
let isHidden = false;
let isTemporarilyVisible = false;
let temporaryShowTimer = null;
let animationInterval = null;
let animationStepTimer = null;

/**
 * Creates the spacecow pet element
 */
function createPet() {
  wrapper = document.createElement("div");
  wrapper.id = "spacecow-wrapper";
  const shadow = wrapper.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
    #spacecow-pet {
        position: fixed;
        width: 100px;
        height: 100px;
        cursor: pointer;
        z-index: 10000;
        user-select: none;
        left: ${lastPosition.x}px;
        top: ${lastPosition.y}px;
        pointer-events: auto;
        will-change: transform;
    }

    #spacecow-pet.dragging {
        cursor: grabbing;
    }

    .appear-pet {
        animation: spacecow-appear 0.5s ease-out forwards;
        display: block !important;
        opacity: 1 !important;
        pointer-events: auto !important;
    }

    .disappear-pet {
        animation: spacecow-disappear 0.5s ease-out forwards;
        pointer-events: none !important;
    }

    @keyframes spacecow-appear {
        0% {
            opacity: 0;
            transform: translateY(-50px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes spacecow-disappear {
        0% {
            opacity: 1;
            transform: translateY(0);
        }
        100% {
            opacity: 0;
            transform: translateY(50px);
        }
    }

    .concern-animation {
        animation: spacecow-concern 2s ease-in-out;
        transform-origin: center bottom;
    }

    @keyframes spacecow-concern {
        0% { transform: rotate(0deg) translateY(0); }
        25% { transform: rotate(-5deg) translateY(-5px); }
        50% { transform: rotate(0deg) translateY(-7px); }
        75% { transform: rotate(5deg) translateY(-5px); }
        100% { transform: rotate(0deg) translateY(0); }
    }
  `;

  petElement = document.createElement("img");
  petElement.src = chrome.runtime.getURL("assets/spacecow.png");
  petElement.id = "spacecow-pet";
  petElement.setAttribute("draggable", "false");
  petElement.setAttribute("role", "img");
  petElement.setAttribute("aria-label", "Interactive spacecow pet");

  petElement.style.left = `${lastPosition.x}px`;
  petElement.style.top = `${lastPosition.y}px`;

  shadow.appendChild(style);
  shadow.appendChild(petElement);
  document.body.appendChild(wrapper);

  return petElement;
}

function updateUIPositions(x, y) {
  requestAnimationFrame(() => {
    const bubbleWrapper = document.getElementById("speech-bubble-wrapper");
    const menuWrapper = document.getElementById("spacecow-menu-wrapper");

    if (bubbleWrapper) {
      const shadow = bubbleWrapper.shadowRoot;
      const speechBubble = shadow.getElementById("speech-bubble");
      if (speechBubble && speechBubble.style.display !== "none") {
        const newX = x + 110;
        if (newX + speechBubble.offsetWidth > window.innerWidth) {
          speechBubble.style.left = `${x - speechBubble.offsetWidth - 10}px`;
          speechBubble.classList.add("left");
        } else {
          speechBubble.style.left = `${newX}px`;
          speechBubble.classList.remove("left");
        }
        speechBubble.style.top = `${y}px`;
      }
    }

    if (menuWrapper) {
      const shadow = menuWrapper.shadowRoot;
      const contextMenu = shadow.getElementById("spacecow-context-menu");
      if (contextMenu && contextMenu.style.display !== "none") {
        const menuRect = contextMenu.getBoundingClientRect();
        let menuX = x + 110;
        let menuY = y;

        if (menuX + menuRect.width > window.innerWidth) {
          menuX = x - menuRect.width - 10;
        }
        if (menuY + menuRect.height > window.innerHeight) {
          menuY = window.innerHeight - menuRect.height - 10;
        }

        contextMenu.style.left = `${menuX}px`;
        contextMenu.style.top = `${menuY}px`;
      }
    }
  });
}

function addPetEventListeners() {
  if (!petElement) return;

  // Remove existing listeners first to prevent duplicates
  petElement.removeEventListener("mousedown", onMouseDown);
  petElement.removeEventListener("click", onClick);
  petElement.removeEventListener("contextmenu", onContextMenu);

  // Add fresh listeners
  petElement.addEventListener("mousedown", onMouseDown);
  petElement.addEventListener("click", onClick);
  petElement.addEventListener("contextmenu", onContextMenu);
  petElement.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });
}

function onMouseDown(event) {
  if (event.button !== 0) return;
  event.stopPropagation();

  isDragging = true;
  isAnimating = false;

  // Stop any animation in progress
  if (animationStepTimer) {
    clearTimeout(animationStepTimer);
    animationStepTimer = null;
  }

  const rect = petElement.getBoundingClientRect();
  offsetX = event.clientX - rect.left;
  offsetY = event.clientY - rect.top;

  petElement.style.transition = "none";
  petElement.style.transform = "none";
  petElement.classList.add("dragging");

  document.addEventListener("mousemove", onMouseMove, { passive: true });
  document.addEventListener("mouseup", onMouseUp);
}

function onMouseMove(event) {
  if (!isDragging) return;

  requestAnimationFrame(() => {
    const rect = petElement.getBoundingClientRect();
    const petWidth = rect.width;
    const petHeight = rect.height;

    const x = Math.max(
      0,
      Math.min(window.innerWidth - petWidth, event.clientX - offsetX)
    );
    const y = Math.max(
      0,
      Math.min(window.innerHeight - petHeight, event.clientY - offsetY)
    );

    petElement.style.left = `${x}px`;
    petElement.style.top = `${y}px`;

    lastPosition = { x, y };
    didMove = true;

    updateUIPositions(x, y);
  });
}

function onMouseUp() {
  isDragging = false;
  petElement.classList.remove("dragging");

  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);

  setTimeout(() => {
    didMove = false;
  }, 50);
}

// At the top of your file with other state variables
let lastClickTime = 0;
const CLICK_COOLDOWN = 3000; // 3 seconds cooldown between clicks

// Define tips and their associated sound files
const cyberSafetyTips = [
  {
    text: "Always keep your personal information private online!",
    sound: "tip_personal_info.mp3",
  },
  {
    text: "Never share your password with friends, even your best ones!",
    sound: "tip_password.mp3",
  },
  {
    text: "If something online feels wrong or scary, tell a grown-up right away!",
    sound: "tip_tell_adult.mp3",
  },
  {
    text: "Think before you click on links or download files!",
    sound: "tip_think_before_click.mp3",
  },
  {
    text: "Be kind in online games and chats - treat others how you'd like to be treated!",
    sound: "tip_be_kind.mp3",
  },
  {
    text: "Remember that not everyone online is who they say they are.",
    sound: "tip_online_identity.mp3",
  },
  {
    text: "Ask permission before sharing photos of yourself or others online.",
    sound: "tip_photo_permission.mp3",
  },
  {
    text: "Websites asking for your name, age, or address need a grown-up's help!",
    sound: "tip_personal_data.mp3",
  },
  {
    text: "Take regular breaks from screens to rest your eyes and move around!",
    sound: "tip_screen_breaks.mp3",
  },
  {
    text: "Double-check before sharing - once it's online, it's hard to take back!",
    sound: "tip_think_before_sharing.mp3",
  },
  {
    text: "You know, Not everything you read online is true!",
    sound: "tip_fact_check.mp3",
  },
  {
    text: "What's my line again? oh, right  Moooo!",
    sound: "What s my line again.mp3",
  },
];

// Modified playSound function to accept a filename
function playTipSound(soundFile) {
  const audio = new Audio(chrome.runtime.getURL(`assets/tips/${soundFile}`));
  audio.volume = 0.5;
  audio.play().catch((err) => console.error("Audio playback failed:", err));
}

function onClick(event) {
  event.preventDefault();
  event.stopPropagation();

  // Only process click if we haven't dragged
  if (!didMove) {
    // Check for click cooldown to prevent spam
    const currentTime = Date.now();
    if (currentTime - lastClickTime < CLICK_COOLDOWN) {
      // Visual feedback for cooldown
      if (petElement) {
        petElement.style.opacity = "0.7";
        setTimeout(() => {
          petElement.style.opacity = "1";
        }, 300);
      }
      return; // Ignore clicks during cooldown
    }
    lastClickTime = currentTime;

    // Always check and force disable hiding mode first
    if (isInHidingMode()) {
      forceDisableHidingMode();
      hideSpeechBubble(); // Ensure speech bubble is hidden
      setTimeout(() => {
        showSpeechBubble("Content hiding mode disabled!", 3000);
      }, 100);
      return;
    }

    // Show a random cyber safety tip with corresponding sound
    const randomTip =
      cyberSafetyTips[Math.floor(Math.random() * cyberSafetyTips.length)];
    showSpeechBubble(randomTip.text, 4000);
    playTipSound(randomTip.sound);
  }
}

function onContextMenu(event) {
  event.preventDefault();
  event.stopPropagation();
  const rect = petElement.getBoundingClientRect();
  showContextMenu(rect.right + 10, rect.top);
}

function playSound() {
  const audio = new Audio(chrome.runtime.getURL("assets/spacecowSound.mp3"));
  audio.play().catch((err) => console.error("Audio play failed:", err));
}

// Using direct style manipulation for animation
function randomMovePet() {
  console.log("Animation check:", {
    isDragging,
    isHidden,
    isAnimating,
    isTemporarilyVisible,
    hasElement: !!petElement,
  });

  // Only animate if all conditions are met
  if (
    !isDragging &&
    petElement &&
    !isAnimating &&
    !isHidden &&
    !isTemporarilyVisible
  ) {
    console.log("Starting animation using direct style");
    isAnimating = true;

    // Clean up any existing animation classes and reset timers
    if (animationStepTimer) {
      clearTimeout(animationStepTimer);
    }

    petElement.classList.remove("appear-pet", "disappear-pet", "dragging");

    // Set up the transition
    petElement.style.transition = "transform 1.25s ease-in-out";
    petElement.style.transform = "translateY(0px) rotate(0deg)";

    // Force reflow
    void petElement.offsetWidth;

    // This is how we make the cow move
    // 4-step animation sequence
    // Step 1: Move up with slight rotation
    requestAnimationFrame(() => {
      petElement.style.transform = "translateY(-30px) rotate(5deg)";

      // Step 2: Return to center
      animationStepTimer = setTimeout(() => {
        petElement.style.transform = "translateY(0px) rotate(0deg)";
        console.log("Animation step 2");

        // Step 3: Move down with opposite rotation
        animationStepTimer = setTimeout(() => {
          petElement.style.transform = "translateY(30px) rotate(-5deg)";
          console.log("Animation step 3");

          // Step 4: Return to center
          animationStepTimer = setTimeout(() => {
            petElement.style.transform = "translateY(0px) rotate(0deg)";
            console.log("Animation step 4");

            // End of animation
            animationStepTimer = setTimeout(() => {
              petElement.style.transition = "none";
              isAnimating = false;
              console.log("Animation complete");
            }, 1250);
          }, 1250);
        }, 1250);
      }, 1250);

      console.log("Animation step 1");
    });
  }
}

export function hideSpacecow() {
  if (petElement) {
    // Stop any animation in progress
    if (animationStepTimer) {
      clearTimeout(animationStepTimer);
      animationStepTimer = null;
    }

    // Clear animation interval
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = null;
    }

    // Clear any temporary visibility state
    if (temporaryShowTimer) {
      clearTimeout(temporaryShowTimer);
      temporaryShowTimer = null;
    }

    // Save current state
    const currentPosition = {
      x: parseInt(petElement.style.left) || lastPosition.x,
      y: parseInt(petElement.style.top) || lastPosition.y,
    };
    lastPosition = currentPosition;

    // Only show message if not temporary
    if (!isTemporarilyVisible) {
      showSpeechBubble("Okay, off to find some cookies! 🍪", 2000);
    } else {
      // If temporary, hide speech bubble immediately
      hideSpeechBubble();
    }

    setTimeout(() => {
      petElement.style.transition = "none";
      petElement.style.transform = "none";
      petElement.classList.remove("appear-pet");
      void petElement.offsetWidth;
      petElement.classList.add("disappear-pet");

      setTimeout(() => {
        isHidden = true;
        isTemporarilyVisible = false;
        isDragging = false; // Reset drag state
        petElement.style.display = "none";
        petElement.classList.remove("disappear-pet");
        hideSpeechBubble(); // Ensure speech bubble is hidden
      }, 500);
    }, 2000);
  }
}

export function temporarilyShowCow(duration) {
  if (!petElement) return;

  if (temporaryShowTimer) {
    clearTimeout(temporaryShowTimer);
  }

  // Reset state for temporary visibility
  isTemporarilyVisible = true;
  isDragging = false; // Reset drag state
  isAnimating = false;

  // Stop any animation in progress
  if (animationStepTimer) {
    clearTimeout(animationStepTimer);
    animationStepTimer = null;
  }

  // Enable interactions during temporary visibility
  petElement.style.cssText = `
    display: block !important;
    opacity: 1 !important;
    transform: none !important;
    left: ${lastPosition.x}px !important;
    top: ${lastPosition.y}px !important;
    position: fixed !important;
    width: 100px !important;
    height: 100px !important;
    z-index: 10000 !important;
    pointer-events: auto !important;
    cursor: pointer !important;
    transition: none !important;
  `;

  petElement.classList.remove("disappear-pet");
  void petElement.offsetWidth;
  petElement.classList.add("appear-pet");

  updateUIPositions(lastPosition.x, lastPosition.y);

  // Add proper event listeners for temporary visibility
  if (!petElement.hasEventListener) {
    addPetEventListeners();
    petElement.hasEventListener = true;
  }

  // Shorter duration for temporary visibility
  const displayDuration = Math.min(duration, 8000); // Cap at 8 seconds

  temporaryShowTimer = setTimeout(() => {
    if (isHidden) {
      // Hide speech bubble first
      hideSpeechBubble();

      // Then hide cow
      petElement.classList.remove("appear-pet");
      petElement.style.transition = "none";
      petElement.style.transform = "none";
      void petElement.offsetWidth;
      petElement.classList.add("disappear-pet");

      setTimeout(() => {
        if (isHidden) {
          petElement.style.display = "none";
          petElement.classList.remove("disappear-pet");
        }
        isTemporarilyVisible = false;
        isDragging = false; // Reset drag state again
      }, 500);
    }
  }, displayDuration);
}

export function showSpacecow() {
  if (petElement && (isHidden || isTemporarilyVisible)) {
    if (temporaryShowTimer) {
      clearTimeout(temporaryShowTimer);
      temporaryShowTimer = null;
    }

    // Stop any animation in progress
    if (animationStepTimer) {
      clearTimeout(animationStepTimer);
      animationStepTimer = null;
    }

    // Reset the cow state completely
    isHidden = false;
    isTemporarilyVisible = false;
    isAnimating = false;

    // Make sure the pet is visible and in the correct position
    petElement.style.cssText = `
      display: block !important;
      opacity: 1 !important;
      transform: none !important;
      left: ${lastPosition.x}px !important;
      top: ${lastPosition.y}px !important;
      position: fixed !important;
      width: 100px !important;
      height: 100px !important;
      z-index: 10000 !important;
      pointer-events: auto !important;
      cursor: pointer !important;
      transition: none !important;
    `;

    petElement.classList.remove("disappear-pet");
    void petElement.offsetWidth;
    petElement.classList.add("appear-pet");

    // Show welcome message
    setTimeout(() => {
      showSpeechBubble("I'mmm back, adventurer! 🐮✨", 3000);
      petElement.classList.remove("appear-pet");

      // Try moving the cow immediately to confirm it's working
      console.log("Testing immediate movement");
      petElement.style.transition = "transform 0.3s ease";
      petElement.style.transform = "translateY(-20px)";

      setTimeout(() => {
        petElement.style.transform = "translateY(0)";

        // Restart animation cycle
        setTimeout(() => {
          console.log("Forcing animation cycle");
          // Force the first animation
          randomMovePet();

          // Restart the interval for subsequent animations
          if (animationInterval) {
            clearInterval(animationInterval);
          }
          animationInterval = setInterval(randomMovePet, 20000);
        }, 800);
      }, 300);
    }, 500);
  }
}

export function initialisePet() {
  createPet();
  addPetEventListeners();

  // Clear any existing interval and timers
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = null;
  }

  if (animationStepTimer) {
    clearTimeout(animationStepTimer);
    animationStepTimer = null;
  }

  // Start with one animation after a short delay
  console.log("Initializing pet with animation");
  setTimeout(() => {
    randomMovePet();
    // Then set up the regular interval
    animationInterval = setInterval(randomMovePet, 20000);
  }, 1000);
}

export function getPet() {
  return petElement;
}

export function getPetWrapper() {
  return wrapper;
}

export function isHiddenState() {
  return isHidden;
}
