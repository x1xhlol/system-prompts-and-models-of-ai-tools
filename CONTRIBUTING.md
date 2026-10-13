# Contributing

Thanks for helping improve this collection of AI system prompts, model notes, and tool definitions. Contributions are easiest to review when they are small, sourced, and careful with privacy.

## What To Contribute

- New prompt or tool dumps for AI products that are not already covered.
- Updates to existing prompts when the product, model, or tool surface has changed.
- Formatting fixes that make prompt files easier to read without changing meaning.
- Validity fixes for structured files, especially JSON tool definitions.
- Source notes, dates, or reproduction details that make an existing entry easier to verify.

## Before Opening A PR

1. Search existing issues and pull requests for the product or file you want to update.
2. Keep each PR focused on one product, prompt set, or cleanup task.
3. Preserve original prompt wording as much as possible. Put extra context in a README or note file instead of mixing commentary into the prompt.
4. Remove personal information, access tokens, account IDs, private workspace names, and other sensitive data.
5. Do not submit copyrighted product documentation or user content unless it is necessary provenance and you have the right to share it.

## Suggested Folder Layout

For a new product, prefer a dedicated top-level folder named after the product or vendor:

```text
Product Name/
  Prompt.txt
  Tools.json
  README.md
```

Use the filenames that best match the existing nearby entries. If only one artifact is available, include only that file.

## Provenance

When possible, include a short `README.md` or note with:

- Product name and URL.
- Capture date.
- Product version, model name, or UI surface, if known.
- How the prompt or tools were obtained.
- Any redactions or formatting changes you made.

If provenance is already clear from an issue, link that issue in the PR description.

## Validation

Run the checks that match the files you changed:

```bash
python -m json.tool "Product Name/Tools.json"
git diff --check
```

For Markdown-only changes, `git diff --check` is usually enough. Mention any checks that were not applicable in the PR description.

## Pull Request Checklist

- [ ] I searched for duplicate issues and pull requests.
- [ ] The PR is focused and does not mix unrelated products or cleanups.
- [ ] Prompts preserve the original wording where possible.
- [ ] Sensitive or personal data has been removed.
- [ ] Sources, capture date, and redactions are documented when available.
- [ ] JSON files parse successfully, if this PR changes JSON.
