"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWebviewScript = void 0;
function getWebviewScript(selectors, textPatterns, debugMode) {
    return `
    (function() {
      const vscode = acquireVsCodeApi();
      let lastClickTime = 0;
      const CLICK_COOLDOWN = 2000; // 2 seconds cooldown between clicks
      
      const selectors = ${JSON.stringify(selectors)};
      const textPatterns = ${JSON.stringify(textPatterns.map((p) => p.source))};
      const debugMode = ${debugMode};
      
      function log(message, level = 'info') {
        if (debugMode || level === 'error') {
          console.log('[Cursor Auto Resumer Webview]', message);
          vscode.postMessage({
            type: 'debug-log',
            data: { message, level },
            timestamp: Date.now()
          });
        }
      }
      
      function findResumeButtons() {
        const buttons = [];
        
        // Search by CSS selectors
        selectors.forEach(selector => {
          try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              if (el instanceof HTMLElement && !buttons.includes(el)) {
                buttons.push(el);
              }
            });
          } catch (e) {
            log('Invalid selector: ' + selector, 'warn');
          }
        });
        
        // Search by text content
        const allButtons = document.querySelectorAll('button, [role="button"], .btn, [onclick]');
        allButtons.forEach(button => {
          if (button instanceof HTMLElement && !buttons.includes(button)) {
            const text = button.textContent || button.getAttribute('aria-label') || button.getAttribute('title') || '';
            const patterns = textPatterns.map(pattern => new RegExp(pattern, 'i'));
            
            if (patterns.some(pattern => pattern.test(text))) {
              buttons.push(button);
            }
          }
        });
        
        return buttons.filter(button => {
          // Filter out hidden or disabled buttons
          const style = window.getComputedStyle(button);
          return style.display !== 'none' && 
                 style.visibility !== 'hidden' && 
                 !button.hasAttribute('disabled') &&
                 button.offsetWidth > 0 && 
                 button.offsetHeight > 0;
        });
      }
      
      function clickButton(button) {
        const now = Date.now();
        if (now - lastClickTime < CLICK_COOLDOWN) {
          log('Click cooldown active, skipping click');
          return false;
        }
        
        try {
          // Try multiple click methods
          if (button.click) {
            button.click();
          } else if (button.dispatchEvent) {
            button.dispatchEvent(new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            }));
          }
          
          lastClickTime = now;
          log('Resume button clicked: ' + (button.textContent || button.className));
          
          vscode.postMessage({
            type: 'resume-button-clicked',
            data: {
              text: button.textContent,
              className: button.className,
              id: button.id
            },
            timestamp: now
          });
          
          return true;
        } catch (error) {
          log('Error clicking button: ' + error.message, 'error');
          vscode.postMessage({
            type: 'error',
            data: { error: error.message },
            timestamp: now
          });
          return false;
        }
      }
      
      function checkForResumeButtons() {
        try {
          const buttons = findResumeButtons();
          
          if (buttons.length > 0) {
            log('Found ' + buttons.length + ' resume button(s)');
            
            vscode.postMessage({
              type: 'resume-button-found',
              data: { count: buttons.length },
              timestamp: Date.now()
            });
            
            // Click the first visible button
            const clicked = clickButton(buttons[0]);
            return clicked;
          }
          
          return false;
        } catch (error) {
          log('Error in checkForResumeButtons: ' + error.message, 'error');
          vscode.postMessage({
            type: 'error',
            data: { error: error.message },
            timestamp: Date.now()
          });
          return false;
        }
      }
      
      // Initial check
      log('Webview script initialized');
      checkForResumeButtons();
      
      // Set up mutation observer to watch for DOM changes
      const observer = new MutationObserver((mutations) => {
        let shouldCheck = false;
        
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Check if any added nodes contain buttons
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                if (element.tagName === 'BUTTON' || 
                    element.querySelector('button') ||
                    element.getAttribute('role') === 'button') {
                  shouldCheck = true;
                }
              }
            });
          }
        });
        
        if (shouldCheck) {
          setTimeout(checkForResumeButtons, 100); // Small delay to let DOM settle
        }
      });
      
      // Start observing
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'disabled']
      });
      
      // Periodic check as fallback
      setInterval(checkForResumeButtons, 5000);
      
      log('DOM observer and periodic checker started');
    })();
  `;
}
exports.getWebviewScript = getWebviewScript;
//# sourceMappingURL=webviewScript.js.map