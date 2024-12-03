chrome.runtime.onInstalled.addListener(() => {
  // Remove all existing menu items to prevent duplicates
  chrome.contextMenus.removeAll(() => {
    // Highlight Sentences option
    chrome.contextMenus.create({
      id: "highlightSentences",
      title: "Highlight Sentences",
      contexts: ["selection"], // Show when text is selected
    });

    // Clear Highlights option
    chrome.contextMenus.create({
      id: "clearHighlights",
      title: "Clear Highlights",
      contexts: ["all"], // Show for all pages
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "highlightSentences") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: highlightSentences,
    });
  }

  if (info.menuItemId === "clearHighlights") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: clearHighlights,
    });
  }
});

function clearHighlights() {
    const selection = window.getSelection();

    if (!selection.rangeCount) {
        alert("Please select text to clear highlights from.");
        return;
    }

    const range = selection.getRangeAt(0);

    // Helper function to split and clear partially highlighted nodes
    function handlePartialHighlight(node, range) {
        const parent = node.parentNode;

        // Get the text content before, inside, and after the range
        const beforeText = node.textContent.slice(0, range.startOffset);
        const selectedText = node.textContent.slice(range.startOffset, range.endOffset);
        const afterText = node.textContent.slice(range.endOffset);

        if (beforeText) {
            const beforeNode = document.createElement("span");
            beforeNode.textContent = beforeText;
            beforeNode.className = "sentence-highlight";
            beforeNode.style.backgroundColor = window.getComputedStyle(node).backgroundColor;
            parent.insertBefore(beforeNode, node);
        }

        if (selectedText) {
            const selectedNode = document.createTextNode(selectedText); // Remove highlight
            parent.insertBefore(selectedNode, node);
        }

        if (afterText) {
            const afterNode = document.createElement("span");
            afterNode.textContent = afterText;
            afterNode.className = "sentence-highlight";
            afterNode.style.backgroundColor = window.getComputedStyle(node).backgroundColor;
            parent.insertBefore(afterNode, node);
        }

        // Remove the original node
        parent.removeChild(node);
    }

    // Helper function to process all nodes within the range
    function processRangeNodes(range) {
        const treeWalker = document.createTreeWalker(
            range.commonAncestorContainer,
            NodeFilter.SHOW_ELEMENT,
            {
                acceptNode: (node) =>
                    range.intersectsNode(node) &&
                    node.classList.contains("sentence-highlight")
                        ? NodeFilter.FILTER_ACCEPT
                        : NodeFilter.FILTER_REJECT,
            }
        );

        const nodesToClear = [];
        let currentNode = treeWalker.nextNode();
        while (currentNode) {
            nodesToClear.push(currentNode);
            currentNode = treeWalker.nextNode();
        }

        nodesToClear.forEach((node) => {
            // Handle partially selected highlights
            if (range.startContainer === node || range.endContainer === node) {
                handlePartialHighlight(node, range);
            } else {
                // Fully remove highlighted nodes within the range
                const parent = node.parentNode;
                while (node.firstChild) {
                    parent.insertBefore(node.firstChild, node);
                }
                parent.removeChild(node);
            }
        });
    }

    processRangeNodes(range);

    // Clear the selection after processing
    selection.removeAllRanges();
}

// The highlighting function is injected directly into the active tab
function highlightSentences() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);

  // Helper to determine if background is dark
  function isDarkMode() {
    const bgColor = window.getComputedStyle(document.body).backgroundColor;
    const rgb = bgColor.match(/\d+/g);
    if (!rgb) return false;
    // Calculate relative luminance
    const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
    return brightness < 128;
  }

  // Color palettes with opacity
  const lightModeColors = [
    'rgba(255, 229, 180, 0.5)',  // Peach
    'rgba(212, 241, 244, 0.5)',  // Light Blue
    'rgba(230, 230, 250, 0.5)',  // Lavender
    'rgba(255, 250, 205, 0.5)',  // Lemon Chiffon
    'rgba(245, 222, 179, 0.5)'   // Wheat
  ];

  const darkModeColors = [
    'rgba(255, 140, 0, 0.3)',    // Dark Orange
    'rgba(100, 149, 237, 0.3)',  // Cornflower Blue
    'rgba(147, 112, 219, 0.3)',  // Medium Purple
    'rgba(255, 215, 0, 0.3)',    // Gold
    'rgba(250, 128, 114, 0.3)'   // Salmon
  ];

  const colors = isDarkMode() ? darkModeColors : lightModeColors;
  let colorIndex = 0;

  // Get all computed styles to preserve
  function getPreservedStyles(node) {
    const computed = window.getComputedStyle(node);
    const styles = {};
    for (const style of computed) {
      styles[style] = computed.getPropertyValue(style);
    }
    return styles;
  }

  function wrapTextNode(node) {
    if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) return;

    // Get original styles before modification
    const originalStyles = getPreservedStyles(node.parentNode);
    
    const sentences = node.textContent.split(/(?<=[.!?])\s+/);
    const fragment = document.createDocumentFragment();

    sentences.forEach((sentence) => {
      if (!sentence.trim()) return;

      const wrapper = document.createElement('span');
      wrapper.textContent = sentence;
      
      // Apply original styles first
      Object.entries(originalStyles).forEach(([prop, value]) => {
        try {
          wrapper.style.setProperty(prop, value, 'important');
        } catch (e) {
          // Some properties might be read-only
        }
      });

      // Apply highlight color with increased contrast for dark mode
      const color = colors[colorIndex % colors.length];
      wrapper.style.setProperty('background-color', color, 'important');
      
      if (isDarkMode()) {
        wrapper.style.setProperty('color', '#ffffff', 'important');
        // Add subtle text shadow for better readability on dark backgrounds
        wrapper.style.setProperty('text-shadow', '0 1px 1px rgba(0,0,0,0.2)', 'important');
      }

      wrapper.style.setProperty('position', 'relative', 'important');
      wrapper.style.setProperty('display', 'inline', 'important');
      wrapper.style.setProperty('padding', '0 4px', 'important');
      wrapper.style.setProperty('margin', '0 2px', 'important');
      wrapper.style.setProperty('border-radius', '4px', 'important');
      wrapper.style.setProperty('transition', 'all 0.2s ease', 'important');
      wrapper.classList.add('sentence-highlight');

      // Create dismiss button
      const dismiss = document.createElement('div');
      Object.assign(dismiss.style, {
        display: 'none',
        position: 'absolute',
        top: '-8px',
        right: '-8px',
        width: '16px',
        height: '16px',
        lineHeight: '16px',
        textAlign: 'center',
        background: 'rgba(128,128,128,0.2)',
        color: '#666',
        borderRadius: '50%',
        cursor: 'pointer',
        fontSize: '12px',
        zIndex: '2147483647',
        userSelect: 'none'
      });
      
      dismiss.textContent = '×';
      dismiss.className = 'dismiss-highlight';
      
      dismiss.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const textNode = document.createTextNode(sentence + ' ');
        wrapper.parentNode.replaceChild(textNode, wrapper);
      });

      wrapper.appendChild(dismiss);
      
      // Add hover effect listener
      wrapper.addEventListener('mouseenter', () => {
        if (isDarkMode()) {
          wrapper.style.setProperty('filter', 'brightness(1.2)', 'important');
        } else {
          wrapper.style.setProperty('filter', 'brightness(0.85)', 'important');
        }
        wrapper.style.setProperty('box-shadow', '0 2px 4px rgba(0,0,0,0.1)', 'important');
        dismiss.style.display = 'block';
      });
      
      wrapper.addEventListener('mouseleave', () => {
        wrapper.style.setProperty('filter', 'none', 'important');
        wrapper.style.setProperty('box-shadow', 'none', 'important');
        dismiss.style.display = 'none';
      });

      fragment.appendChild(wrapper);
      fragment.appendChild(document.createTextNode(' '));
      colorIndex++;
    });

    node.parentNode.replaceChild(fragment, node);
  }

  function processRange(root) {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
          if (node.parentElement.isContentEditable) return NodeFilter.FILTER_REJECT;
          if (node.parentElement.closest('script,style,noscript,textarea')) return NodeFilter.FILTER_REJECT;
          if (node.parentElement.classList.contains('sentence-highlight')) return NodeFilter.FILTER_REJECT;
          return range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      }
    );

    const nodes = [];
    let node;
    while (node = walker.nextNode()) nodes.push(node);
    return nodes;
  }

  // Process main document
  processRange(range.commonAncestorContainer).forEach(wrapTextNode);

  // Process iframes
  document.querySelectorAll('iframe').forEach(iframe => {
    try {
      if (iframe.contentDocument) {
        processRange(iframe.contentDocument.body).forEach(wrapTextNode);
      }
    } catch (e) {
      // Cross-origin iframe, ignore
    }
  });

  // Handle Shadow DOM
  document.querySelectorAll('*').forEach(el => {
    if (el.shadowRoot) {
      processRange(el.shadowRoot).forEach(wrapTextNode);
    }
  });
}
