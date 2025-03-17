/**
 * contentAnalysis.js
 * Enhanced webpage analysis module focused on child safety.
 * Analyses page content for potential risks and safety concerns.
 * * All code follows UK English conventions.*
 */

import { showSpeechBubble } from "./speechUi.js";

// Known risky domains and patterns
const RISKY_PATTERNS = {
  socialMedia: [
    "facebook.com",
    "x.com",
    "instagram.com",
    "tiktok.com",
    "snapchat.com",
    "reddit.com",
    "discord.com",
  ],
  adultContent: ["mature", "adult", "dating", "gambling", "casino"],
  sensitiveInfo: [
    "credit card",
    "address",
    "telephone",
    "mobile",
    "age",
    "birthday",
    "school",
    "location",
    "home address",
    "postcode",
  ],
  downloadRisks: [".exe", ".msi", ".dmg", ".apk", ".bat", ".cmd"],
};

/**
 * Checks if the current page utilises secure connection (HTTPS)
 */
function isSecureConnection() {
  return window.location.protocol === "https:";
}

/**
 * Analyses forms for sensitive information requests
 */
function analyseForms() {
  const forms = document.querySelectorAll("form");
  const sensitiveFields = [];

  forms.forEach((form) => {
    const inputs = form.querySelectorAll("input");
    inputs.forEach((input) => {
      const inputType = input.type.toLowerCase();
      const inputName = (input.name || "").toLowerCase();
      const placeholder = (input.placeholder || "").toLowerCase();
      const label = input.labels?.[0]?.textContent.toLowerCase() || "";

      // Check for sensitive information fields
      if (["text", "tel", "number", "email"].includes(inputType)) {
        RISKY_PATTERNS.sensitiveInfo.forEach((pattern) => {
          if (
            inputName.includes(pattern) ||
            placeholder.includes(pattern) ||
            label.includes(pattern)
          ) {
            sensitiveFields.push(pattern);
          }
        });
      }
    });
  });

  return sensitiveFields;
}

/**
 * Analyses links for potential risks
 */
function analyseLinks() {
  const links = document.querySelectorAll("a");
  const riskyLinks = {
    externalLinks: 0,
    downloadLinks: 0,
    socialMediaLinks: 0,
    unsecureLinks: 0,
    riskyDomains: new Set(),
  };

  links.forEach((link) => {
    const href = link.href.toLowerCase();

    // Check if external link
    if (href.startsWith("http") && !href.includes(window.location.hostname)) {
      riskyLinks.externalLinks++;

      // Check for downloads
      if (RISKY_PATTERNS.downloadRisks.some((ext) => href.endsWith(ext))) {
        riskyLinks.downloadLinks++;
      }

      // Check for social media
      if (RISKY_PATTERNS.socialMedia.some((domain) => href.includes(domain))) {
        riskyLinks.socialMediaLinks++;
        riskyLinks.riskyDomains.add(href);
      }

      // Check for unsecure links
      if (href.startsWith("http://")) {
        riskyLinks.unsecureLinks++;
      }
    }
  });

  return riskyLinks;
}

/**
 * Analyses images for potential issues
 */
function analyseImages() {
  const images = document.querySelectorAll("img");
  const imageAnalysis = {
    total: images.length,
    missingAlt: 0,
    largeImages: 0,
    externalImages: 0,
  };

  images.forEach((img) => {
    // Check for missing alt text
    if (!img.alt) {
      imageAnalysis.missingAlt++;
    }

    // Check for large images that might be inappropriate
    if (img.width > 500 && img.height > 500) {
      imageAnalysis.largeImages++;
    }

    // Check for external images
    if (
      img.src.startsWith("http") &&
      !img.src.includes(window.location.hostname)
    ) {
      imageAnalysis.externalImages++;
    }
  });

  return imageAnalysis;
}

/**
 * Analyses text content for concerning keywords
 */
function analyseTextContent() {
  const bodyText = document.body.textContent.toLowerCase();
  const concerns = {
    adultContent: false,
    sensitiveInfo: false,
    keywords: new Set(),
  };

  // Check for adult content keywords
  RISKY_PATTERNS.adultContent.forEach((keyword) => {
    if (bodyText.includes(keyword)) {
      concerns.adultContent = true;
      concerns.keywords.add(keyword);
    }
  });

  // Check for sensitive information requests
  RISKY_PATTERNS.sensitiveInfo.forEach((keyword) => {
    if (bodyText.includes(keyword)) {
      concerns.sensitiveInfo = true;
      concerns.keywords.add(keyword);
    }
  });

  return concerns;
}

/**
 * Generates safety tips based on analysis
 */
function generateSafetyTips(analysis) {
  const tips = [];

  // Connection security
  if (!analysis.isSecure) {
    tips.push(
      "🔒 I say, this website isn't using secure HTTPS - be extra careful about sharing any information!"
    );
  }

  // Form safety
  if (analysis.sensitiveFields.length > 0) {
    tips.push(
      "📝 This page asks for personal details - best check with a grown-up before sharing anything!"
    );
  }

  // Link safety
  if (analysis.links.downloadLinks > 0) {
    tips.push(
      "⚠️ Mind those download links - always ask a grown-up before downloading anything!"
    );
  }
  if (analysis.links.socialMediaLinks > 0) {
    tips.push(
      "👥 I've spotted social media links - be careful when chatting with others online!"
    );
  }
  if (analysis.links.unsecureLinks > 0) {
    tips.push(
      "🔓 Some links aren't properly secure - be careful when clicking, please!"
    );
  }

  // Content warnings
  if (analysis.textConcerns.adultContent) {
    tips.push(
      "⚠️ This page might have grown-up content - best to have a chat with an adult!"
    );
  }
  if (analysis.textConcerns.sensitiveInfo) {
    tips.push("🛡️ Be careful about sharing personal details on this page!");
  }

  return tips;
}

/**
 * Main analysis function
 */
export async function analysePage() {
  try {
    // Perform comprehensive analysis
    const analysis = {
      isSecure: isSecureConnection(),
      sensitiveFields: analyseForms(),
      links: analyseLinks(),
      images: analyseImages(),
      textConcerns: analyseTextContent(),
    };

    // Generate safety tips
    const safetyTips = generateSafetyTips(analysis);

    // Construct friendly message
    let observation = "Moo! Let me help keep you safe and sound! 🐮\n\n";

    // Add safety tips
    if (safetyTips.length > 0) {
      observation += "Here's what you ought to know:\n";
      safetyTips.forEach((tip) => {
        observation += `${tip}\n`;
      });
      observation += "\n";
    }

    // Add page statistics
    observation += "Page Overview:\n";
    observation += `📄 Links: ${analysis.links.externalLinks} external links\n`;
    observation += `🖼️ Images: ${analysis.images.total} images\n`;
    observation += `📝 Forms: ${analysis.sensitiveFields.length} forms requesting information\n`;

    // Set display duration based on content length
    const duration = Math.max(8000, safetyTips.length * 3000);

    // Display the observation
    setTimeout(() => {
      showSpeechBubble(observation, duration);
    }, 2000);
  } catch (error) {
    console.error("Error analysing page:", error);
    showSpeechBubble(
      "Oh dear! I had a spot of bother checking this page. Do be extra careful! 🛡️",
      5000
    );
  }
}
