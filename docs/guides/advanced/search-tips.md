---
ordering: 2
icon: 🔍
---
# Search Tips

How to get the most out of Doku's search feature.

## How Search Works

The search bar at the top of the sidebar performs full-text search across all `.md` files in your docs folder. It searches the body content (frontmatter is excluded) and also matches against filenames.

## Using Search

1. Click the search bar or press **Ctrl+K**

2. Type at least 2 characters to start searching

3. Results appear in a dropdown with the document title, path, and a snippet showing the match in context

4. Use **Arrow Up/Down** to navigate results, **Enter** to open, or click directly

5. Press **Escape** to close the results

## Tips

* Search is case-insensitive — "api" matches "API", "Api", and "api"

* Results are limited to 20 matches to keep things fast

* Matching text is highlighted in yellow in the result snippets

* Search queries are debounced (200ms) so results update as you type without overwhelming the server
