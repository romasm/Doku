---
ordering: 2
---
# Organizing Content

How to structure your documentation using folders, ordering, and naming conventions.

## Folder Structure

Documents can be organized into folders to any depth. On disk, the structure looks like:

```
docs/
├── getting-started.md        ← standalone document
├── guides.md                 ← folder index for guides/
├── guides/
│   ├── writing-docs.md
│   └── organizing-content.md
├── reference.md              ← folder index for reference/
└── reference/
    ├── api.md
    └── configuration.md
```

The key rule: every folder has a **sibling `.md` file** with the same name that serves as its index page. For example, `guides/` has `guides.md` next to it.

## Converting a Document to a Folder

Click the **+** button next to any document in the sidebar. This:

1. Creates a subfolder with the document's name
2. The original `.md` file becomes the folder's index page
3. The new child document is created inside the folder

The document's position in the sidebar stays the same — ordering is preserved.

## Auto-Cleanup

When you delete the last child document from a folder, the empty folder is automatically removed. The sibling `.md` file remains, reverting the entry back to a plain document.

## Ordering

Each document can have an `ordering` field in its frontmatter:

```markdown
---
ordering: 1
---
# My Document
```

Documents with ordering values appear first in the sidebar (sorted by value, ascending). Documents without ordering appear after, sorted alphabetically. Ordering works across both files and folders — they intermix freely based on their ordering value.

## Display Names

The sidebar displays the first `# heading` from each file as its name. If no heading is found, the filename is converted to title case (e.g. `my-document` becomes "My Document").
