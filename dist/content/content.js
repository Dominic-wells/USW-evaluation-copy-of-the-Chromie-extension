(function(){"use strict";function nt(){try{const e="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";let t="";for(let r=0;r<12;r++){const n=Math.floor(Math.random()*e.length);t+=e.charAt(n)}return displayGeneratedPassword(t),t}catch(e){return console.error("Error generating standard password:",e),d("Oops! Something went wrong while generating the password."),null}}class rt{constructor(){this.wordLists={},this.themeTemplates={space:{simple:["The {colour} {character} discovered a {object} on the {place}.","An {character} traveled to the {place} carrying a {colour} {object}.","While exploring the {place}, the {character} found a {colour} {object}.","The {character} used a {colour} {object} to navigate the {place}."],advanced:["The {character} {action} carefully with the {colour} {object} while exploring the distant {place}.","After finding a {colour} {object}, the {character} {action} across the mysterious {place}.","The brave {character} {action} to the {place} using only a {colour} {object} as a guide.","Using the {colour} {object}, the clever {character} managed to {action} around the {place}."]},magic:{simple:["The {colour} {character} enchanted a {object} inside the {place}.","A {character} journeyed to the {place} with a {colour} {object}.","Deep within the {place}, the {character} discovered a {colour} {object}.","The {character} cast a spell using a {colour} {object} near the {place}."],advanced:["The {character} {action} mysteriously with the {colour} {object} while exploring the ancient {place}.","After enchanting a {colour} {object}, the {character} {action} through the magical {place}.","The wise {character} {action} to the {place} wielding only a {colour} {object}.","Channeling power through the {colour} {object}, the {character} {action} confidently around the {place}."]},ocean:{simple:["The {colour} {character} discovered a {object} beneath the {place}.","A {character} ventured to the {place} carrying a {colour} {object}.","Deep within the {place}, the {character} found a {colour} {object}.","The {character} used a {colour} {object} to navigate the {place}."],advanced:["The {character} {action} gracefully with the {colour} {object} while exploring the mysterious {place}.","After finding a {colour} {object}, the {character} {action} through the vast {place}.","The agile {character} {action} to the {place} guided only by a {colour} {object}.","Using the {colour} {object}, the clever {character} managed to {action} around the dangerous {place}."]}},this.defaultTemplates={simple:["The {colour} {character} with the {object}.","A {character} finds a {object}.","The {character} at the {place}.","The {colour} {object} in the {place}."],advanced:["The {character} {action} with the {object} in the {place}.","The {character} {action} to the {place} with the {object}.","The {colour} {character} {action} through the {place}.","The {character} uses the {object} while {action} near the {place}."]},this.currentTheme="",this.complexity="simple"}async initialise(t="space"){try{const{storyTheme:o,storyComplexity:r}=await chrome.storage.sync.get({storyTheme:t,storyComplexity:"simple"});return console.log("Loading theme from storage:",o),this.complexity=r,await this.loadTheme(o),!0}catch(o){return console.error("Error initialising story generator:",o),!1}}async loadTheme(t){try{console.log(`Loading theme: ${t}`);const o=await fetch(chrome.runtime.getURL(`wordlists/${t}.json`));if(!o.ok)throw new Error(`HTTP error! status: ${o.status}`);const r=await o.json();return this.wordLists[t]=r,this.currentTheme=t,console.log("Theme loaded successfully:",r),!0}catch(o){return console.error(`Error loading theme ${t}:`,o),!1}}getRandomWord(t){try{const o=t==="colours"?"colors":t,r=this.wordLists[this.currentTheme].words[o];if(!r)return console.error(`No words found for category: ${o}`),{word:t};const n=r[Math.floor(Math.random()*r.length)];return typeof n=="string"?{word:n}:n}catch(o){return console.error(`Error getting random word for ${t}:`,o),{word:t}}}checkStoryCoherence(t){const o=t.character,r=t.place,n=t.object,i=t.action,s=typeof o=="object"?o.word:o,c=typeof n=="object"?n.word:n,l=typeof i=="object"?i.word:i,p=typeof r=="object"?r.word:r;return!(s===c||p===c||i&&o&&typeof i=="object"&&typeof o=="object"&&(l==="runs"&&o.canRun===!1||l==="hides"&&o.canHide===!1)||o&&n&&typeof o=="object"&&typeof n=="object"&&(o.size==="large"&&n.size==="tiny"||o.size==="small"&&n.size==="large"&&n.canBeCarried===!1)||i&&n&&typeof i=="object"&&typeof n=="object"&&l==="flies"&&n.canFly===!1)}improveStoryReadability(t){return/^[A-Z]/.test(t)||(t=t.charAt(0).toUpperCase()+t.slice(1)),!t.endsWith(".")&&!t.endsWith("!")&&!t.endsWith("?")&&(t+="."),t}generateStoryPassword(){try{typeof T=="function"&&T("Once_upon_a_time.mp3");const o=(this.themeTemplates[this.currentTheme]||this.defaultTemplates)[this.complexity],r=o[Math.floor(Math.random()*o.length)];let n,i=0,s=!1;for(;!s&&i<3;){const w=this.getRandomWord("characters"),M=this.getRandomWord("places"),O=this.getRandomWord("objects"),ot=this.getRandomWord("actions"),He=this.getRandomWord("colours");n={character:w,place:M,object:O,action:ot,colour:He},s=this.checkStoryCoherence(n),i++}const c={character:typeof n.character=="object"?n.character.word:n.character,place:typeof n.place=="object"?n.place.word:n.place,object:typeof n.object=="object"?n.object.word:n.object,action:typeof n.action=="object"?n.action.word:n.action,colour:typeof n.colour=="object"?n.colour.word:n.colour};let l=r;Object.entries(c).forEach(([w,M])=>{const O=`{${w}}`;for(;l.includes(O);)l=l.replace(O,M)}),l=this.improveStoryReadability(l);const p=[];Object.entries(c).filter(([w])=>r.includes(`{${w}}`)).map(([w,M])=>({key:w,word:M})).forEach(({word:w})=>{const M=new RegExp(`\\b${w}\\b`,"i");if(M.test(l)){const O=l.match(M);if(O){const ot=O.index;p.push({word:w,position:ot})}}}),p.sort((w,M)=>w.position-M.position);const E=p.map(w=>w.word),L=E.map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(""),V={story:l,words:E,password:L};return typeof it=="function"&&it(V),V}catch(t){return console.error("Error generating story password:",t),typeof d=="function"&&d("Oops! Something went wrong generating your password.",3e3),null}}}function T(e){try{if(!chrome||!chrome.runtime||!chrome.runtime.id){console.warn("Chrome context invalid, cannot play sound");return}const t=chrome.runtime.getURL(`assets/sounds/${e}`),o=new Audio(t);o.volume=.7,o.play().catch(r=>{console.error("Failed to play notification sound:",r),r.message&&!r.message.includes("user gesture")&&console.warn("Audio playback failed silently")})}catch(t){console.error("Error playing notification sound:",t)}}function Ht(e,t){let o=e;return t.forEach(r=>{const n=new RegExp(`\\b${r}\\b`,"i");o=o.replace(n,i=>`<span class="highlight-word">${i}</span>`)}),o}function it(e){e&&(typeof T=="function"&&T("password_created.mp3"),Bt(e))}function Bt(e){e&&chrome.storage.sync.get({fontSize:14,fontFamily:"Arial, sans-serif",lineSpacing:"1.5",textColour:"#333333",backgroundColour:"#ffffff",highContrast:!1},function(t){const o=Ht(e.story,e.words),r=`
  <div class="story-password" style="width: 100% !important; max-width: 100% !important; box-sizing: border-box !important;">
    <style>
      .story-password {
        font-family: ${t.fontFamily};
        font-size: ${t.fontSize}px;
        line-height: ${t.lineSpacing};
        color: ${t.highContrast?"white":t.textColour};
        background-color: ${t.highContrast?"black":t.backgroundColour};
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
      
      .story-section h3, 
      .words-section h3,
      .password-section h3 {
        margin-bottom: 10px !important;
        color: ${t.highContrast?"white":"#2c3e50"} !important;
        font-size: ${Math.min(t.fontSize+2,24)}px !important;
      }
      
      .story-section {
        border-left: 4px solid ${t.highContrast?"white":"#007bff"} !important;
        padding-left: 12px !important;
        margin-bottom: 15px !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      
      .words-section {
        background: ${t.highContrast?"#333":"#f8f9fa"} !important;
        padding: 10px !important;
        border-radius: 6px !important;
        margin: 15px 0 !important;
        border: ${t.highContrast?"1px solid white":"none"} !important;
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
        font-size: ${Math.min(t.fontSize+2,24)}px !important;
        background: ${t.highContrast?"#333":"#e9ecef"} !important;
        padding: 10px !important;
        border-radius: 4px !important;
        margin: 10px 0 !important;
        border: ${t.highContrast?"1px solid white":"none"} !important;
        color: ${t.highContrast?"white":t.textColour} !important;
        word-break: break-all !important;
        overflow-wrap: break-word !important;
        max-width: 100% !important;
        white-space: normal !important;
      }
      
      .copy-button {
        display: inline-block !important;
        background: ${t.highContrast?"#fff":"#007bff"} !important;
        color: ${t.highContrast?"#000":"#fff"} !important;
        border: ${t.highContrast?"2px solid white":"none"} !important;
        padding: 8px 16px !important;
        border-radius: 4px !important;
        cursor: pointer !important;
        font-size: ${t.fontSize}px !important;
        font-family: ${t.fontFamily} !important;
        font-weight: bold !important;
        transition: background-color 0.2s !important;
        margin: 10px auto !important;
        white-space: normal !important;
        word-break: break-word !important;
      }
      
      .copy-button:hover {
        background: ${t.highContrast?"#90EE90":"#0056b3"} !important;
      }
      
      .highlight-word {
        font-weight: bold !important;
        color: ${t.highContrast?"#ffcc00":"#d9534f"} !important;
        text-decoration: underline !important;
      }
      
      .password-mnemonic {
        font-style: italic !important;
        margin-top: 10px !important;
        padding: 8px !important;
        background: ${t.highContrast?"#333":"#f0f9ff"} !important;
        border-radius: 4px !important;
        font-size: 0.9em !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }

      .word-arrow {
        color: ${t.highContrast?"#999":"#6c757d"} !important;
        margin: 0 5px !important;
      }
    </style>

    <div class="story-section">
      <h3>Your Story:</h3>
      <p>${o}</p>
      <div class="password-mnemonic">
        Remember your password by using the first letter of each highlighted word.
      </div>
    </div>
    
    <div class="words-section">
      <h3>Your Words:</h3>
      <div class="words-container">
        ${e.words.map((n,i)=>`
          <span class="word-item">
            ${n}${i<e.words.length-1?'<span class="word-arrow">→</span>':""}
          </span>
        `).join("")}
      </div>
    </div>
    
    <div class="password-section">
      <h3>Your Password:</h3>
      <p class="password-display">${e.password}</p>
      <button class="copy-button" type="button">Copy Password</button>
    </div>
  </div>
`;d(r,null),setTimeout(()=>{const n=document.getElementById("speech-bubble-wrapper");if(n&&n.shadowRoot){const i=n.shadowRoot,s=i.querySelector(".copy-button");if(s)s.style.cssText=`
              display: inline-block !important;
              background-color: ${t.highContrast?"#fff":"#007bff"} !important;
              color: ${t.highContrast?"#000":"#fff"} !important;
              border: ${t.highContrast?"2px solid white":"none"} !important;
              padding: 8px 16px !important;
              border-radius: 4px !important;
              cursor: pointer !important;
              font-size: ${t.fontSize}px !important;
              font-weight: bold !important;
              margin: 10px auto !important;
            `,s.addEventListener("click",()=>{st(e.password),s.textContent="Copied!",s.style.backgroundColor=t.highContrast?"#90EE90":"#28a745",typeof T=="function"&&T("Okay_keep_it_secret.mp3")});else{console.error("Copy button not found in shadow DOM");const c=i.querySelector(".password-section");if(c){const l=document.createElement("button");l.textContent="Copy Password",l.className="copy-button",l.style.cssText=`
                display: inline-block !important;
                background-color: ${t.highContrast?"#fff":"#007bff"} !important;
                color: ${t.highContrast?"#000":"#fff"} !important;
                border: ${t.highContrast?"2px solid white":"none"} !important;
                padding: 8px 16px !important;
                border-radius: 4px !important;
                cursor: pointer !important;
                font-size: ${t.fontSize}px !important;
                font-weight: bold !important;
                margin: 10px auto !important;
              `,l.addEventListener("click",()=>{st(e.password),l.textContent="Copied!",l.style.backgroundColor=t.highContrast?"#90EE90":"#28a745",typeof T=="function"&&T("keep_it_secret.mp3")}),c.appendChild(l)}}}},100)})}function at(){try{if(!chrome||!chrome.runtime||!chrome.runtime.id){typeof d=="function"&&d("Extension context has been invalidated. Please refresh the page and try again.",5e3);return}chrome.storage.sync.get({fontSize:14,fontFamily:"Arial, sans-serif",lineSpacing:"1.5",textColour:"#333333",backgroundColour:"#ffffff",highContrast:!1},function(e){try{if(!chrome||!chrome.runtime||!chrome.runtime.id){typeof d=="function"&&d("Extension context was lost. Please refresh the page and try again.",5e3);return}const t=`
            <div class="password-tester">
              <style>
                .password-tester {
                  font-family: ${e.fontFamily} !important;
                  background: ${e.highContrast?"black":"white"} !important;
                  padding: 16px !important;
                  border-radius: 8px !important;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
                  color: ${e.highContrast?"white":e.textColour} !important;
                  ${e.highContrast?"border: 2px solid white !important;":""}
                  width: 100% !important;
                  box-sizing: border-box !important;
                }

                .input-container {
                  margin-bottom: 16px !important;
                }

                .input-container label {
                  display: block !important;
                  margin-bottom: 8px !important;
                  color: ${e.highContrast?"white":"#333"} !important;
                  font-weight: bold !important;
                }

                .password-input {
                  display: block !important;
                  width: 100% !important;
                  padding: 10px !important;
                  margin-bottom: 12px !important;
                  border: 2px solid ${e.highContrast?"white":"#ccc"} !important;
                  border-radius: 4px !important;
                  font-size: 14px !important;
                  box-sizing: border-box !important;
                  background: ${e.highContrast?"black":"white"} !important;
                  color: ${e.highContrast?"white":"black"} !important;
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
                  background: ${e.highContrast?"white":"#007bff"} !important;
                  color: ${e.highContrast?"black":"white"} !important;
                  border: ${e.highContrast?"2px solid white":"none"} !important;
                  margin: 0 auto !important;
                }

                .test-button:hover {
                  background: ${e.highContrast?"black":"#0056b3"} !important;
                  color: white !important;
                  ${e.highContrast?"border: 2px solid white !important;":""}
                }

                .strength-result {
                  margin-top: 16px !important;
                  padding: 12px !important;
                  border-radius: 4px !important;
                  background: ${e.highContrast?"#333":"#f8f9fa"} !important;
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
          `;d(t,null),setTimeout(()=>{try{const o=document.getElementById("speech-bubble-wrapper");if(!o||!o.shadowRoot){console.error("Speech bubble wrapper not found");return}const r=o.shadowRoot,n=r.querySelector(".test-button"),i=r.querySelector(".password-input"),s=r.querySelector(".strength-result");if(!n||!i||!s){console.error("Required elements not found in shadow DOM");return}n.style.cssText=`
                display: block !important;
                width: auto !important;
                min-width: 200px !important;
                max-width: 100% !important;
                padding: 10px 16px !important;
                border-radius: 4px !important;
                cursor: pointer !important;
                font-size: 14px !important;
                font-weight: bold !important;
                background-color: ${e.highContrast?"white":"#007bff"} !important;
                color: ${e.highContrast?"black":"white"} !important;
                border: ${e.highContrast?"2px solid white":"none"} !important;
                margin: 10px auto !important;
              `;const c=()=>{try{if(!chrome||!chrome.runtime||!chrome.runtime.id){s.innerHTML=`
                      <div style="color: red !important; font-weight: bold !important; padding: 10px !important;">
                        Extension context has been lost. Please refresh the page and try again.
                      </div>
                    `;return}const l=i.value;if(!l){s.innerHTML=`
                      <div style="color: ${e.highContrast?"#ff6b6b":"#dc3545"}; font-weight: bold !important; padding: 10px !important;">
                        Please enter a password
                      </div>
                    `;return}let p=0;const u=[];l.length>=12?p+=2:l.length>=8?p+=1:u.push("Password should be at least 8 characters long"),/[A-Z]/.test(l)?p+=1:u.push("Add uppercase letters"),/[a-z]/.test(l)?p+=1:u.push("Add lowercase letters"),/[0-9]/.test(l)?p+=1:u.push("Add numbers"),/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(l)?p+=1:u.push("Add special characters");let h,E;if(p>=5?(h="Strong",E=e.highContrast?"#90EE90":"#28a745"):p>=3?(h="Moderate",E=e.highContrast?"#ffd93d":"#ffc107"):(h="Weak",E=e.highContrast?"#ff6b6b":"#dc3545"),s.innerHTML=`
                    <div style="
                      background: ${e.highContrast?"#333":"white"}; 
                      padding: 12px !important; 
                      border-radius: 4px !important; 
                      border: ${e.highContrast?"1px solid white":"1px solid #ddd"} !important;
                    ">
                      <div style="
                        color: ${E} !important; 
                        font-size: 16px !important; 
                        margin-bottom: 10px !important;
                        font-weight: bold !important;
                      ">
                        Password Strength: ${h}
                      </div>
                      ${u.length>0?`
                        <div style="color: ${e.highContrast?"white":"#333"} !important;">
                          <div style="font-weight: bold !important; margin-bottom: 8px !important;">
                            Suggestions to improve:
                          </div>
                          <ul style="
                            margin: 0 !important; 
                            padding-left: 20px !important;
                            color: ${e.highContrast?"white":"#666"} !important;
                          ">
                            ${u.map(L=>`<li style="
                              margin: 4px 0 !important; 
                              color: ${e.highContrast?"white":"#666"} !important;
                            ">${L}</li>`).join("")}
                          </ul>
                        </div>
                      `:""}
                    </div>
                  `,typeof T=="function"){let L;p>=5?L="strong_password.mp3":p>=3?L="moderate_password.mp3":L="weak_password.mp3",T(L)}}catch(l){console.error("Error in checkStrength:",l),s.innerHTML=`
                    <div style="color: red !important; font-weight: bold !important; padding: 10px !important;">
                      ${l.message.includes("Extension context invalidated")?"Extension context has been lost. Please refresh the page and try again.":"An error occurred while checking password strength."}
                    </div>
                  `}};n.addEventListener("click",c),i.addEventListener("keypress",l=>{l.key==="Enter"&&c()})}catch(o){console.error("Error accessing DOM elements:",o),d("Sorry, there was an error setting up the password tester. Please try again.",3e3)}},100)}catch(t){console.error("Error in chrome.storage callback:",t),d("Sorry, there was an error accessing your settings. Please try again.",3e3)}})}catch(e){console.error("Error in password strength test:",e),e.message&&e.message.includes("Extension context invalidated")?d("The extension needs to be refreshed. Please reload the page and try again.",5e3):d("Sorry, I encountered an error while testing the password. Please try again.",3e3)}}function st(e){navigator.clipboard.writeText(e).then(()=>{console.log("Text copied successfully")}).catch(t=>{console.error("Failed to copy text: ",t),d("Sorry, I couldn't copy the password. Please try copying it manually.")})}chrome.storage.onChanged.addListener(e=>{(e.storyTheme||e.storyComplexity)&&console.log("Password generator settings changed:",e)});let I=0,zt=Date.now(),ct=!1,S=!1,A=null,k={wordCountThreshold:50,typingBreakDuration:5,enableTypingAlerts:!0,pauseMonitoring:!1};async function Nt(){try{k=await chrome.storage.sync.get({wordCountThreshold:50,typingBreakDuration:5,enableTypingAlerts:!0,pauseMonitoring:!1}),S=k.pauseMonitoring}catch(e){console.error("Error loading typing monitor settings:",e)}}function Dt(e){return e.trim().split(/\s+/).filter(t=>t.length>0).length}function lt(e){if(S||!k.enableTypingAlerts)return;const t=e.target;if(t.isContentEditable||t.tagName==="TEXTAREA"||t.tagName==="INPUT"&&t.type==="text"){const o=t.isContentEditable?t.textContent:t.value,r=Dt(o);r>I&&(I=r,I%k.wordCountThreshold===0&&_t())}}function _t(){const e=`
    <div>
      <h3>You're doing great! 🌟</h3>
      <p>You've written ${I} words! Take a ${k.typingBreakDuration} minute break to:</p>
      <ul style="margin-left: 20px;">
        <li>Stand up and stretch</li>
        <li>Rest your eyes</li>
        <li>Get some water</li>
        <li>Save your work!</li>
      </ul>
      <div style="margin-top: 10px; text-align: center;">
        <button class="start-break-button"
                style="background: #007bff; color: white; border: none;
                       padding: 8px 16px; border-radius: 4px; cursor: pointer;
                       font-weight: bold; transition: background-color 0.2s;">
          Start Break Timer
        </button>
      </div>
    </div>
  `;d(e,null),U("amazingwork.mp3");const t=document.getElementById("speech-bubble-wrapper");if(t&&t.shadowRoot){const o=t.shadowRoot.querySelector(".start-break-button");o&&o.addEventListener("click",Ot)}}function U(e){const t=new Audio(chrome.runtime.getURL(`assets/sounds/${e}`));t.volume=.7,t.play().catch(o=>console.error("Failed to play notification sound:",o))}function Ot(){U("Okay_time_for_a_break.mp3"),S=!0;let t=k.typingBreakDuration*60;A&&(clearInterval(A),A=null);const o=()=>{const r=Math.floor(t/60),n=t%60,i=`
      <div>
        <h3>Break Time! 🎯</h3>
        <p>Time remaining: ${r}:${n.toString().padStart(2,"0")}</p>
        <div style="margin-top: 10px; display: flex; justify-content: center; gap: 10px;">
          <button class="skip-break-button" style="
            background: #dc3545;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.2s;">
            Skip Break
          </button>
        </div>
      </div>
    `;d(i,null);const s=document.getElementById("speech-bubble-wrapper");if(s&&s.shadowRoot){const c=s.shadowRoot.querySelector(".skip-break-button");c&&(c.replaceWith(c.cloneNode(!0)),s.shadowRoot.querySelector(".skip-break-button").addEventListener("click",()=>{console.log("Skip button clicked"),A&&(clearInterval(A),A=null),S=!1,d("Break skipped! Back to writing! 📝",3e3),U("Okay_back_to_work.mp3")}))}};o(),A=setInterval(()=>{if(t--,t<=0){clearInterval(A),A=null,S=!1,d("Break's over! Ready to write again! 🚀",5e3),U("Okay_back_to_work.mp3");return}o()},1e3)}function Ft(e){const o=Math.ceil(e/k.wordCountThreshold)*k.wordCountThreshold-e;return e===0?"Ready to start writing? Moo-ve those fingers! 🐄":o<=10?"Almost time for a break! Just a few more words! 🌟":e<100?`${o} words until your next break! Keep moo-ving! 🎉`:`Incredible progress! ${o} words until the next break! 🚀`}function dt(){const e=Math.floor((Date.now()-zt)/1e3),t=Math.floor(e/60),o=e%60,r=t>0?Math.round(I/t):0,n=Math.ceil(I/k.wordCountThreshold)*k.wordCountThreshold,i=`
    <div>
      <h3 style="margin: 0 0 10px 0;">Writing Progress</h3>
      <div style="padding: 12px; border-radius: 6px; margin-bottom: 10px;">
        <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
          <span>Words Written:</span>
          <span style="font-weight: bold;">${I}</span>
        </div>
        <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
          <span>Session Time:</span>
          <span style="font-weight: bold;">${t}m ${o}s</span>
        </div>
        <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
          <span>Next Break At:</span>
          <span style="font-weight: bold;">${n} words</span>
        </div>
        ${r>0?`
          <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
            <span>Writing Pace:</span>
            <span style="font-weight: bold;">${r} words/min</span>
          </div>
        `:""}
        <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
          <span>Monitoring Status:</span>
          <span style="font-weight: bold;">${S?"Paused":"Active"}</span>
        </div>
      </div>
      <div style="text-align: center;">
        ${Ft(I)}
      </div>
      ${S?`
        <div style="text-align: center; margin-top: 10px;">
          <button class="resume-monitoring-button"
                  style="background: #28a745; color: white; border: none; 
                         padding: 8px 16px; border-radius: 4px; cursor: pointer;
                         font-weight: bold;">
            Resume Monitoring
          </button>
        </div>
      `:""}
    </div>
  `;if(d(i,null),S){const s=document.getElementById("speech-bubble-wrapper");if(s&&s.shadowRoot){const c=s.shadowRoot.querySelector(".resume-monitoring-button");c&&c.addEventListener("click",()=>{S=!1,k.pauseMonitoring=!1,chrome.storage.sync.set({pauseMonitoring:!1}),d("Monitoring resumed! Keep writing! 📝",3e3)})}}}function Yt(){ct||Nt().then(()=>{ct=!0,document.addEventListener("input",lt,!0),new MutationObserver(t=>{t.forEach(o=>{o.type==="childList"&&o.addedNodes.forEach(r=>{r.nodeType===Node.ELEMENT_NODE&&(r.isContentEditable||r.tagName==="TEXTAREA"||r.tagName==="INPUT"&&r.type==="text")&&r.addEventListener("input",lt,!0)})})}).observe(document.body,{childList:!0,subtree:!0})})}chrome.storage.onChanged.addListener(e=>{Object.keys(e).forEach(t=>{t in k&&(k[t]=e[t].newValue,t==="pauseMonitoring"&&(S=e[t].newValue))})});function J(e){try{const t=new Audio(chrome.runtime.getURL(`assets/sounds/${e}`));t.volume=.7,t.play().catch(o=>{console.error("Failed to play content hider sound:",o)})}catch(t){console.error("Error playing content hider sound:",t)}}function qt(e){try{const t=document.querySelector(e);if(!t)return`Element (${e.split(">").pop().trim()})`;let o=t.tagName.toLowerCase();if(t.id&&(o+=` #${t.id}`),t.tagName==="IMG"){const n=t.alt||"Image",i=t.src?t.src.split("/").pop().split("?")[0]:"";return`${n}${i?` (${i})`:""}`}if(t.tagName.match(/^H[1-6]$/)){const n=t.textContent.trim();return`Heading: "${n.substring(0,30)}${n.length>30?"...":""}"`}if(t.tagName==="A"){const n=t.textContent.trim()||t.href;return`Link: "${n.substring(0,30)}${n.length>30?"...":""}"`}if(t.tagName==="BUTTON"||t.tagName==="INPUT"&&t.type==="button"){const n=t.textContent.trim()||t.value||"Button";return`Button: "${n.substring(0,30)}${n.length>30?"...":""}"`}if(t.textContent){const n=t.textContent.trim();if(n&&n.length>0)return n.length>40?`"${n.substring(0,40)}..."`:`"${n}"`}if((t.tagName==="DIV"||t.tagName==="SECTION")&&t.children.length){const n={};return Array.from(t.children).forEach(s=>{const c=s.tagName.toLowerCase();n[c]=(n[c]||0)+1}),`Container with ${Object.entries(n).map(([s,c])=>`${c} ${s}${c>1?"s":""}`).join(", ")}`}const r=t.getBoundingClientRect();return r.width>50||r.height>50?t.classList&&t.classList.length>0?`${o}.${t.classList[0]} (${Math.round(r.width)}×${Math.round(r.height)}px)`:`${o} (${Math.round(r.width)}×${Math.round(r.height)}px)`:t.classList&&t.classList.length>0?`${o}.${t.classList[0]}`:o}catch(t){return console.error("Error creating element description:",t),`Element (${e.split(">").pop().trim()})`}}let C=!1,b=null,y={mousemove:null,click:null,keydown:null,contextmenu:null};const pt=new MutationObserver(e=>{C&&(ht(),ut())});function Ut(){return C}function ut(){y.mousemove=Jt.bind(this),y.click=Zt.bind(this),y.keydown=Kt.bind(this),y.contextmenu=Gt.bind(this),document.addEventListener("mousemove",y.mousemove,{capture:!0,passive:!1}),document.addEventListener("click",y.click,{capture:!0,passive:!1}),document.addEventListener("keydown",y.keydown,{capture:!0,passive:!1}),document.addEventListener("contextmenu",y.contextmenu,{capture:!0,passive:!1}),document.body.style.cursor="crosshair"}function ht(){y.mousemove&&(document.removeEventListener("mousemove",y.mousemove,{capture:!0}),y.mousemove=null),y.click&&(document.removeEventListener("click",y.click,{capture:!0}),y.click=null),y.keydown&&(document.removeEventListener("keydown",y.keydown,{capture:!0}),y.keydown=null),y.contextmenu&&(document.removeEventListener("contextmenu",y.contextmenu,{capture:!0}),y.contextmenu=null),document.body.style.cursor=""}function Kt(e){e.key==="Escape"&&C&&(e.preventDefault(),e.stopPropagation(),K())}function Gt(e){C&&(e.preventDefault(),e.stopPropagation(),K())}function K(){C&&(mt(),setTimeout(()=>{d("Content hiding mode disabled!",3e3)},100))}function mt(){ht(),b&&(Z(b),b=null),pt.disconnect(),document.body.style.cursor="",C=!1}function F(e){const t=["spacecow-wrapper","speech-bubble-wrapper","spacecow-menu-wrapper","spacecow-pet","speech-bubble","close-button"];let o=e;for(;o;){if(o.id&&t.includes(o.id)||o.classList&&(o.classList.contains("hidden-element-item")||o.classList.contains("restore-all-button")||o.classList.contains("close-list-button")))return!0;o=o.parentElement}return!1}function Xt(e){const t=[];for(;e&&e.nodeType===Node.ELEMENT_NODE;){let o=e.nodeName.toLowerCase();if(e.id)o+="#"+e.id;else{let r=e,n=1;for(;r.previousElementSibling;)r=r.previousElementSibling,n++;o+=":nth-child("+n+")"}t.unshift(o),e=e.parentNode}return t.join(" > ")}function Vt(e){!e||F(e)||(e.dataset.originalOutline=e.style.outline,e.dataset.originalCursor=e.style.cursor,e.style.outline="2px dashed red",e.style.cursor="not-allowed")}function Z(e){e&&(e.style.outline=e.dataset.originalOutline||"",e.style.cursor=e.dataset.originalCursor||"",delete e.dataset.originalOutline,delete e.dataset.originalCursor)}function Jt(e){if(C){if(b&&Z(b),b=e.target,F(b)){b=null;return}b&&b.nodeName!=="BODY"&&b.nodeName!=="HTML"&&Vt(b)}}function Zt(e){if((e.target.id==="spacecow-pet"||e.target.parentElement&&e.target.parentElement.id==="spacecow-wrapper")&&C){e.preventDefault(),e.stopPropagation(),K();return}if(C){if(e.preventDefault(),e.stopPropagation(),e.stopImmediatePropagation(),F(e.target)){b&&(Z(b),b=null);return}b&&!F(b)&&b.nodeName!=="BODY"&&b.nodeName!=="HTML"&&Qt(b)}}async function Qt(e){var r;if(!e||F(e))return;const t=Xt(e),o=window.location.href;try{const n=await chrome.storage.sync.get("hiddenElements")||{},i=((r=n.hiddenElements)==null?void 0:r[o])||[];if(!i.includes(t)){i.push(t),await chrome.storage.sync.set({hiddenElements:{...n.hiddenElements,[o]:i}}),e.style.display="none",d("Content hidden! Click me, press Escape, or right-click to exit hiding mode.",3e3);const s=["hehe.mp3","laters.mp3","boop.mp3","zap.mp3","pop.mp3","cya.mp3","boop_and_your_gone.mp3"],c=s[Math.floor(Math.random()*s.length)];J(c)}}catch(n){console.error("Error storing hidden element:",n),d("Oops! Couldn't save the hidden content.",3e3)}}function te(){return C=!C,C?(pt.observe(document.body,{childList:!0,subtree:!0}),ut(),d("Content hiding mode enabled! Click on content to hide it. Press Escape or click me to exit.",5e3)):mt(),C}async function ee(){var t;const e=window.location.href;try{(((t=(await chrome.storage.sync.get("hiddenElements")).hiddenElements)==null?void 0:t[e])||[]).forEach(n=>{try{const i=document.querySelector(n);i&&!F(i)&&(i.style.display="none")}catch(i){console.error("Error applying hidden element:",i)}})}catch(o){console.error("Error retrieving hidden elements:",o)}}async function oe(e){var t;try{const o=window.location.href,r=await chrome.storage.sync.get("hiddenElements");let n=((t=r.hiddenElements)==null?void 0:t[o])||[];n=n.filter(s=>s!==e),await chrome.storage.sync.set({hiddenElements:{...r.hiddenElements,[o]:n}});const i=document.querySelector(e);i&&(i.style.display="",d("Element restored! 🎉",2e3),J("Come_back.mp3"))}catch(o){console.error("Error restoring element:",o),d("Couldn't restore that element.",2e3)}}async function ne(){var e;try{const t=window.location.href,o=await chrome.storage.sync.get("hiddenElements"),r=((e=o.hiddenElements)==null?void 0:e[t])||[];for(const n of r){const i=document.querySelector(n);i&&(i.style.display="")}await chrome.storage.sync.set({hiddenElements:{...o.hiddenElements,[t]:[]}}),d("All elements restored! 🎉",3e3),B(),J("Restore.mp3")}catch(t){console.error("Error restoring all elements:",t),d("Couldn't restore all elements.",3e3)}}async function re(){var t;const e=window.location.href;try{const r=((t=(await chrome.storage.sync.get("hiddenElements")).hiddenElements)==null?void 0:t[e])||[];if(r.length===0){d("No hidden elements on this page!",3e3);return}let i=`
        <div style="max-height: 300px; overflow-y: auto;">
            <h3 style="margin-bottom: 10px;">Hidden Elements</h3>
            <div style="margin-bottom: 10px;">Click an item to restore it:</div>
            <div class="hidden-elements-list">
                ${r.map(c=>({path:c,description:qt(c)})).map((c,l)=>`
                    <div class="hidden-element-item" 
                         data-path="${c.path}"
                         style="padding: 10px;
                                margin: 6px 0;
                                background: #f0f0f0;
                                border-radius: 4px;
                                cursor: pointer;
                                transition: background-color 0.2s;">
                        <div style="font-weight: bold; margin-bottom: 3px;">
                            ${l+1}. ${c.description}
                        </div>
                        <div style="font-size: 0.8em; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${c.path.split(">").pop().trim()}
                        </div>
                    </div>
                `).join("")}
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
        </div>`;d(i,null);const s=document.getElementById("speech-bubble-wrapper");if(s&&s.shadowRoot){const c=s.shadowRoot;c.querySelectorAll(".hidden-element-item").forEach(u=>{u.addEventListener("mouseover",()=>{u.style.backgroundColor="#e0e0e0"}),u.addEventListener("mouseout",()=>{u.style.backgroundColor="#f0f0f0"}),u.addEventListener("click",async()=>{const h=u.dataset.path;await oe(h),u.style.opacity="0.5",u.style.cursor="default",u.style.backgroundColor="#ccc"})});const l=c.querySelector(".restore-all-button");l&&l.addEventListener("click",()=>ne());const p=c.querySelector(".close-list-button");p&&p.addEventListener("click",()=>B())}}catch(o){console.error("Error showing hidden elements:",o),d("Oops! Couldn't retrieve hidden elements.",3e3)}}let z=null,m=null,j=null;function ft(){if(z)return m;z=document.createElement("div"),z.id="spacecow-menu-wrapper";const e=z.attachShadow({mode:"open"}),t=document.createElement("style");return t.textContent=`
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
    `,m=document.createElement("div"),m.id="spacecow-context-menu",e.appendChild(t),e.appendChild(m),document.body.appendChild(z),gt(),m}function ie(e,t){if(!m||m.style.display==="none")return;const o=m.getBoundingClientRect();let r=e,n=t;r+o.width>window.innerWidth&&(r=window.innerWidth-o.width-10),n+o.height>window.innerHeight&&(n=window.innerHeight-o.height-10),m.style.left=`${r}px`,m.style.top=`${n}px`}async function gt(){const e={fontSize:14,fontFamily:"Arial, sans-serif",lineSpacing:"1.5",textColour:"#333333",backgroundColour:"#ffffff",highContrast:!1};chrome.storage.sync.get(e,t=>{j=t,ae(),Q()})}function ae(){!m||!j||(m.style.fontSize=`${j.fontSize}px`,m.style.fontFamily=j.fontFamily,m.style.lineHeight=j.lineSpacing,j.highContrast?m.classList.add("high-contrast"):(m.classList.remove("high-contrast"),m.style.backgroundColor=j.backgroundColour,m.style.color=j.textColour))}async function Q(){if(!m)return;const{passwordType:e}=await chrome.storage.sync.get({passwordType:"story"});m.innerHTML=`
        <div class="menu-item" data-action="generatePassword">
            ${e==="story"?"Generate Story Password":"Generate Strong Password"}
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
    `,m.querySelectorAll(".menu-item").forEach(o=>{o.addEventListener("click",async r=>{r.stopPropagation();const n=o.dataset.action;await ce(n),yt()})})}function se(e,t){z||ft(),m.style.display="block",m.classList.add("visible"),ie(e,t),setTimeout(()=>{document.addEventListener("click",bt)},0)}function bt(e){z.contains(e.target)||yt()}function yt(){m&&(m.classList.remove("visible"),m.style.display="none",document.removeEventListener("click",bt))}async function ce(e){try{switch(e){case"generatePassword":const{passwordType:t}=await chrome.storage.sync.get({passwordType:"story"});if(t==="story"){const o=new rt;await o.initialise();const r=o.generateStoryPassword();r&&d(r.story,null)}else nt();break;case"testPassword":at();break;case"showWritingStats":dt();break;case"toggleHiding":te();break;case"showHidden":re();break}}catch(t){console.error("Error handling menu action:",t),d("Oops! Something went wrong.",3e3)}}chrome.storage.onChanged.addListener(e=>{["fontSize","fontFamily","lineSpacing","textColour","backgroundColour","highContrast"].some(o=>e[o])&&gt(),e.passwordType&&Q()});let G=null,a=null,W=!1,wt=0,xt=0,tt=!1,x={x:100,y:100},N=!1,R=!1,H=!1,P=null,$=null,g=null;function le(){G=document.createElement("div"),G.id="spacecow-wrapper";const e=G.attachShadow({mode:"open"}),t=document.createElement("style");return t.textContent=`
    #spacecow-pet {
        position: fixed;
        width: 100px;
        height: 100px;
        cursor: pointer;
        z-index: 10000;
        user-select: none;
        left: ${x.x}px;
        top: ${x.y}px;
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
  `,a=document.createElement("img"),a.src=chrome.runtime.getURL("assets/spacecow.png"),a.id="spacecow-pet",a.setAttribute("draggable","false"),a.setAttribute("role","img"),a.setAttribute("aria-label","Interactive spacecow pet"),a.style.left=`${x.x}px`,a.style.top=`${x.y}px`,e.appendChild(t),e.appendChild(a),document.body.appendChild(G),a}function vt(e,t){requestAnimationFrame(()=>{const o=document.getElementById("speech-bubble-wrapper"),r=document.getElementById("spacecow-menu-wrapper");if(o){const i=o.shadowRoot.getElementById("speech-bubble");if(i&&i.style.display!=="none"){const s=e+110;s+i.offsetWidth>window.innerWidth?(i.style.left=`${e-i.offsetWidth-10}px`,i.classList.add("left")):(i.style.left=`${s}px`,i.classList.remove("left")),i.style.top=`${t}px`}}if(r){const i=r.shadowRoot.getElementById("spacecow-context-menu");if(i&&i.style.display!=="none"){const s=i.getBoundingClientRect();let c=e+110,l=t;c+s.width>window.innerWidth&&(c=e-s.width-10),l+s.height>window.innerHeight&&(l=window.innerHeight-s.height-10),i.style.left=`${c}px`,i.style.top=`${l}px`}}})}function kt(){a&&(a.removeEventListener("mousedown",Ct),a.removeEventListener("click",Lt),a.removeEventListener("contextmenu",Mt),a.addEventListener("mousedown",Ct),a.addEventListener("click",Lt),a.addEventListener("contextmenu",Mt),a.addEventListener("dragstart",e=>{e.preventDefault()}))}function Ct(e){if(e.button!==0)return;e.stopPropagation(),W=!0,N=!1,g&&(clearTimeout(g),g=null);const t=a.getBoundingClientRect();wt=e.clientX-t.left,xt=e.clientY-t.top,a.style.transition="none",a.style.transform="none",a.classList.add("dragging"),document.addEventListener("mousemove",Et,{passive:!0}),document.addEventListener("mouseup",Tt)}function Et(e){W&&requestAnimationFrame(()=>{const t=a.getBoundingClientRect(),o=t.width,r=t.height,n=Math.max(0,Math.min(window.innerWidth-o,e.clientX-wt)),i=Math.max(0,Math.min(window.innerHeight-r,e.clientY-xt));a.style.left=`${n}px`,a.style.top=`${i}px`,x={x:n,y:i},tt=!0,vt(n,i)})}function Tt(){W=!1,a.classList.remove("dragging"),document.removeEventListener("mousemove",Et),document.removeEventListener("mouseup",Tt),setTimeout(()=>{tt=!1},50)}let St=0;const de=3e3,$t=[{text:"Always keep your personal information private online!",sound:"tip_personal_info.mp3"},{text:"Never share your password with friends, even your best ones!",sound:"tip_password.mp3"},{text:"If something online feels wrong or scary, tell a grown-up right away!",sound:"tip_tell_adult.mp3"},{text:"Think before you click on links or download files!",sound:"tip_think_before_click.mp3"},{text:"Be kind in online games and chats - treat others how you'd like to be treated!",sound:"tip_be_kind.mp3"},{text:"Remember that not everyone online is who they say they are.",sound:"tip_online_identity.mp3"},{text:"Ask permission before sharing photos of yourself or others online.",sound:"tip_photo_permission.mp3"},{text:"Websites asking for your name, age, or address need a grown-up's help!",sound:"tip_personal_data.mp3"},{text:"Take regular breaks from screens to rest your eyes and move around!",sound:"tip_screen_breaks.mp3"},{text:"Double-check before sharing - once it's online, it's hard to take back!",sound:"tip_think_before_sharing.mp3"},{text:"You know, Not everything you read online is true!",sound:"tip_fact_check.mp3"},{text:"What's my line again? oh, right  Moooo!",sound:"What s my line again.mp3"}];function pe(e){const t=new Audio(chrome.runtime.getURL(`assets/tips/${e}`));t.volume=.5,t.play().catch(o=>console.error("Audio playback failed:",o))}function Lt(e){if(e.preventDefault(),e.stopPropagation(),!tt){const t=Date.now();if(t-St<de){a&&(a.style.opacity="0.7",setTimeout(()=>{a.style.opacity="1"},300));return}if(St=t,Ut()){K(),B(),setTimeout(()=>{d("Content hiding mode disabled!",3e3)},100);return}const o=$t[Math.floor(Math.random()*$t.length)];d(o.text,4e3),pe(o.sound)}}function Mt(e){e.preventDefault(),e.stopPropagation();const t=a.getBoundingClientRect();se(t.right+10,t.top)}function X(){console.log("Animation check:",{isDragging:W,isHidden:R,isAnimating:N,isTemporarilyVisible:H,hasElement:!!a}),!W&&a&&!N&&!R&&!H&&(console.log("Starting animation using direct style"),N=!0,g&&clearTimeout(g),a.classList.remove("appear-pet","disappear-pet","dragging"),a.style.transition="transform 1.25s ease-in-out",a.style.transform="translateY(0px) rotate(0deg)",a.offsetWidth,requestAnimationFrame(()=>{a.style.transform="translateY(-30px) rotate(5deg)",g=setTimeout(()=>{a.style.transform="translateY(0px) rotate(0deg)",console.log("Animation step 2"),g=setTimeout(()=>{a.style.transform="translateY(30px) rotate(-5deg)",console.log("Animation step 3"),g=setTimeout(()=>{a.style.transform="translateY(0px) rotate(0deg)",console.log("Animation step 4"),g=setTimeout(()=>{a.style.transition="none",N=!1,console.log("Animation complete")},1250)},1250)},1250)},1250),console.log("Animation step 1")}))}function ue(){a&&(g&&(clearTimeout(g),g=null),$&&(clearInterval($),$=null),P&&(clearTimeout(P),P=null),x={x:parseInt(a.style.left)||x.x,y:parseInt(a.style.top)||x.y},H?B():d("Okay, off to find some cookies! 🍪",2e3),setTimeout(()=>{a.style.transition="none",a.style.transform="none",a.classList.remove("appear-pet"),a.offsetWidth,a.classList.add("disappear-pet"),setTimeout(()=>{R=!0,H=!1,W=!1,a.style.display="none",a.classList.remove("disappear-pet"),B()},500)},2e3))}function D(e){if(!a)return;P&&clearTimeout(P),H=!0,W=!1,N=!1,g&&(clearTimeout(g),g=null),a.style.cssText=`
    display: block !important;
    opacity: 1 !important;
    transform: none !important;
    left: ${x.x}px !important;
    top: ${x.y}px !important;
    position: fixed !important;
    width: 100px !important;
    height: 100px !important;
    z-index: 10000 !important;
    pointer-events: auto !important;
    cursor: pointer !important;
    transition: none !important;
  `,a.classList.remove("disappear-pet"),a.offsetWidth,a.classList.add("appear-pet"),vt(x.x,x.y),a.hasEventListener||(kt(),a.hasEventListener=!0);const t=Math.min(e,8e3);P=setTimeout(()=>{R&&(B(),a.classList.remove("appear-pet"),a.style.transition="none",a.style.transform="none",a.offsetWidth,a.classList.add("disappear-pet"),setTimeout(()=>{R&&(a.style.display="none",a.classList.remove("disappear-pet")),H=!1,W=!1},500))},t)}function he(){a&&(R||H)&&(P&&(clearTimeout(P),P=null),g&&(clearTimeout(g),g=null),R=!1,H=!1,N=!1,a.style.cssText=`
      display: block !important;
      opacity: 1 !important;
      transform: none !important;
      left: ${x.x}px !important;
      top: ${x.y}px !important;
      position: fixed !important;
      width: 100px !important;
      height: 100px !important;
      z-index: 10000 !important;
      pointer-events: auto !important;
      cursor: pointer !important;
      transition: none !important;
    `,a.classList.remove("disappear-pet"),a.offsetWidth,a.classList.add("appear-pet"),setTimeout(()=>{d("I'mmm back, adventurer! 🐮✨",3e3),a.classList.remove("appear-pet"),console.log("Testing immediate movement"),a.style.transition="transform 0.3s ease",a.style.transform="translateY(-20px)",setTimeout(()=>{a.style.transform="translateY(0)",setTimeout(()=>{console.log("Forcing animation cycle"),X(),$&&clearInterval($),$=setInterval(X,2e4)},800)},300)},500))}function me(){le(),kt(),$&&(clearInterval($),$=null),g&&(clearTimeout(g),g=null),console.log("Initializing pet with animation"),setTimeout(()=>{X(),$=setInterval(X,2e4)},1e3)}function Y(){return a}function fe(){return R}let _=null,f=null;function ge(){if(_)return;_=document.createElement("div"),_.id="speech-bubble-wrapper";const e=_.attachShadow({mode:"open"}),t=document.createElement("style"),o=document.createElement("style");o.id="dynamic-styles",t.textContent=`
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
  `,o.textContent=`
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
  `,f=document.createElement("div"),f.id="speech-bubble",f.setAttribute("role","dialog"),f.setAttribute("aria-live","polite"),e.appendChild(t),e.appendChild(o),e.appendChild(f),document.body.appendChild(_)}function be(){if(!f)return;const e=document.querySelector("#spacecow-wrapper");let t={x:100,y:100};if(e&&e.shadowRoot){const s=e.shadowRoot.querySelector("#spacecow-pet");if(s)if(s.style.display==="none"){const c=parseInt(s.style.left)||100,l=parseInt(s.style.top)||100;t={x:c,y:l}}else{const c=s.getBoundingClientRect();t={x:c.left,y:c.top}}}const o=f.getBoundingClientRect();let r=t.x+110,n=!1;r+o.width>window.innerWidth&&(r=t.x-o.width-20,n=!0),f.style.left=`${r}px`,f.style.top=`${t.y}px`,f.classList.toggle("left",n);const i=Math.max(0,Math.min(window.innerHeight-o.height,t.y));f.style.top=`${i}px`}function ye(e){let t=3e3;if(typeof e=="string")if(e.includes("<div")||e.includes("<h3")){t=5e3;const r=e.replace(/<[^>]*>?/gm," ").split(/\s+/).filter(n=>n.length>0).length;t+=r*200}else{const o=e.split(/\s+/).filter(r=>r.length>0).length;t+=o*250}return Math.min(t,15e3)}function d(e,t=null){ge(),f.hideTimer&&(clearTimeout(f.hideTimer),f.hideTimer=null);const o=t===null?ye(e):t;chrome.storage.sync.get({isCowHidden:!1},i=>{i.isCowHidden&&D(o!==null?o+1e3:8e3)});const r=typeof e=="string"&&!e.includes("<div")?`<div style="padding-right: 20px; margin: 0 !important;">${e}</div>`:e;f.innerHTML=r;const n=document.createElement("button");n.className="close-button",n.innerHTML="×",n.setAttribute("aria-label","Close message"),n.onclick=()=>B(),f.insertBefore(n,f.firstChild),f.style.display="block",be(),o!==null&&(f.hideTimer=setTimeout(()=>B(),o),console.log(`Speech bubble will auto-hide after ${o}ms`,{original:t,calculated:o,message:e.substring(0,50)+(e.length>50?"...":"")}))}function B(){f&&(f.hideTimer&&(clearTimeout(f.hideTimer),f.hideTimer=null),f.style.display="none")}function we(e){if(!f||!_)return;const o=_.shadowRoot.getElementById("dynamic-styles");if(o){const r=Math.min(e.fontSize*1.2,24);e.highContrast?o.textContent=`
        #speech-bubble {
          background-color: black !important;
          border: 2px solid white !important;
        }

        #speech-bubble,
        #speech-bubble *:not(.close-button) {
          color: white !important;
          font-family: ${e.fontFamily} !important;
          font-size: ${e.fontSize}px !important;
          line-height: ${e.lineSpacing} !important;
        }

        #speech-bubble h3 {
          font-size: ${r}px !important;
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
      `:o.textContent=`
        #speech-bubble {
          background-color: ${e.backgroundColour};
          border: none;
        }

        #speech-bubble,
        #speech-bubble *:not(.close-button) {
          color: ${e.textColour} !important;
          font-family: ${e.fontFamily} !important;
          font-size: ${e.fontSize}px !important;
          line-height: ${e.lineSpacing} !important;
        }

        #speech-bubble h3 {
          font-size: ${r}px !important;
        }

        #speech-bubble::before {
          border-right-color: ${e.backgroundColour};
        }

        #speech-bubble.left::before {
          border-right-color: transparent;
          border-left-color: ${e.backgroundColour};
        }

        .close-button {
          color: #666666 !important;
        }

        .close-button:hover {
          background-color: rgba(0, 0, 0, 0.1) !important;
          color: #333333 !important;
        }
      `}}const q={socialMedia:["facebook.com","x.com","instagram.com","tiktok.com","snapchat.com","reddit.com","discord.com"],adultContent:["mature","adult","dating","gambling","casino"],sensitiveInfo:["credit card","address","telephone","mobile","age","birthday","school","location","home address","postcode"],downloadRisks:[".exe",".msi",".dmg",".apk",".bat",".cmd"]};function xe(){return window.location.protocol==="https:"}function ve(){const e=document.querySelectorAll("form"),t=[];return e.forEach(o=>{o.querySelectorAll("input").forEach(n=>{var p,u;const i=n.type.toLowerCase(),s=(n.name||"").toLowerCase(),c=(n.placeholder||"").toLowerCase(),l=((u=(p=n.labels)==null?void 0:p[0])==null?void 0:u.textContent.toLowerCase())||"";["text","tel","number","email"].includes(i)&&q.sensitiveInfo.forEach(h=>{(s.includes(h)||c.includes(h)||l.includes(h))&&t.push(h)})})}),t}function ke(){const e=document.querySelectorAll("a"),t={externalLinks:0,downloadLinks:0,socialMediaLinks:0,unsecureLinks:0,riskyDomains:new Set};return e.forEach(o=>{const r=o.href.toLowerCase();r.startsWith("http")&&!r.includes(window.location.hostname)&&(t.externalLinks++,q.downloadRisks.some(n=>r.endsWith(n))&&t.downloadLinks++,q.socialMedia.some(n=>r.includes(n))&&(t.socialMediaLinks++,t.riskyDomains.add(r)),r.startsWith("http://")&&t.unsecureLinks++)}),t}function Ce(){const e=document.querySelectorAll("img"),t={total:e.length,missingAlt:0,largeImages:0,externalImages:0};return e.forEach(o=>{o.alt||t.missingAlt++,o.width>500&&o.height>500&&t.largeImages++,o.src.startsWith("http")&&!o.src.includes(window.location.hostname)&&t.externalImages++}),t}function Ee(){const e=document.body.textContent.toLowerCase(),t={adultContent:!1,sensitiveInfo:!1,keywords:new Set};return q.adultContent.forEach(o=>{e.includes(o)&&(t.adultContent=!0,t.keywords.add(o))}),q.sensitiveInfo.forEach(o=>{e.includes(o)&&(t.sensitiveInfo=!0,t.keywords.add(o))}),t}function Te(e){const t=[];return e.isSecure||t.push("🔒 I say, this website isn't using secure HTTPS - be extra careful about sharing any information!"),e.sensitiveFields.length>0&&t.push("📝 This page asks for personal details - best check with a grown-up before sharing anything!"),e.links.downloadLinks>0&&t.push("⚠️ Mind those download links - always ask a grown-up before downloading anything!"),e.links.socialMediaLinks>0&&t.push("👥 I've spotted social media links - be careful when chatting with others online!"),e.links.unsecureLinks>0&&t.push("🔓 Some links aren't properly secure - be careful when clicking, please!"),e.textConcerns.adultContent&&t.push("⚠️ This page might have grown-up content - best to have a chat with an adult!"),e.textConcerns.sensitiveInfo&&t.push("🛡️ Be careful about sharing personal details on this page!"),t}async function At(){try{const e={isSecure:xe(),sensitiveFields:ve(),links:ke(),images:Ce(),textConcerns:Ee()},t=Te(e);let o=`Moo! Let me help keep you safe and sound! 🐮

`;t.length>0&&(o+=`Here's what you ought to know:
`,t.forEach(n=>{o+=`${n}
`}),o+=`
`),o+=`Page Overview:
`,o+=`📄 Links: ${e.links.externalLinks} external links
`,o+=`🖼️ Images: ${e.images.total} images
`,o+=`📝 Forms: ${e.sensitiveFields.length} forms requesting information
`;const r=Math.max(8e3,t.length*3e3);setTimeout(()=>{d(o,r)},2e3)}catch(e){console.error("Error analysing page:",e),d("Oh dear! I had a spot of bother checking this page. Do be extra careful! 🛡️",5e3)}}function Se(){new Audio(chrome.runtime.getURL("assets/spacecowSound.mp3")).play().catch(t=>console.error("Audio play failed:",t))}function $e(){const e=Y();if(!e)return;e.classList.remove("spin-animation"),e.offsetWidth,e.classList.add("spin-animation");const t=e.getRootNode();if(t.querySelector("#spin-animation-style"))return;const o=document.createElement("style");o.id="spin-animation-style",o.textContent=`
    @keyframes spacecow-spin {
      0% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(180deg) scale(1.2); }
      100% { transform: rotate(360deg) scale(1); }
    }

    .spin-animation {
      animation: spacecow-spin 1s ease-in-out;
      transform-origin: center center;
    }
  `,t.appendChild(o)}function Pt(e){Se(),$e(),d(e,15e3)}function Le(){const e=new Set,t=p=>p.hasAttribute("data-spacecow-test"),o=["password","tel","email","number","text"],r={personal:/name|username|user|firstname|lastname|fullname/i,contact:/phone|mobile|tel|contact|email|mail/i,location:/address|location|city|state|zip|postal|country/i,financial:/card|credit|debit|payment|bank|account/i,sensitive:/ssn|social|security|passport|license|birth|age|date/i,health:/health|medical|insurance|condition/i},n=p=>{if(!o.includes(p.type))return null;const u=[p.name,p.id,p.placeholder,p.getAttribute("aria-label"),p.getAttribute("label"),p.getAttribute("data-label"),p.labels&&Array.from(p.labels).map(h=>h.textContent).join(" ")].filter(Boolean).join(" ").toLowerCase();for(const[h,E]of Object.entries(r))if(E.test(u))return h;return p.type==="password"?"personal":null},i=()=>{const p=window.location.protocol==="https:",u=window.location.hostname,h=p||u.includes("localhost");return{isSecure:h,domain:u,securityLevel:h?"secure":"not secure"}},s=(p,u)=>{let h=`Hold on a moment! 🛡️

`;return u.isSecure||(h+=`⚠️ Just so you know, this site isn't using secure HTTPS! Be extra careful!

`),h+=`📍 You're on: ${u.domain}

`,h+={personal:"Looks like you're about to enter personal information!",contact:"I see you're entering contact details!",location:"I notice you're about to share location information!",financial:"Heads up! This looks like financial information!",sensitive:"This seems like sensitive information!",health:"I see you're entering health-related information!"}[p]+`

`,h+=`✨ Remember these safety tips:
`,h+=`- Only share information on sites you trust
`,h+=`- Look for the padlock 🔒 in your browser
`,h+=`- Double-check the website address
`,h+=`- Ask an adult if you're not sure!

`,h+="Stay safe online! 🌟",h},c=p=>{const u=p.target;if(u.tagName!=="INPUT"||t(u))return;const h=`${u.type}-${u.name}-${u.id}`;if(e.has(h))return;const E=n(u);if(E){const L=i(),V=s(E,L);Pt(V),e.add(h),setTimeout(()=>{e.delete(h)},5*60*1e3)}},l=p=>{i().isSecure||(p.preventDefault(),Pt(`⚠️ Wait! This form isn't secure!

The information you're sending might not be protected.

Please check with an adult before continuing! 🛡️`))};return document.addEventListener("focusin",c,!0),document.addEventListener("submit",l,!0),()=>{document.removeEventListener("focusin",c,!0),document.removeEventListener("submit",l,!0)}}class Me{constructor(){this.patterns=null,this.inputTracker={cache:new Map,lastWarning:0,warningCooldown:2e3,processingInput:!1}}async initialise(){try{console.log("Initializing LanguageMonitor...");const t=chrome.runtime.getURL("wordlists/languagePatterns.json");console.log("Attempting to fetch from:",t);const o=await fetch(t);if(!o.ok)throw new Error(`Failed to load language patterns. Status: ${o.status}`);return this.patterns=await o.json(),console.log("Language patterns loaded successfully"),Object.values(this.patterns.categories).forEach(r=>{r.patterns=r.patterns.map(n=>new RegExp(n,"i"))}),this.addEventListeners(),!0}catch(t){return console.error("Error initialising language patterns:",t),t instanceof TypeError&&console.log("Network error - check if the file path is correct and the file is being copied to the dist folder"),!1}}addEventListeners(){document.addEventListener("input",this.handleInput.bind(this),!0),document.addEventListener("paste",this.handlePaste.bind(this),!0),this.observer=new MutationObserver(t=>{t.forEach(o=>{o.type==="childList"&&o.addedNodes.forEach(r=>{r.nodeType===Node.ELEMENT_NODE&&(this.isEditableElement(r)&&r.addEventListener("input",this.handleInput.bind(this),!0),r.querySelectorAll('input[type="text"], textarea, [contenteditable="true"]').forEach(i=>{i.addEventListener("input",this.handleInput.bind(this),!0)}))})})}),this.observer.observe(document.body,{childList:!0,subtree:!0})}tidyUp(){this.observer&&this.observer.disconnect(),document.removeEventListener("input",this.handleInput.bind(this),!0),document.removeEventListener("paste",this.handlePaste.bind(this),!0),this.inputTracker.cache.clear()}isEditableElement(t){return t.isContentEditable||t.tagName==="TEXTAREA"||t.tagName==="INPUT"&&t.type==="text"||t.tagName==="DIV"}getElementText(t){return t.isContentEditable||t.tagName==="DIV"?t.textContent:t.value}checkLanguage(t){if(!this.patterns)return null;for(const[o,r]of Object.entries(this.patterns.categories))for(const n of r.patterns)if(n.test(t)){const i=this.getSeverityLevel(t);return{category:o,severity:i,message:this.getRandomMessage(o),suggestions:this.getSuggestions(o)}}return null}getSeverityLevel(t){for(const[o,r]of Object.entries(this.patterns.severity_levels))if(r.some(n=>t.toLowerCase().includes(n)))return o;return"low"}getRandomMessage(t){const o=this.patterns.categories[t].messages;return o[Math.floor(Math.random()*o.length)]}getSuggestions(t){const o=this.patterns.categories[t];return o.suggestions||o.alternatives||[]}canShowWarning(){const t=Date.now();return t-this.inputTracker.lastWarning>=this.inputTracker.warningCooldown?(this.inputTracker.lastWarning=t,!0):!1}async showKindReminder(t){try{let o=t.message;t.suggestions&&t.suggestions.length>0&&(o+=`

💡 Suggestion: `+t.suggestions[0]),await new Promise(r=>{chrome.storage.sync.get({isCowHidden:!1},async n=>{n.isCowHidden&&(D(13e3),await new Promise(s=>setTimeout(s,100))),this.playGentleAlert(),this.showConcern(),d(o,12e3),r()})})}catch(o){console.error("Error in showKindReminder:",o)}}playGentleAlert(){const t=new Audio(chrome.runtime.getURL("assets/spacecowSound.mp3"));t.volume=.5,t.play().catch(o=>console.error("Audio playback failed:",o))}showConcern(){const t=Y();if(!t)return;t.classList.remove("concern-animation"),t.offsetWidth,t.classList.add("concern-animation");const o=t.getRootNode();if(o.querySelector("#concern-animation-style"))return;const r=document.createElement("style");r.id="concern-animation-style",r.textContent=`
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
        `,o.appendChild(r)}handleInput(t){if(!this.inputTracker.processingInput){this.inputTracker.processingInput=!0;try{const o=t.target;if(!this.isEditableElement(o))return;const r=this.getElementText(o);if(!r)return;if(this.canShowWarning()){const n=this.checkLanguage(r);n&&this.showKindReminder(n)}this.inputTracker.cache.set(o,r)}finally{this.inputTracker.processingInput=!1}}}handlePaste(t){const o=t.target;if(!this.isEditableElement(o))return;const r=t.clipboardData.getData("text");if(r.trim()&&this.canShowWarning()){const n=this.checkLanguage(r);n&&this.showKindReminder(n)}}}const Ae=new Me;function Pe(){return Ae.initialise()}async function It(e,t=!1){try{if(console.log("Applying settings:",e),!["fontSize","fontFamily","lineSpacing","textColour","backgroundColour","highContrast"].every(r=>r in e))throw new Error("Missing required settings");return we(e),await new Promise((r,n)=>{chrome.storage.sync.set(e,()=>{chrome.runtime.lastError?n(chrome.runtime.lastError):r()})}),console.log("Settings saved successfully"),t&&d("Settings applied successfully!",2e3),!0}catch(o){return console.error("Error applying settings:",o),t&&d("Failed to apply settings. Please try again.",2e3),!1}}let et=!1,v={isCowHidden:!1};async function jt(){if(!et)try{await me(),await ee(),Yt(),Le(),Pe(),ft();const e={fontSize:14,fontFamily:"Arial, sans-serif",lineSpacing:"1.5",textColour:"#333333",backgroundColour:"#ffffff",highContrast:!1,isCowHidden:!1};chrome.storage.sync.get(e,t=>{if(v=t,It(v),v.isCowHidden){const o=Y();o&&(console.log("Initially hiding cow"),o.style.display="none")}}),setTimeout(()=>{At()},2e3),et=!0,console.log("Spacecow extension initialised successfully")}catch(e){console.error("Error initialising extension:",e)}}chrome.runtime.onMessage.addListener((e,t,o)=>{try{switch(console.log("Received message:",e),e.action){case"makeSpacecowCurious":We();break;case"applyAccessibilitySettings":It(e.settings,!0),v=e.settings,o({success:!0});break;case"showWritingStats":Ie();break;case"generatePassword":Re(e.type);break;case"testPassword":je();break;case"showSpacecow":Wt(),o({success:!0});break;case"hideSpacecow":Rt(),o({success:!0});break;case"checkInitialisation":et||jt();break;default:console.log("Unknown message action:",e.action)}}catch(r){console.error("Error handling message:",r),o({success:!1,error:r.message})}return!0});async function Ie(){v.isCowHidden&&(D(1e4),await new Promise(e=>setTimeout(e,100))),dt()}async function je(){v.isCowHidden&&(D(1e4),await new Promise(e=>setTimeout(e,100))),at()}async function Wt(){await he(),v.isCowHidden=!1,await chrome.storage.sync.set({isCowHidden:!1})}async function Rt(){await ue(),v.isCowHidden=!0,await chrome.storage.sync.set({isCowHidden:!0})}async function We(){console.log("Handling curiosity",{settings:v}),Y()&&(v.isCowHidden&&(D(8e3),await new Promise(t=>setTimeout(t,100))),d("Moo! Let me have a look at this page! 🔍",3e3),setTimeout(()=>{At()},3e3))}async function Re(e="standard"){try{if(e==="story"){const t=new rt;await t.initialise();const o=t.generateStoryPassword();o&&(v.isCowHidden&&(D(12e3),await new Promise(r=>setTimeout(r,100))),d(o.story,null))}else{v.isCowHidden&&(D(7e3),await new Promise(o=>setTimeout(o,100)));const t=nt();t&&d(`Generated password: ${t}`,5e3)}}catch(t){console.error("Error generating password:",t),d("Oops! Something went wrong generating your password.",3e3)}}chrome.storage.onChanged.addListener(e=>{if(console.log("Settings changed:",e),Object.keys(e).forEach(t=>{t in v&&(v[t]=e[t].newValue)}),e.passwordType&&Q(),e.isCowHidden!==void 0){const t=Y(),o=e.isCowHidden.newValue;t&&!fe()!=!o&&(o?Rt():Wt())}}),jt()})();
