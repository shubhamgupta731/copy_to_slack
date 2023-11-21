document.addEventListener('keydown', function(e) {
  // Example: Ctrl+Shift+C to copy as Markdown
  if (e.ctrlKey && e.shiftKey && e.code === 'KeyC') {
    let selection = window.getSelection();
    let selectedText = selection.toString();
    let range = selection.getRangeAt(0);
    let container = document.createElement('div');
    container.appendChild(range.cloneContents());

    // Convert HTML to Markdown
    let markdown = htmlToMarkdown(container);
    navigator.clipboard.writeText(markdown).catch((error) => {
      console.error('Clipboard write failed: ', error);
    });
  }
});

function htmlToMarkdown(element, listType = '', depth = 0, recursion_depth = 0) {
  if (recursion_depth > 512) {
    console.log("Recursion depth reachd");
    return;
  }
  let children = element.childNodes;
  let markdownText = '';
  let indent = ' '.repeat(2 * depth); // 2 spaces per indentation level

  children.forEach(function(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      markdownText += node.nodeValue;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      switch (node.tagName.toLowerCase()) {
        case 'strong':
        case 'h3':
        case 'b':
          markdownText += `*${htmlToMarkdown(node, listType, depth, recursion_depth + 1)}*`;
          break;
        case 'code':
          markdownText += `\`${htmlToMarkdown(node, listType, depth, recursion_depth + 1)}\``;
          break;
        case 'em':
        case 'i':
          markdownText += `*${htmlToMarkdown(node, listType, depth, recursion_depth + 1)}*`;
          break;
        case 'ul':
          markdownText += convertList(node, '-', depth);
          break;
        case 'ol':
          markdownText += convertList(node, '1.', depth);
          break;
        case 'li':
          let bullet = listType === '-' ? '- ' : `${depth}. `;
          markdownText += `${indent}${bullet}${htmlToMarkdown(node, listType, depth + 1, recursion_depth + 1)}\n`;
          break;
        // Add more HTML tag cases as needed
        default:
          markdownText += htmlToMarkdown(node, listType, depth, recursion_depth + 1); // Recurse for other elements
      }
    }
  });

  return markdownText;
}

function convertList(listElement, listType, depth) {
  let markdown = '';
  let itemNumber = 1;

  listElement.childNodes.forEach(function(node, index) {
    if (node.tagName && node.tagName.toLowerCase() === 'li') {
      let bullet = listType === '-' ? '- ' : `${itemNumber++}. `;
      let prefix = index === 0 ? '\n' : ''; // New line for the first list item
      markdown += `${prefix}${' '.repeat(2 * depth)}${bullet}${htmlToMarkdown(node, listType, depth + 1)}\n`;
    }
  });

  return markdown;
}

