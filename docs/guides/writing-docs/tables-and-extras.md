---
ordering: 5
---
# Tables and Extras

Tables, emoji shortcodes, HTML symbols, and comments.

## Tables

Create tables with pipes and dashes.

| Name  | Role      | Status   |
| ----- | --------- | -------- |
| Alice | Developer | Active   |
| Bob   | Designer  | Active   |
| Carol | Manager   | On leave |

```text
| Name | Role | Status |
| --- | --- | --- |
| Alice | Developer | Active |
| Bob | Designer | Active |
| Carol | Manager | On leave |
```

The header row and separator row (`| --- |`) are required. You can add or remove columns and rows directly in the editor.

## Emoji Shortcodes

Type emoji shortcodes surrounded by colons. They render as unicode emoji in the editor and save back as shortcodes in the file.

:rocket: :fire: :star: :heart: :+1: :tada: :bulb: :warning:

```text
:rocket: :fire: :star: :heart: :+1: :tada: :bulb: :warning:
```

### Common Shortcodes

| Shortcode | Emoji | Shortcode | Emoji |
| --------- | ----- | --------- | ----- |
| `:smile:`      | :smile:    | `:heart:`      | :heart:    |
| `:+1:`      | :+1:    | `:-1:`      | :-1:    |
| `:fire:`      | :fire:    | `:star:`       | :star:     |
| `:rocket:`      | :rocket:    | `:tada:`      | :tada:    |
| `:warning:`      | :warning:    | `:bulb:`      | :bulb:    |
| `:check:`       | :check:     | `:x:`       | :x:     |
| `:bug:`      | :bug:    | `:wrench:`      | :wrench:    |
| `:memo:`      | :memo:    | `:zap:`       | :zap:     |
| `:eyes:`      | :eyes:    | `:thinking:`      | :thinking:    |
| `:coffee:`       | :coffee:     | `:sparkles:`       | :sparkles:     |

## HTML Symbols

Use HTML entities for special characters. They are converted to unicode automatically.

```text
&copy; &reg; &trade; &euro; &pound;
&rarr; &larr; &uarr; &darr;
&infin; &ne; &le; &ge;
&alpha; &beta; &pi; &omega;
```

Numeric entities also work: `©` for © and `❤` for ❤.

## Comments

Hide text from the editor using the markdown comment syntax. Comments are invisible in the UI but preserved in the file.

```text
[This comment is hidden]: #
[TODO: review later]: #
```

This is useful for leaving notes to yourself or other editors that shouldn't appear in the rendered document.

## Admonitions

Use emoji at the start of a blockquote for callout-style notes.

> :warning: **Warning:** Be careful with this operation.

> :bulb: **Tip:** This is a helpful suggestion.

> :memo: **Note:** Additional context goes here.

```text
> :warning: **Warning:** Be careful with this operation.

> :bulb: **Tip:** This is a helpful suggestion.
```
