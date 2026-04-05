---
ordering: 1
---
# Basic Formatting

Inline text formatting you can use in any paragraph.

## Bold

Wrap text in double asterisks for **bold**.

```text
This is **bold text**.
```

## Italic

Wrap text in single asterisks for *italic*.

```text
This is *italic text*.
```

## Bold and Italic

Combine both with triple asterisks for ***bold and italic***.

```text
This is ***bold and italic***.
```

## Strikethrough

Wrap text in double tildes for ~~strikethrough~~.

```text
This is ~~strikethrough text~~.
```

## Highlight

Wrap text in `==double equals==` for a yellow highlight background.

```text
This is ==highlighted text==.
```

## Underline

Use `<ins>` tags or the keyboard shortcut **Ctrl+U** for underlined text.

```text
This is <ins>underlined text</ins>.
```

## Text Color

Select text and use the color picker in the toolbar to change its color. The color is saved in the file using HTML comment wrappers.

```text
This has <!--tc:red-->red text<!--/tc--> in it.
```

Available colors include red, orange, yellow, green, blue, purple, pink, gray, and brown.

## Background Color

Select a block and use the color picker to set a background color. This is saved as a metadata comment above the block.

```text
<!--blockProps:{"backgroundColor":"yellow"}-->
This paragraph has a yellow background.
```

## Text Alignment

Use the block menu to set alignment to center, right, or justify. This is saved as a metadata comment.

```text
<!--blockProps:{"textAlignment":"center"}-->
This paragraph is centered.
```

## Inline Code

Wrap text in backticks for `inline code`.

```text
Use the `console.log()` function.
```
