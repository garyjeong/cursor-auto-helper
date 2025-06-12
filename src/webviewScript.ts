export function getWebviewScript(
	resumeSelectors: string[],
	resumeTextPatterns: RegExp[],
	skipSelectors: string[],
	skipTextPatterns: RegExp[],
	skipDelay: number,
	skipEnabled: boolean,
	debugMode: boolean
): string {
	return `
    (function() {
      const vscode = acquireVsCodeApi();
      let lastResumeClickTime = 0;
      let lastSkipClickTime = 0;
      let skipTimer = null;
      const CLICK_COOLDOWN = 2000; // 2 seconds cooldown between clicks
      
      const resumeSelectors = ${JSON.stringify(resumeSelectors)};
      const resumeTextPatterns = ${JSON.stringify(
				resumeTextPatterns.map((p) => p.source)
			)};
      const skipSelectors = ${JSON.stringify(skipSelectors)};
      const skipTextPatterns = ${JSON.stringify(
				skipTextPatterns.map((p) => p.source)
			)};
      const skipDelay = ${skipDelay};
      const skipEnabled = ${skipEnabled};
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
      
      function findButtonsBySelectors(selectors, textPatterns, buttonType) {
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
            log('Invalid ' + buttonType + ' selector: ' + selector, 'warn');
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
      
      function findResumeButtons() {
        return findButtonsBySelectors(resumeSelectors, resumeTextPatterns, 'resume');
      }
      
      function findSkipButtons() {
        return findButtonsBySelectors(skipSelectors, skipTextPatterns, 'skip');
      }
      
      function clickButton(button, buttonType, lastClickTimeVar) {
        const now = Date.now();
        if (now - lastClickTimeVar < CLICK_COOLDOWN) {
          log(buttonType + ' click cooldown active, skipping click');
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
          
          if (buttonType === 'resume') {
            lastResumeClickTime = now;
          } else if (buttonType === 'skip') {
            lastSkipClickTime = now;
          }
          
          log(buttonType + ' button clicked: ' + (button.textContent || button.className));
          
          vscode.postMessage({
            type: buttonType + '-button-clicked',
            data: {
              text: button.textContent,
              className: button.className,
              id: button.id
            },
            timestamp: now
          });
          
          return true;
        } catch (error) {
          log('Error clicking ' + buttonType + ' button: ' + error.message, 'error');
          vscode.postMessage({
            type: 'error',
            data: { error: error.message },
            timestamp: now
          });
          return false;
        }
      }
      
      function cancelSkipTimer() {
        if (skipTimer) {
          clearTimeout(skipTimer);
          skipTimer = null;
          log('Skip timer cancelled');
          vscode.postMessage({
            type: 'skip-button-cancelled',
            data: {},
            timestamp: Date.now()
          });
        }
      }
      
      function scheduleSkipClick(button) {
        // Cancel existing timer
        cancelSkipTimer();
        
        log('Skip button scheduled for click in ' + (skipDelay / 1000) + ' seconds');
        vscode.postMessage({
          type: 'skip-button-scheduled',
          data: { delay: skipDelay },
          timestamp: Date.now()
        });
        
        skipTimer = setTimeout(() => {
          // Double-check if resume button appeared
          const resumeButtons = findResumeButtons();
          if (resumeButtons.length > 0) {
            log('Resume button found, cancelling skip click');
            cancelSkipTimer();
            return;
          }
          
          // Click skip button
          clickButton(button, 'skip', lastSkipClickTime);
          skipTimer = null;
        }, skipDelay);
      }
      
      function checkForButtons() {
        try {
          // Check for resume buttons first (higher priority)
          const resumeButtons = findResumeButtons();
          
          if (resumeButtons.length > 0) {
            log('Found ' + resumeButtons.length + ' resume button(s)');
            
            // Cancel any pending skip clicks
            cancelSkipTimer();
            
            vscode.postMessage({
              type: 'resume-button-found',
              data: { count: resumeButtons.length },
              timestamp: Date.now()
            });
            
            // Click the first visible resume button
            const clicked = clickButton(resumeButtons[0], 'resume', lastResumeClickTime);
            return clicked;
          }
          
          // Check for skip buttons only if skip is enabled and no resume buttons
          if (skipEnabled) {
            const skipButtons = findSkipButtons();
            
            if (skipButtons.length > 0 && !skipTimer) {
              log('Found ' + skipButtons.length + ' skip button(s)');
              
              vscode.postMessage({
                type: 'skip-button-found',
                data: { count: skipButtons.length },
                timestamp: Date.now()
              });
              
              // Schedule skip click
              scheduleSkipClick(skipButtons[0]);
            }
          }
          
          return false;
        } catch (error) {
          log('Error in checkForButtons: ' + error.message, 'error');
          vscode.postMessage({
            type: 'error',
            data: { error: error.message },
            timestamp: Date.now()
          });
          return false;
        }
      }
      
      // Initial check
      log('Webview script initialized with skip enabled: ' + skipEnabled);
      checkForButtons();
      
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
          setTimeout(checkForButtons, 100); // Small delay to let DOM settle
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
      setInterval(checkForButtons, 5000);
      
      log('DOM observer and periodic checker started');
    })();
  `;
}
