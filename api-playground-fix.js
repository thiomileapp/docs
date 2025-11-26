/**
 * MileApp API Playground Fix
 * Adds resizable response panel with drag handle
 */

(function() {
  // Create and inject custom CSS
  const style = document.createElement('style');
  style.textContent = `
    /* Resizable response panel styles */
    .resizable-response {
      position: relative;
      min-height: 150px;
      max-height: none !important;
      overflow: hidden;
    }

    .resizable-response pre {
      height: 100% !important;
      max-height: none !important;
      overflow-y: auto !important;
    }

    /* Resize handle */
    .resize-handle {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 12px;
      background: linear-gradient(to bottom, transparent, rgba(128, 128, 128, 0.3));
      cursor: ns-resize;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      transition: background 0.2s;
    }

    .resize-handle:hover {
      background: linear-gradient(to bottom, transparent, rgba(128, 128, 128, 0.5));
    }

    .resize-handle::after {
      content: '';
      width: 40px;
      height: 4px;
      background: rgba(128, 128, 128, 0.5);
      border-radius: 2px;
    }

    .resize-handle:hover::after {
      background: rgba(128, 128, 128, 0.8);
    }

    /* Fix response container */
    [data-testid="api-playground"] [class*="overflow-hidden"],
    [class*="ApiPlayground"] [class*="overflow-hidden"] {
      overflow: visible !important;
    }

    /* Ensure pre elements are scrollable */
    [role="tabpanel"] pre,
    [data-state="active"] pre {
      overflow-y: auto !important;
    }
  `;
  document.head.appendChild(style);

  // Function to make an element resizable
  function makeResizable(container) {
    if (container.classList.contains('resizable-response')) return;

    // Find the pre element inside
    const pre = container.querySelector('pre');
    if (!pre) return;

    container.classList.add('resizable-response');

    // Set initial height
    const initialHeight = Math.max(300, pre.scrollHeight);
    container.style.height = Math.min(initialHeight, 500) + 'px';

    // Create resize handle
    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    handle.title = 'Drag to resize';
    container.appendChild(handle);

    let isResizing = false;
    let startY = 0;
    let startHeight = 0;

    handle.addEventListener('mousedown', function(e) {
      isResizing = true;
      startY = e.clientY;
      startHeight = container.offsetHeight;
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
      if (!isResizing) return;
      const delta = e.clientY - startY;
      const newHeight = Math.max(150, startHeight + delta);
      container.style.height = newHeight + 'px';
    });

    document.addEventListener('mouseup', function() {
      if (isResizing) {
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    });
  }

  // Function to find and enhance response panels
  function enhanceResponsePanels() {
    // Target response containers in API playground
    const selectors = [
      '[data-testid="api-playground"] [role="tabpanel"]',
      '[class*="ApiPlayground"] [role="tabpanel"]',
      '[data-testid="response-body"]',
      '[class*="response"] [class*="overflow-hidden"]'
    ];

    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(panel => {
        const pre = panel.querySelector('pre');
        if (pre && !panel.classList.contains('resizable-response')) {
          makeResizable(panel);
        }
      });
    });
  }

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceResponsePanels);
  } else {
    enhanceResponsePanels();
  }

  // Watch for dynamic content changes
  const observer = new MutationObserver(function(mutations) {
    let shouldEnhance = false;
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1 && (node.querySelector('pre') || node.tagName === 'PRE')) {
            shouldEnhance = true;
          }
        });
      }
    });
    if (shouldEnhance) {
      setTimeout(enhanceResponsePanels, 100);
    }
  });

  // Start observing
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }
})();
