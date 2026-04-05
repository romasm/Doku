// Convert BlockNote blocks to markdown with image properties preserved as HTML <img> tags.
// BlockNote's blocksToMarkdownLossy outputs ![caption](url) which loses width and alignment.
// BlockNote uses `previewWidth` (not `width`) for image resize.

export async function blocksToMarkdown(editor) {
  const blocks = editor.document;
  const md = await editor.blocksToMarkdownLossy(blocks);

  // Build a map of image URLs to their props from the blocks
  const imageProps = {};
  function collectProps(blockList) {
    for (const block of blockList) {
      if (block.type === 'image' && block.props?.url) {
        const previewWidth = block.props.previewWidth;
        const textAlignment = block.props.textAlignment;
        const hasCustomWidth = previewWidth !== undefined && previewWidth !== null;
        const hasCustomAlign = textAlignment && textAlignment !== 'left';
        if (hasCustomWidth || hasCustomAlign) {
          imageProps[block.props.url] = { previewWidth, textAlignment };
        }
      }
      if (block.children) {
        collectProps(block.children);
      }
    }
  }
  collectProps(blocks);

  // Replace ![caption](url) with <img> tags that include width and alignment
  const result = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
    const props = imageProps[url];
    if (!props) return match;

    const attrs = [`src="${url}"`, `alt="${alt}"`];
    if (props.previewWidth) attrs.push(`width="${props.previewWidth}"`);

    const img = `<img ${attrs.join(' ')} />`;

    if (props.textAlignment && props.textAlignment !== 'left') {
      const align = props.textAlignment === 'center' ? 'center' : 'right';
      return `<div align="${align}">${img}</div>`;
    }

    return img;
  });

  return result;
}

// Convert <img> tags (and wrapping <div align>) back to markdown ![caption](url),
// storing width and alignment to restore on blocks after parsing.
export function preprocessMarkdown(body) {
  const imageProps = {};

  // First handle <div align="..."><img .../></div> patterns
  let processed = body.replace(
    /<div\s+align="([^"]*)">\s*<img\s+([^>]*)\/?\s*>\s*<\/div>/gi,
    (match, align, imgAttrs) => {
      const srcMatch = imgAttrs.match(/src="([^"]*)"/i);
      const altMatch = imgAttrs.match(/alt="([^"]*)"/i);
      const widthMatch = imgAttrs.match(/width="([^"]*)"/i);
      if (!srcMatch) return match;
      const src = srcMatch[1];
      const alt = altMatch ? altMatch[1] : '';
      imageProps[src] = {
        textAlignment: align === 'center' ? 'center' : align === 'right' ? 'right' : 'left',
      };
      if (widthMatch) {
        imageProps[src].previewWidth = Number(widthMatch[1]) || widthMatch[1];
      }
      return `![${alt}](${src})`;
    }
  );

  // Then handle standalone <img> tags (no wrapping div)
  processed = processed.replace(
    /<img\s+([^>]*)\/?\s*>/gi,
    (match, attrs) => {
      const srcMatch = attrs.match(/src="([^"]*)"/i);
      const altMatch = attrs.match(/alt="([^"]*)"/i);
      const widthMatch = attrs.match(/width="([^"]*)"/i);
      if (!srcMatch) return match;
      const src = srcMatch[1];
      const alt = altMatch ? altMatch[1] : '';
      if (widthMatch) {
        if (!imageProps[src]) imageProps[src] = {};
        imageProps[src].previewWidth = Number(widthMatch[1]) || widthMatch[1];
      }
      return `![${alt}](${src})`;
    }
  );

  return { processed, imageProps };
}

// After parsing markdown to blocks, restore image previewWidth and alignment
export function restoreImageWidths(blocks, imageProps) {
  for (const block of blocks) {
    if (block.type === 'image' && block.props?.url && imageProps[block.props.url]) {
      const props = imageProps[block.props.url];
      if (props.previewWidth) block.props.previewWidth = props.previewWidth;
      if (props.textAlignment) block.props.textAlignment = props.textAlignment;
    }
    if (block.children) {
      restoreImageWidths(block.children, imageProps);
    }
  }
  return blocks;
}
