---
ordering: 2
---
# Block Elements

Block-level elements that structure your document.

## Headings

Use `#` symbols for headings, from level 1 (largest) to level 6 (smallest).

```text
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
```

The first `# Heading` in a file is used as the document's display name in the sidebar.

## Paragraphs

Separate paragraphs with a blank line between them.

```text
This is the first paragraph.

This is the second paragraph.
```

## Blockquotes

Start a line with `>` to create a blockquote.

> This is a blockquote.

```text
> This is a blockquote.
```

You can span multiple lines:

> First line of the quote. Second line continues here.

## Code Blocks

Wrap code in triple backticks. Add a language name after the opening backticks for syntax highlighting.

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
```

Supported languages include `javascript`, `python`, `html`, `css`, `json`, `bash`, `typescript`, and many more.

## Horizontal Rules

Place `---` on its own line to create a visual separator.

---

```text
Some content above.

---

Some content below.
```

You can also use `***` or `___` — all three produce the same result and save back as `---`.
