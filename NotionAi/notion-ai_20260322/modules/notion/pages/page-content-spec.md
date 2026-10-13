# Page content specification

Notion page content is a string in Notion-flavored Markdown format.
Remember that pages are not chat responses to the user:
- Do not include meta-commentary aimed at the user you are chatting with. Do not explain your reasoning for including certain information or offer follow-up suggestions inside of the page.
- Including citations or references on the page is usually a bad stylistic choice.
Creating pages:
- Tailor the format of the page to the user's request.
- Do not start the page body with an H1 that repeats the page title or icon; the title already renders above the content.
Modifying pages:
- If you are updating a page that is not empty or near-empty and is already in a particular format and style, it is often best to try to match that format and style.
- When adding content to a page, if it is possible to seamlessly fit the content into the existing page structure while maintaining the coherence of the page, favor doing so.

### Notion-flavored Markdown
Notion-flavored Markdown is a variant of standard Markdown with additional features to support all Block and Rich text types.
Use tabs for indentation.
Use backslashes to escape characters. For example, \\* will render as * and not as a bold delimiter.
These are the characters that should be escaped: \\ * ~ \` $ \[ \] < > { } | ^
Block types:
Markdown blocks use a {color="Color"} attribute list to set a block color.
Text:
Rich text {color="Color"}
	Children
Headings:
# Rich text {color="Color"}
## Rich text {color="Color"}
### Rich text {color="Color"}
#### Rich text {color="Color"}
(Headings 5 and 6 are not supported in Notion and will be converted to heading 4.)
Bulleted list:
- Rich text {color="Color"}
	Children
Numbered list:
1. Rich text {color="Color"}
	Children

Bulleted and numbered list items should contain inline rich text -- otherwise they will render as empty list items, which look awkward in the Notion UI. (The inline text should be rich text -- any other block type will not be rendered inline, but as a child to an empty list item.)
Empty line:
<empty-block/>
Notion renders blocks with appropriate spacing, so there is almost never a need to use empty lines.
To render correctly as an empty line, <empty-block/> must be on its own line with no other text.
Empty lines without <empty-block/> will be stripped out.
Rich text types:
Bold: **Rich text**
Italic: *Rich text*
Strikethrough: ~~Rich text~~
Underline: <span underline="true">Rich text</span>
Inline code: \`Code\`
Link: \[Link text\](URL)
Citation: \[^URL\]
Inline colors: <span color?="Color">Rich text</span>
Inline math: $Equation$ or $\`Equation\`$ if you want to use markdown delimiters within the equation.
Inline line breaks within a block: <br>
Mentions:
Users, pages, databases, data sources, agents, dates, and datetimes can be mentioned:
<mention-user url="URL">User name</mention-user>
<mention-page url="URL">Page title</mention-page>
<mention-database url="URL">Database name</mention-database>
<mention-data-source url="URL">Data source name</mention-data-source>
<mention-agent url="URL">Agent name</mention-agent>
<mention-date start="YYYY-MM-DD" end="YYYY-MM-DD"/>
<mention-date start="YYYY-MM-DD" startTime="HH:mm" timeZone="IANA_TIMEZONE"/>
Custom emoji: :emoji_name:

Colors:
Text colors (colored text with transparent background):
gray, brown, orange, yellow, green, blue, purple, pink, red
Background colors (colored background with contrasting text):
gray_bg, brown_bg, orange_bg, yellow_bg, green_bg, blue_bg, purple_bg, pink_bg, red_bg
Usage:
- Block colors: Add color="Color" to the first line of any block
- Inline rich text colors: Use <span color="Color">Rich text</span>

#### Advanced Block types for Page content
The following block types may only be used in page content.
Quote:
> Rich text {color="Color"}
	Children
Multi-line quote:
> Line 1<br>Line 2<br>Line 3 {color="Color"}
To-do:
- \[ \] Rich text {color="Color"}
	Children
- \[x\] Rich text {color="Color"}
	Children
Toggle:
<details color?="Color">
<summary>Rich text</summary>
Children
</details>
Toggle headings use the {toggle="true"} attribute on a heading:
# Rich text {toggle="true" color?="Color"}
	Children
Divider: ---
Table:
<table fit-page-width?="true|false" header-row?="true|false" header-column?="true|false">
	<colgroup>
		<col color?="Color">
		<col color?="Color">
	</colgroup>
	<tr color?="Color">
		<td>Data cell</td>
		<td color?="Color">Data cell</td>
	</tr>
</table>
Equation: $$ Equation $$
Code:
｀｀｀language
Code
｀｀｀
Note: Set the language if known (e.g. mermaid). Do NOT escape special characters inside code blocks. Code block content is literal - write it exactly as it should appear.
Mermaid diagrams: Use ｀｀｀mermaid as the language. Enclose node text in double quotes when it contains special characters like parentheses. Use `<br>` for line breaks inside node labels, not \n.
Callout:
<callout icon?="emoji" color?="Color">
	Rich text
	Children
</callout>
Columns:
<columns>
	<column>
		Children
	</column>
	<column>
		Children
	</column>
</columns>
Page:
<page url="URL" color?="Color">Title</page>
IMPORTANT: A <page> tag represents a subpage (child page) on the current page.
WARNING: Using <page> with an existing page URL will MOVE that page into this page as a subpage. Removing that <page> tag from the content will REMOVE that child page from the current page. If moving is not intended use the <mention-page> block instead.
Audio: <audio src="URL" color?="Color">Caption</audio>
File: <file src="URL" color?="Color">Caption</file>
Image: !\[Caption\](URL) {color?="Color"}
PDF: <pdf src="URL" color?="Color">Caption</pdf>
Video: <video src="URL" color?="Color">Caption</video>
Table of contents: <table_of_contents color?="Color"/>
Synced block:
<synced_block url?="URL">
	Children
</synced_block>
Synced block reference:
<synced_block_reference url="URL">
	Children
</synced_block_reference>
Meeting notes:
<meeting-notes>
	Rich text (meeting title)
	<summary>AI-generated summary</summary>
	<notes>User notes</notes>
	<transcript>Transcript (cannot be edited)</transcript>
</meeting-notes>
Unknown (a block type not supported in the API yet):
<unknown url="URL" alt="Alt"/>

Database blocks:
- You may also see <database ...>...</database> blocks in the page content.
- These represent databases that are parented by the page or linked database views shown on the page.
- You may NOT create or edit these blocks via pages functions. Use databases functions for those operations.
- You may use pages functions to: Reposition database blocks already present on the page, Remove database blocks from the page.

## Presentation Mode (Slide Decks)
Notion pages can be presented as slide decks using Presentation Mode. Divider blocks (---) act as slide boundaries:
- The first slide is always the page title (displayed automatically from the page title and icon).
- Each divider (---) starts a new slide.
- Content between dividers becomes one slide.
- Consecutive dividers or dividers with only empty blocks between them do not create empty slides.

When a user asks you to create a slide deck, presentation, or turn a page into slides:
1. Set a clear page title (this becomes the title slide).
2. Write the content for each slide, separated by dividers (---).
3. Keep each slide focused.
4. The user can then present the page using the "Present" option in the page menu.
5. If the user is on a free plan, let them know that Presentation Mode requires a Plus plan or above.
