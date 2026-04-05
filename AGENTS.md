# Agents

Instructions for AI agents working with Doku documentation files.

## File Format

Every `.md` file in the docs folder must start with YAML frontmatter:

```markdown
---
ordering: 1
---
# Document Title

Content here...
```

- The `ordering` field is a number that controls sidebar position (lower = higher). It is required for all files that should appear in a specific order.
- The first `# heading` after frontmatter becomes the display name in the sidebar. Always include one.
- If a file has no frontmatter, add it. Never remove existing frontmatter.

## Folder Convention

Doku uses a sibling-file convention. A folder and its index are separate:

```
docs/
├── guides.md        ← index page for guides/ folder
├── guides/
│   ├── topic-a.md
│   └── topic-b.md
```

### Rules

- Every folder **must** have a sibling `.md` file with the same name (e.g. `guides/` requires `guides.md`).
- The sibling `.md` file is the folder's index/overview page.
- Never create a folder without its sibling `.md` file.
- Never delete a sibling `.md` file if its folder still exists.

## Creating Documents

When creating a new `.md` file:

1. Choose a URL-friendly filename: lowercase, hyphen-separated (e.g. `my-new-topic.md`).
2. Add frontmatter with an `ordering` value. Look at sibling files to pick an appropriate number.
3. Start with a `# Heading` that describes the document clearly.
4. Place the file in the correct folder based on its topic.

## Creating Folders

When creating a new folder:

1. Create the sibling `.md` index file first (e.g. `new-section.md`).
2. Add frontmatter with ordering to the index file.
3. Add a `# Heading` and a brief description of what the section contains.
4. Create the folder directory (e.g. `new-section/`).
5. Add child documents inside the folder.

## Editing Documents

- Preserve existing frontmatter. Never remove or change the `ordering` value unless explicitly asked.
- Preserve the `# heading` unless the document is being renamed.
- Do not add extra frontmatter fields beyond what Doku supports (`ordering`).

## Deleting Documents

- When deleting a file from a folder, check if it was the last child. If so, also delete the now-empty folder directory so the sibling `.md` reverts to a plain document.
- Never delete a folder's sibling `.md` index file unless you are also deleting the entire folder and all its contents.

## Special Files and Folders

These are excluded from the document tree and should not be treated as docs:

- `config.json` — project configuration (contains `projectName`, `port`)
- `assets/` — uploaded images, managed automatically by the app

Do not create, modify, or delete these unless specifically instructed.

## Ordering Guidelines

- Use gaps between ordering values (e.g. 10, 20, 30) to leave room for future insertions.
- Files without ordering appear after ordered files, sorted alphabetically.
- Ordering applies independently within each folder level.
- Files and folders intermix freely based on ordering — type does not affect position.
