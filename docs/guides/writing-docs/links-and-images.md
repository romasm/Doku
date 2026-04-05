---
ordering: 4
---
# Links and Images

How to add hyperlinks and images to your documents.

## Links

Use `[text](url)` to create a link.

[Example link](https://example.com)

```text
[Example link](https://example.com)
```

You can also link to other documents using relative paths, or paste a URL directly and it will become clickable.

## Images

### Drag and Drop

The easiest way to add an image is to drag and drop it into the editor. The file is uploaded to `docs/assets/` automatically and an image block is inserted.

### Markdown Syntax

You can also write image syntax directly:

```text
![Description of the image](/api/assets/filename.png)
```

Images support resizing by dragging the handles in the editor, and alignment (left, center, right) via the block menu. These properties are preserved in the markdown file.
