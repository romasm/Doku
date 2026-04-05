---
ordering: 3
---
# File Format

Every document in Doku is a standard Markdown file with optional YAML frontmatter.

## Structure

```markdown
---
ordering: 5
---
# Document Title

Body content in standard Markdown...
```

## Frontmatter

The frontmatter block is optional. If present, it must be the very first thing in the file, enclosed in `---` delimiters.

### Supported Fields

| Field    | Type   | Description                                                                                                                                          |
| -------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| ordering | number | Controls position in the sidebar. Lower values appear first.                                                                                         |
| icon     | string | An emoji displayed instead of the default file/folder icon in the sidebar. Can be set via the emoji picker in the UI or directly in the frontmatter. |

Frontmatter is parsed by Doku's server and stripped before displaying in the editor. It is preserved transparently when saving from the UI.

## Folder Convention

Doku uses a sibling-file convention for folders:

```text
docs/
├── my-topic.md      ← folder index (sibling)
└── my-topic/        ← folder containing child docs
    ├── child-one.md
    └── child-two.md
```

When `my-topic.md` and `my-topic/` both exist at the same level, the entry appears as a folder in the sidebar. The `.md` file's content is shown when you click the folder, followed by a list of its children.

## Editor Metadata

The editor stores certain properties that standard Markdown cannot represent using HTML comments. These are transparent — the editor reads and writes them automatically.

### Block Styling

Block-level colors and alignment are stored as a comment on the line before the block:

```html
<!--blockProps:{"textColor":"red","textAlignment":"center"}-->
This paragraph has red text and is centered.
```

Supported properties: `textColor`, `backgroundColor`, `textAlignment` (left, center, right, justify).

### Inline Text Color

Inline text color is stored as comment tags wrapping the colored text:

```html
This has <!--tc:green-->green text<!--/tc--> in a sentence.
```

### Hidden Comments

Lines matching `[comment text]: #` are hidden in the editor and preserved on save. Use these for notes that shouldn't appear in the rendered document.

## Display Names

The sidebar title for each entry is determined by:

1. The first `# heading` in the file (preferred)

2. The filename converted to title case (fallback) — e.g. `my-document` becomes "My Document"

## Sorting Rules

1. Entries with an `ordering` value come first, sorted ascending by value

2. Entries without `ordering` come after, sorted alphabetically by filename

3. Files and folders intermix freely based on ordering — type does not affect position
