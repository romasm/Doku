---
ordering: 4
---
# External Editing

Since Doku stores everything as plain `.md` files, you can edit them with any tool.

## Editing with a Text Editor

Open any file in the `docs/` folder with VS Code, Notepad++, Vim, or any other editor. Changes are detected automatically and reflected in the browser within moments — no manual reload needed.

Things to keep in mind:

* Preserve the frontmatter block (`---` delimiters) at the top of the file if it exists

* Use standard Markdown syntax — Doku's editor (BlockNote) supports headings, bold, italic, lists, code blocks, and links

* The first `# heading` in the file becomes the display name in the sidebar

## Creating Files Manually

You can create new `.md` files directly on disk:

1. Create the file in the `docs/` folder (or a subfolder)

2. Add a `# Heading` as the first line for the display name

3. Optionally add frontmatter with an `ordering` value

4. The new file appears in the sidebar automatically

## Creating Folders Manually

To create a folder:

1. Create `my-folder.md` with a `# heading` (this becomes the folder index)

2. Create a `my-folder/` directory next to it

3. Add `.md` files inside the directory

The folder will appear in the sidebar with the heading from `my-folder.md` as its name.

## Syncing with Dropbox / Git

Doku's file-based storage works naturally with sync tools:

* **Dropbox** — place the `docs/` folder in Dropbox for automatic cloud sync

* **Git** — version control your docs by committing the `docs/` folder

* **Any sync tool** — OneDrive, Syncthing, rsync, etc.

Doku has no locking mechanism, so avoid editing the same file simultaneously from the UI and an external editor.
