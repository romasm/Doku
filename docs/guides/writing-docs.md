---
ordering: 1
---
# Writing Documents

How to create and edit documents in Doku.

## Creating a Document

There are two ways to create a new document:

* Click the **+ New Document** button at the bottom of the sidebar to create a root-level document

* Click the **+** button next to any existing entry in the sidebar to create a child document

When you create a document, you'll be prompted for a name. The name is converted to a URL-friendly slug (lowercase, hyphens instead of spaces) for the filename, while the display name in the sidebar comes from the `# heading` in the file.

## Editing

Doku uses BlockNote, a Notion-like block editor. You can:

* Type text and use keyboard shortcuts for formatting (Ctrl+B for bold, Ctrl+I for italic)

* Create headings, bullet lists, numbered lists, and code blocks

* Drag blocks to reorder content within a document

* Change text and background colors via the toolbar color picker

* Set block alignment (left, center, right) via the block menu

Changes are saved automatically after 1 second of inactivity. There is no manual save button — just type and your work is preserved. All formatting — including colors, alignment, highlights, and underlines — is preserved in the markdown file.

## Page Icons

Click the smiley face button next to the breadcrumb path to open the emoji picker and set a page icon. The chosen emoji replaces the default file or folder icon in the sidebar.

To remove an icon, open the picker and click the clear button.

Icons are stored as an `icon` field in the document's frontmatter:

```markdown
---
ordering: 1
icon: 🚀
---
```

## Deleting a Document

Click the **Delete** button in the top-right toolbar of any document. Deleting a folder index page will also delete the folder and all its children.
