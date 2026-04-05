---
ordering: 3
icon: ⚙️
---
# Frontmatter

Every Doku document can include YAML frontmatter — metadata at the top of the file that controls behavior but is hidden in the editor UI.

## Format

Frontmatter is placed between `---` delimiters at the very start of the file:

```markdown
---
ordering: 5
---
# My Document Title

Content goes here...
```

## Available Fields

### ordering

* **Type:** number

* **Purpose:** Controls the position of this entry in the sidebar

* **Behavior:** Entries with ordering values appear first (sorted ascending). Entries without ordering appear after, sorted alphabetically by filename. Ordering works across both files and folders — they intermix freely.

### icon

* **Type:** string (emoji)

* **Purpose:** Sets a custom emoji icon for the document in the sidebar

* **Behavior:** When set, the emoji replaces the default file or folder icon. You can set it via the emoji picker in the toolbar or by editing the frontmatter directly.

```markdown
---
icon: 🚀
---
```

## How Frontmatter Is Handled

* **In the UI:** Frontmatter is completely invisible. The editor only shows the document body.

* **On save:** The editor preserves any existing frontmatter and re-attaches it to the saved content. Editing a document will never lose its frontmatter.

* **On disk:** Frontmatter is standard YAML and can be edited with any text editor.

## Editing Frontmatter

Since frontmatter is hidden in the Doku UI, you edit it directly in the `.md` file using a text editor. Open the file, change the `ordering` value (or add the frontmatter block), and save. The sidebar will reflect the change on the next page load or tree refresh.
