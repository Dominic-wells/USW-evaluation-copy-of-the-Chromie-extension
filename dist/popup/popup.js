/**
 * popup.js
 * Handles popup interface interactions and settings management.
 * * All code follows UK English conventions.
 */

class PopupManager {
  constructor() {
    this.defaultSettings = {
      // Appearance settings
      fontSize: 14,
      fontFamily: "Arial, sans-serif",
      lineSpacing: "1.5",
      textColour: "#333333",
      backgroundColour: "#ffffff",
      highContrast: false,

      // Password settings
      passwordType: "story",
      storyTheme: "space",
      storyComplexity: "simple",

      // Typing monitor settings
      wordCountThreshold: 50,
      typingBreakDuration: 5,
      enableTypingAlerts: true,
      pauseMonitoring: false,

      // Pet state
      isCowHidden: false,
    };

    this.activeTabId = "writing-panel";
    this.saveTimeout = null;
  }

  async initialise() {
    document.addEventListener("DOMContentLoaded", () => {
      // Setup initial tab state
      const defaultTab = document.querySelector('[role="tab"]');
      if (defaultTab) {
        this.switchTab(defaultTab);
      }

      this.setupEventListeners();
      this.loadSettings();
      this.updateNudgeButtonText();

      // Make sure search input is visible and active
      const searchInput = document.getElementById("settingsSearch");
      if (searchInput) {
        searchInput.style.display = "block";
        searchInput.value = "";
        console.log("Search input initialized");
      }
    });
  }

  setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('[role="tab"]').forEach((tab) => {
      tab.addEventListener("click", () => this.switchTab(tab));
      tab.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.switchTab(tab);
        }
      });
    });

    // Search functionality
    const searchInput = document.getElementById("settingsSearch");
    if (searchInput) {
      searchInput.addEventListener("input", (e) =>
        this.filterSettings(e.target.value)
      );
    }

    // Main action buttons
    this.attachButtonListener("nudge-spacecow", () => this.toggleSpacecow());
    this.attachButtonListener("curiosity-tab", () =>
      this.makeSpacecowCurious()
    );
    this.attachButtonListener("showStats", () => this.showTypingStats());
    this.attachButtonListener("saveSettings", () => this.saveSettings());
    this.attachButtonListener("defaultSettings", () =>
      this.resetToDefaultSettings()
    );

    // Setting change listeners
    document.querySelectorAll("input, select").forEach((input) => {
      input.addEventListener("change", () =>
        this.handleSettingChange(input.id)
      );
      if (input.type !== "checkbox") {
        input.addEventListener("input", () => this.debouncedSave());
      }
    });

    // Details elements
    document.querySelectorAll("details").forEach((details) => {
      details.addEventListener("toggle", () => {
        const summary = details.querySelector("summary");
        if (summary) {
          const id = summary.textContent;
          localStorage.setItem(`details-${id}`, details.open);
        }
      });
    });
  }

  switchTab(selectedTab) {
    // Update tab states
    document.querySelectorAll('[role="tab"]').forEach((tab) => {
      const isSelected = tab === selectedTab;
      tab.setAttribute("aria-selected", isSelected);
      tab.classList.toggle("active", isSelected);
    });

    // Get the panel id from the selected tab's aria-controls attribute
    const panelId = selectedTab.getAttribute("aria-controls");

    // Show/hide appropriate panels
    document.querySelectorAll('[role="tabpanel"]').forEach((panel) => {
      const isActive = panel.id === panelId;
      panel.hidden = !isActive;
      panel.classList.toggle("active", isActive);

      if (isActive) {
        this.activeTabId = panel.id;

        // Show all settings in active panel
        panel.querySelectorAll(".setting").forEach((setting) => {
          setting.style.display = "";
        });

        // Show all details in active panel
        panel.querySelectorAll("details").forEach((detail) => {
          detail.style.display = "";
        });
      }
    });
  }

  filterSettings(searchTerm) {
    console.log("Filtering settings with term:", searchTerm);

    // Clear search
    if (!searchTerm || searchTerm.trim() === "") {
      // Reset to default tab view
      this.resetToDefaultTabView();
      return;
    }

    // We have a search term - make ALL panels visible first
    document.querySelectorAll('[role="tabpanel"]').forEach((panel) => {
      panel.hidden = false;
      panel.classList.add("active"); // Make sure it's visible
    });

    // Now search across ALL settings
    searchTerm = searchTerm.toLowerCase().trim();
    let matchFound = false;

    // Query ALL settings across ALL panels
    const allSettings = document.querySelectorAll('[role="tabpanel"] .setting');
    console.log(`Searching across ${allSettings.length} settings`);

    allSettings.forEach((setting) => {
      const text = setting.textContent.toLowerCase();
      const match = text.includes(searchTerm);

      // Set display style directly
      setting.style.display = match ? "" : "none";

      if (match) {
        matchFound = true;
        console.log(`Match found in: ${text.substring(0, 50)}...`);

        // If in a details element, open it
        const details = setting.closest("details");
        if (details) {
          details.open = true;
        }
      }
    });

    // Hide empty details sections
    document.querySelectorAll("details").forEach((details) => {
      const hasVisibleSettings = Array.from(
        details.querySelectorAll(".setting")
      ).some((setting) => setting.style.display !== "none");
      details.style.display = hasVisibleSettings ? "" : "none";
    });

    // Show no results message if needed
    this.showNoResultsMessage(!matchFound, searchTerm);
  }

  // Add this helper method
  resetToDefaultTabView() {
    // Clear any "no results" message
    this.showNoResultsMessage(false);

    // Show all settings (remove any hiding)
    document.querySelectorAll(".setting").forEach((setting) => {
      setting.style.display = "";
    });

    // Restore details elements to their previous state
    document.querySelectorAll("details").forEach((details) => {
      details.style.display = "";
      const summary = details.querySelector("summary");
      if (summary) {
        const id = summary.textContent;
        const wasOpen = localStorage.getItem(`details-${id}`);
        if (wasOpen !== null) {
          details.open = wasOpen === "true";
        }
      }
    });

    // Show only active tab panel
    const activeTab = document.querySelector(
      '[role="tab"][aria-selected="true"]'
    );
    if (activeTab) {
      const panelId = activeTab.getAttribute("aria-controls");

      document.querySelectorAll('[role="tabpanel"]').forEach((panel) => {
        const isActive = panel.id === panelId;
        panel.hidden = !isActive;
        panel.classList.toggle("active", isActive);
      });
    }
  }

  // Add this helper method to handle the no results message
  showNoResultsMessage(show, searchTerm = "") {
    const existingMessage = document.getElementById("no-search-results");

    if (show) {
      if (!existingMessage) {
        const message = document.createElement("div");
        message.id = "no-search-results";
        message.textContent = `No settings match "${searchTerm}"`;
        message.style.padding = "10px";
        message.style.color = "#666";
        message.style.textAlign = "center";
        message.style.fontStyle = "italic";

        // Add to first visible panel
        const firstPanel = document.querySelector(
          '[role="tabpanel"]:not([hidden])'
        );
        if (firstPanel) {
          firstPanel.appendChild(message);
        }
      }
    } else if (existingMessage) {
      existingMessage.remove();
    }
  }

  showAllSettings() {
    document.querySelectorAll(".setting").forEach((setting) => {
      setting.style.display = "";
    });

    document.querySelectorAll("details").forEach((details) => {
      details.style.display = "";
      // Restore previous open state
      const summary = details.querySelector("summary");
      if (summary) {
        const id = summary.textContent;
        const wasOpen = localStorage.getItem(`details-${id}`);
        if (wasOpen !== null) {
          details.open = wasOpen === "true";
        }
      }
    });
  }

  async toggleSpacecow() {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab) return;

      const settings = await chrome.storage.sync.get({ isCowHidden: false });
      const action = settings.isCowHidden ? "showSpacecow" : "hideSpacecow";

      try {
        // Use the promise-based approach to prevent channel closing
        await new Promise((resolve, reject) => {
          chrome.tabs.sendMessage(tab.id, { action }, (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          });
        });
      } catch (error) {
        if (error.message.includes("Receiving end does not exist")) {
          // Inject content script
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content/content.js"],
          });
          // Retry message with proper promise handling
          await new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tab.id, { action }, (response) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(response);
              }
            });
          });
        } else {
          throw error;
        }
      }

      await chrome.storage.sync.set({ isCowHidden: !settings.isCowHidden });
      this.updateNudgeButtonText();
    } catch (error) {
      console.error("Error toggling spacecow:", error);
      this.showMessage("Cannot access this page. Try refreshing!", "error");
    }
  }

  updateNudgeButtonText() {
    const button = document.getElementById("nudge-spacecow");
    if (button) {
      chrome.storage.sync.get({ isCowHidden: false }, (settings) => {
        button.textContent = settings.isCowHidden
          ? "Show Spacecow"
          : "Hide Spacecow";
      });
    }
  }

  async makeSpacecowCurious() {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab) {
        // Use the promise-based approach to prevent channel closing
        await new Promise((resolve, reject) => {
          chrome.tabs.sendMessage(
            tab.id,
            { action: "makeSpacecowCurious" },
            (response) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(response);
              }
            }
          );
        });
      }
    } catch (error) {
      console.error("Error making spacecow curious:", error);
      if (error.message.includes("Receiving end does not exist")) {
        // Try to inject content script
        try {
          const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
          });
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content/content.js"],
          });
          // Retry the message
          await new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(
              tab.id,
              { action: "makeSpacecowCurious" },
              (response) => {
                if (chrome.runtime.lastError) {
                  reject(chrome.runtime.lastError);
                } else {
                  resolve(response);
                }
              }
            );
          });
        } catch (injectionError) {
          this.showMessage(
            "Cannot communicate with spacecow. Try refreshing!",
            "error"
          );
        }
      } else {
        this.showMessage(
          "Cannot communicate with spacecow. Try refreshing!",
          "error"
        );
      }
    }
  }

  async showTypingStats() {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab) {
        // Use the promise-based approach to prevent channel closing
        await new Promise((resolve, reject) => {
          chrome.tabs.sendMessage(
            tab.id,
            { action: "showWritingStats" },
            (response) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(response);
              }
            }
          );
        });
      }
    } catch (error) {
      console.error("Error showing stats:", error);
      if (error.message.includes("Receiving end does not exist")) {
        // Try to inject content script
        try {
          const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
          });
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content/content.js"],
          });
          // Retry the message
          await new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(
              tab.id,
              { action: "showWritingStats" },
              (response) => {
                if (chrome.runtime.lastError) {
                  reject(chrome.runtime.lastError);
                } else {
                  resolve(response);
                }
              }
            );
          });
        } catch (injectionError) {
          this.showMessage("Cannot show stats. Try refreshing!", "error");
        }
      } else {
        this.showMessage("Cannot show stats. Try refreshing!", "error");
      }
    }
  }

  debouncedSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveSettings();
    }, 500);
  }

  async loadSettings() {
    try {
      const settings = await chrome.storage.sync.get(this.defaultSettings);

      Object.entries(settings).forEach(([key, value]) => {
        const element = document.getElementById(key);
        if (element) {
          if (element.type === "checkbox") {
            element.checked = value;
          } else if (element.type === "color") {
            // Ensure color values are in hex format
            element.value = value.startsWith("#") ? value : "#" + value;
          } else {
            element.value = value;
          }
        }
      });

      this.updateUIStates(settings);
    } catch (error) {
      console.error("Error loading settings:", error);
      this.showMessage("Error loading settings", "error");
    }
  }

  async saveSettings() {
    try {
      const settings = this.gatherCurrentSettings();
      if (!this.validateSettings(settings)) return;

      await chrome.storage.sync.set(settings);
      await this.applySettingsToActiveTab(settings);

      this.showMessage("Settings saved", "success");
    } catch (error) {
      console.error("Error saving settings:", error);
      this.showMessage("Error saving settings", "error");
    }
  }

  validateSettings(settings) {
    const errors = [];

    if (settings.fontSize < 8 || settings.fontSize > 24) {
      errors.push("Font size must be between 8 and 24 pixels");
    }

    if (
      settings.wordCountThreshold < 10 ||
      settings.wordCountThreshold > 1000
    ) {
      errors.push("Word count threshold must be between 10 and 1000");
    }

    if (settings.typingBreakDuration < 1 || settings.typingBreakDuration > 60) {
      errors.push("Break duration must be between 1 and 60 minutes");
    }

    if (errors.length > 0) {
      this.showMessage(errors[0], "error");
      return false;
    }

    return true;
  }

  gatherCurrentSettings() {
    const settings = {};
    Object.keys(this.defaultSettings).forEach((key) => {
      const element = document.getElementById(key);
      if (element) {
        if (element.type === "checkbox") {
          settings[key] = element.checked;
        } else if (element.type === "color") {
          // Ensure color values are saved consistently
          settings[key] = element.value.toLowerCase();
        } else {
          settings[key] = element.value;
        }
      }
    });
    return settings;
  }

  async applySettingsToActiveTab(settings) {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab) {
        // Use the promise-based approach to prevent channel closing
        await new Promise((resolve, reject) => {
          chrome.tabs.sendMessage(
            tab.id,
            {
              action: "applyAccessibilitySettings",
              settings: settings,
            },
            (response) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(response);
              }
            }
          );
        });
      }
    } catch (error) {
      console.error("Error applying settings:", error);
      if (error.message.includes("Receiving end does not exist")) {
        // Don't show error as this is a common case when settings are changed
        // without an active tab that supports the extension
      } else {
        this.showMessage("Error applying settings.", "error");
      }
    }
  }

  resetToDefaultSettings() {
    Object.entries(this.defaultSettings).forEach(([key, value]) => {
      const element = document.getElementById(key);
      if (element) {
        if (element.type === "checkbox") {
          element.checked = value;
        } else if (element.type === "color") {
          element.value = value.startsWith("#") ? value : "#" + value;
        } else {
          element.value = value;
        }
      }
    });
    this.saveSettings();
  }

  handleSettingChange(settingId) {
    const element = document.getElementById(settingId);
    if (!element) return;

    // Special handling for certain settings
    switch (settingId) {
      case "highContrast":
        document.body.classList.toggle("high-contrast-mode", element.checked);
        break;
      case "pauseMonitoring":
        const label = document.querySelector(`label[for="${settingId}"]`);
        if (label) {
          const helpText = label.querySelector(".help-text");
          if (helpText) {
            helpText.textContent = element.checked
              ? "Resume tracking writing activity"
              : "Temporarily stop writing monitoring";
          }
        }
        break;
      case "passwordType":
        const storySettings = document.getElementById("storySettings");
        if (storySettings) {
          storySettings.style.display =
            element.value === "story" ? "block" : "none";
        }
        break;
    }

    // Save settings
    if (element.type === "checkbox" || element.type === "color") {
      this.saveSettings();
    }
  }

  updateUIStates(settings) {
    // High contrast mode
    if (settings.highContrast) {
      document.body.classList.add("high-contrast-mode");
    }

    // Story password settings
    const storySettings = document.getElementById("storySettings");
    if (storySettings) {
      storySettings.style.display =
        settings.passwordType === "story" ? "block" : "none";
    }

    // Restore details states
    document.querySelectorAll("details").forEach((details) => {
      const summary = details.querySelector("summary");
      if (summary) {
        const id = summary.textContent;
        const wasOpen = localStorage.getItem(`details-${id}`);
        if (wasOpen !== null) {
          details.open = wasOpen === "true";
        }
      }
    });
  }

  showMessage(message, type = "success") {
    const container = document.getElementById("statusMessages");
    if (!container) return;

    const messageElement = document.createElement("div");
    messageElement.className = `status-message ${type}`;
    messageElement.textContent = message;
    messageElement.setAttribute("role", "status");

    container.appendChild(messageElement);

    // Remove old messages
    Array.from(container.children)
      .slice(0, -1)
      .forEach((child) => child.remove());

    // Remove this message after delay
    setTimeout(() => messageElement.remove(), 3000);
  }

  attachButtonListener(id, handler) {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener("click", handler.bind(this));
    }
  }
}

// Initialize the popup
const popupManager = new PopupManager();
popupManager.initialise();
