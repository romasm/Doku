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

Wrap text in double equals signs for ==highlighted text==.

```text
This is ==highlighted text==.
```

The text renders with a yellow background in the editor and saves back as `==text==` in the markdown file.

## Underline

Use HTML `<ins>` tags for <ins>underlined text</ins>.

```text
This is <ins>underlined text</ins>.
```

You can also use the keyboard shortcut **Ctrl+U** in the editor.

## Text Color

Select text and use the color picker in the toolbar to change its color. The color is saved in the markdown file as an HTML comment wrapper:

```text
This has <!--tc:red-->red text<!--/tc--> in a sentence.
```

Available colors include red, orange, yellow, green, blue, purple, pink, gray, and brown.

## Background Color

Select a block and use the color picker to set a background color. This is saved as a block metadata comment:

```text
<!--blockProps:{"backgroundColor":"yellow"}-->
This paragraph has a yellow background.
```

## Text Alignment

Use the block menu (click the drag handle or press `/`) to set alignment to center, right, or justify:

```text
<!--blockProps:{"textAlignment":"center"}-->
This paragraph is centered.
```

## Inline Code

Wrap text in backticks for `inline code`.

```text
Use the `console.log()` function.
```
