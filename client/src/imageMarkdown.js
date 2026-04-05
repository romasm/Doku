// Convert BlockNote blocks to markdown with image properties preserved as HTML <img> tags.
// BlockNote's blocksToMarkdownLossy outputs ![caption](url) which loses width and alignment.
// BlockNote uses `previewWidth` (not `width`) for image resize.
//
// Also handles roundtripping for:
// - Horizontal rules (--- / *** / ___)
// - Emoji shortcodes (:name:)
// - Highlight (==text==)

// ── Emoji shortcode <-> unicode mapping ─────────────────────────────────────

const EMOJI_MAP = {
  '+1': '\u{1F44D}', '-1': '\u{1F44E}', '100': '\u{1F4AF}',
  'anger': '\u{1F4A2}', 'apple': '\u{1F34E}',
  'baby': '\u{1F476}', 'beer': '\u{1F37A}', 'beers': '\u{1F37B}',
  'bell': '\u{1F514}', 'blob': '\u{1F4A7}', 'blue_heart': '\u{1F499}',
  'blush': '\u{1F60A}', 'bomb': '\u{1F4A3}', 'book': '\u{1F4D6}',
  'bookmark': '\u{1F516}', 'boom': '\u{1F4A5}', 'broken_heart': '\u{1F494}',
  'bug': '\u{1F41B}', 'bulb': '\u{1F4A1}',
  'calendar': '\u{1F4C5}', 'camera': '\u{1F4F7}', 'cat': '\u{1F431}',
  'chart_with_upwards_trend': '\u{1F4C8}', 'check': '\u2705',
  'checkered_flag': '\u{1F3C1}', 'clap': '\u{1F44F}',
  'clipboard': '\u{1F4CB}', 'clock': '\u{1F552}', 'cloud': '\u2601\uFE0F',
  'coffee': '\u2615', 'cold_sweat': '\u{1F630}', 'computer': '\u{1F4BB}',
  'confused': '\u{1F615}', 'construction': '\u{1F6A7}',
  'cool': '\u{1F60E}', 'copyright': '\u00A9\uFE0F', 'crossed_fingers': '\u{1F91E}',
  'crown': '\u{1F451}', 'cry': '\u{1F622}', 'crystal_ball': '\u{1F52E}',
  'dart': '\u{1F3AF}', 'disappointed': '\u{1F61E}', 'dizzy': '\u{1F4AB}',
  'dog': '\u{1F436}', 'dollar': '\u{1F4B5}',
  'earth_americas': '\u{1F30E}', 'email': '\u{1F4E7}', 'exclamation': '\u2757',
  'eyes': '\u{1F440}',
  'face_with_rolling_eyes': '\u{1F644}', 'fire': '\u{1F525}',
  'fist': '\u270A', 'flag_white': '\u{1F3F3}\uFE0F', 'flashlight': '\u{1F526}',
  'flower_playing_cards': '\u{1F3B4}', 'flushed': '\u{1F633}',
  'folder': '\u{1F4C1}', 'footprints': '\u{1F463}',
  'gear': '\u2699\uFE0F', 'gem': '\u{1F48E}', 'ghost': '\u{1F47B}',
  'gift': '\u{1F381}', 'globe_with_meridians': '\u{1F310}',
  'grin': '\u{1F601}', 'grimacing': '\u{1F62C}',
  'green_heart': '\u{1F49A}', 'grinning': '\u{1F600}',
  'hammer': '\u{1F528}', 'handshake': '\u{1F91D}', 'hash': '#\uFE0F\u20E3',
  'heart': '\u2764\uFE0F', 'heart_eyes': '\u{1F60D}',
  'heavy_check_mark': '\u2714\uFE0F', 'heavy_minus_sign': '\u2796',
  'heavy_plus_sign': '\u2795', 'herb': '\u{1F33F}',
  'house': '\u{1F3E0}', 'hugs': '\u{1F917}', 'hushed': '\u{1F62F}',
  'idea': '\u{1F4A1}', 'information_source': '\u2139\uFE0F',
  'innocent': '\u{1F607}',
  'joy': '\u{1F602}',
  'key': '\u{1F511}', 'keyboard': '\u2328\uFE0F', 'kissing_heart': '\u{1F618}',
  'laughing': '\u{1F606}', 'left_right_arrow': '\u2194\uFE0F',
  'lemon': '\u{1F34B}', 'light_rail': '\u{1F688}', 'link': '\u{1F517}',
  'lock': '\u{1F512}', 'love_letter': '\u{1F48C}',
  'mag': '\u{1F50D}', 'medal': '\u{1F3C5}', 'mega': '\u{1F4E3}',
  'memo': '\u{1F4DD}', 'moneybag': '\u{1F4B0}',
  'monkey': '\u{1F435}', 'moon': '\u{1F319}', 'muscle': '\u{1F4AA}',
  'musical_note': '\u{1F3B5}',
  'nail_care': '\u{1F485}', 'nerd_face': '\u{1F913}', 'neutral_face': '\u{1F610}',
  'no_entry': '\u26D4', 'no_good': '\u{1F645}',
  'ocean': '\u{1F30A}', 'ok': '\u{1F44C}', 'ok_hand': '\u{1F44C}',
  'open_mouth': '\u{1F62E}',
  'package': '\u{1F4E6}', 'palm_tree': '\u{1F334}', 'party_popper': '\u{1F389}',
  'pencil': '\u270F\uFE0F', 'pencil2': '\u270F\uFE0F',
  'pensive': '\u{1F614}', 'pill': '\u{1F48A}', 'pizza': '\u{1F355}',
  'point_down': '\u{1F447}', 'point_left': '\u{1F448}',
  'point_right': '\u{1F449}', 'point_up': '\u261D\uFE0F',
  'point_up_2': '\u{1F446}', 'pray': '\u{1F64F}',
  'purple_heart': '\u{1F49C}', 'pushpin': '\u{1F4CC}',
  'question': '\u2753',
  'rainbow': '\u{1F308}', 'raised_hands': '\u{1F64C}',
  'relaxed': '\u263A\uFE0F', 'relieved': '\u{1F60C}',
  'rocket': '\u{1F680}', 'rofl': '\u{1F923}', 'rose': '\u{1F339}',
  'rotating_light': '\u{1F6A8}',
  'santa': '\u{1F385}', 'satisfied': '\u{1F606}', 'scream': '\u{1F631}',
  'see_no_evil': '\u{1F648}', 'shield': '\u{1F6E1}\uFE0F',
  'ship': '\u{1F6A2}', 'skull': '\u{1F480}',
  'sleeping': '\u{1F634}', 'slightly_smiling_face': '\u{1F642}',
  'smile': '\u{1F604}', 'smiley': '\u{1F603}',
  'smiling_imp': '\u{1F608}', 'smirk': '\u{1F60F}',
  'snowflake': '\u2744\uFE0F', 'sob': '\u{1F62D}',
  'sparkle': '\u2747\uFE0F', 'sparkles': '\u2728',
  'sparkling_heart': '\u{1F496}', 'speak_no_evil': '\u{1F64A}',
  'speech_balloon': '\u{1F4AC}', 'star': '\u2B50',
  'star2': '\u{1F31F}', 'stopwatch': '\u23F1\uFE0F',
  'stuck_out_tongue': '\u{1F61B}',
  'stuck_out_tongue_winking_eye': '\u{1F61C}',
  'sun_with_face': '\u{1F31E}', 'sunglasses': '\u{1F60E}',
  'sweat': '\u{1F613}', 'sweat_drops': '\u{1F4A6}',
  'sweat_smile': '\u{1F605}', 'tada': '\u{1F389}',
  'target': '\u{1F3AF}', 'telephone': '\u260E\uFE0F',
  'thinking': '\u{1F914}', 'thought_balloon': '\u{1F4AD}',
  'thumbsdown': '\u{1F44E}', 'thumbsup': '\u{1F44D}',
  'tiger': '\u{1F42F}', 'tired_face': '\u{1F62B}',
  'tongue': '\u{1F445}', 'top': '\u{1F51D}',
  'trophy': '\u{1F3C6}', 'truck': '\u{1F69A}',
  'turtle': '\u{1F422}', 'two_hearts': '\u{1F495}',
  'umbrella': '\u2614', 'unamused': '\u{1F612}',
  'unicorn': '\u{1F984}', 'unlock': '\u{1F513}',
  'v': '\u270C\uFE0F', 'warning': '\u26A0\uFE0F',
  'wave': '\u{1F44B}', 'weary': '\u{1F629}',
  'white_check_mark': '\u2705', 'wink': '\u{1F609}',
  'wolf': '\u{1F43A}', 'woman': '\u{1F469}',
  'wrench': '\u{1F527}', 'writing_hand': '\u270D\uFE0F',
  'x': '\u274C', 'yellow_heart': '\u{1F49B}',
  'yum': '\u{1F60B}', 'zap': '\u26A1', 'zzz': '\u{1F4A4}',
};

// Build reverse map (unicode → shortcode) for export
const UNICODE_TO_EMOJI = {};
for (const [code, unicode] of Object.entries(EMOJI_MAP)) {
  UNICODE_TO_EMOJI[unicode] = code;
}

// Regex to match all unicode emoji we know about (sorted longest first to avoid partial matches)
const emojiUnicodes = Object.keys(UNICODE_TO_EMOJI).sort((a, b) => b.length - a.length);
const UNICODE_EMOJI_RE = emojiUnicodes.length
  ? new RegExp(`(${emojiUnicodes.map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g')
  : null;

function replaceEmojiShortcodes(text) {
  return text.replace(/:([a-z0-9_+-]+):/gi, (match, name) => {
    return EMOJI_MAP[name] || match;
  });
}

function replaceUnicodeWithShortcodes(text) {
  if (!UNICODE_EMOJI_RE) return text;
  return text.replace(UNICODE_EMOJI_RE, (match) => {
    const code = UNICODE_TO_EMOJI[match];
    return code ? `:${code}:` : match;
  });
}

// ── Horizontal rule marker ──────────────────────────────────────────────────

const HR_PLACEHOLDER = '\u2500\u2500\u2500'; // ───

// ── Highlight ==text== ──────────────────────────────────────────────────────

const HIGHLIGHT_OPEN = '\uFFF0HL\uFFF0';
const HIGHLIGHT_CLOSE = '\uFFF0/HL\uFFF0';

// ── Export: blocks → markdown ───────────────────────────────────────────────

export async function blocksToMarkdown(editor) {
  const blocks = editor.document;

  // Deep-clone blocks so we don't mutate the live editor
  const cloned = JSON.parse(JSON.stringify(blocks));

  // Collect image props from cloned blocks
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
  collectProps(cloned);

  // Inject highlight markers into blocks that have yellow backgroundColor
  injectHighlightMarkers(cloned);

  let md = await editor.blocksToMarkdownLossy(cloned);

  // Restore horizontal rules: paragraph containing only HR_PLACEHOLDER → ---
  md = md.replace(new RegExp(`^${HR_PLACEHOLDER}$`, 'gm'), '---');

  // Restore highlight markers to ==text==
  md = md.replace(
    new RegExp(`${HIGHLIGHT_OPEN}(.*?)${HIGHLIGHT_CLOSE}`, 'g'),
    '==$1=='
  );

  // Restore emoji unicode → shortcodes
  md = replaceUnicodeWithShortcodes(md);

  // Replace ![caption](url) with <img> tags that include width and alignment
  md = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
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

  return md;
}

// ── Import: markdown → blocks preprocessing ─────────────────────────────────

export function preprocessMarkdown(body) {
  const imageProps = {};

  // Emoji shortcodes → unicode (before any other processing)
  let processed = replaceEmojiShortcodes(body);

  // Horizontal rules: --- or *** or ___ on their own line → placeholder paragraph
  processed = processed.replace(/^[ \t]*([-*_])\1{2,}[ \t]*$/gm, HR_PLACEHOLDER);

  // Highlight: ==text== → marker tokens (before BlockNote strips them)
  processed = processed.replace(/==(.*?)==/g, `${HIGHLIGHT_OPEN}$1${HIGHLIGHT_CLOSE}`);

  // Handle <div align="..."><img .../></div> patterns
  processed = processed.replace(
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

  // Handle standalone <img> tags (no wrapping div)
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

// ── Post-parse: restore properties on blocks ────────────────────────────────

export function restoreImageWidths(blocks, imageProps) {
  for (const block of blocks) {
    if (block.type === 'image' && block.props?.url && imageProps[block.props.url]) {
      const props = imageProps[block.props.url];
      if (props.previewWidth) block.props.previewWidth = props.previewWidth;
      if (props.textAlignment) block.props.textAlignment = props.textAlignment;
    }

    // Restore highlight markers → backgroundColor on inline content
    if (block.content && Array.isArray(block.content)) {
      block.content = restoreHighlights(block.content);
    }

    if (block.children) {
      restoreImageWidths(block.children, imageProps);
    }
  }
  return blocks;
}

// Convert highlight marker tokens in inline content to backgroundColor style
function restoreHighlights(contentArray) {
  const result = [];
  for (const item of contentArray) {
    if (item.type === 'text' && typeof item.text === 'string' && item.text.includes(HIGHLIGHT_OPEN)) {
      // Split text around highlight markers and produce styled segments
      const parts = splitHighlightMarkers(item.text);
      for (const part of parts) {
        result.push({
          ...item,
          text: part.text,
          styles: part.highlighted
            ? { ...item.styles, backgroundColor: 'yellow' }
            : item.styles,
        });
      }
    } else {
      result.push(item);
    }
  }
  return result;
}

// Before markdown export, wrap yellow-backgrounded text in highlight markers
// so blocksToMarkdownLossy includes them in the output
function injectHighlightMarkers(blocks) {
  for (const block of blocks) {
    if (block.content && Array.isArray(block.content)) {
      for (const item of block.content) {
        if (item.type === 'text' && item.styles?.backgroundColor === 'yellow') {
          item.text = `${HIGHLIGHT_OPEN}${item.text}${HIGHLIGHT_CLOSE}`;
        }
      }
    }
    if (block.children) {
      injectHighlightMarkers(block.children);
    }
  }
}

function splitHighlightMarkers(text) {
  const parts = [];
  let remaining = text;
  while (remaining.length > 0) {
    const openIdx = remaining.indexOf(HIGHLIGHT_OPEN);
    if (openIdx === -1) {
      if (remaining) parts.push({ text: remaining, highlighted: false });
      break;
    }
    if (openIdx > 0) {
      parts.push({ text: remaining.slice(0, openIdx), highlighted: false });
    }
    remaining = remaining.slice(openIdx + HIGHLIGHT_OPEN.length);
    const closeIdx = remaining.indexOf(HIGHLIGHT_CLOSE);
    if (closeIdx === -1) {
      // No close marker — treat rest as highlighted
      if (remaining) parts.push({ text: remaining, highlighted: true });
      break;
    }
    parts.push({ text: remaining.slice(0, closeIdx), highlighted: true });
    remaining = remaining.slice(closeIdx + HIGHLIGHT_CLOSE.length);
  }
  return parts;
}
