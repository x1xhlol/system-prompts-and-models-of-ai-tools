# Usage Guide

This repository is a collection of prompt and tool artifacts from AI products. The files are provided for reading, comparison, research, and reference. They are not a drop-in runtime or an official SDK for the products they describe.

## Find an Artifact

Directories are grouped by product or project. Use the directory name when you know the product, or search by the artifact type:

```bash
# List product directories and their files
find . -maxdepth 2 -type f | sort

# Find prompt-like files
find . -type f \( -iname '*prompt*' -o -iname '*system*' \) | sort

# Find tool declarations
find . -type f -iname '*.json' | sort
```

Names are descriptive rather than a universal schema. For example, a product may use `Prompt.txt`, `System Prompt.txt`, or a more specific name such as `Agent Prompt 2.0.txt`.

## File Types

- `.txt`: Prompt or instruction text. Read it as source material; formatting and naming reflect the original artifact when known.
- `.json`: Tool declarations or structured configuration. Validate and inspect the schema before treating a file as executable configuration.
- `.yaml` and `.yml`: Structured prompt/configuration exports. Check the product-specific context before importing them into another tool.
- `.md`: Human-written notes or usage documentation. The root `README.md` provides project information, while some product directories have their own instructions, such as [`Amp/README.md`](Amp/README.md).
- `.png`: Supporting screenshots or other visual evidence for an artifact.

## Common Workflows

### Read and Compare

Open the prompt and tool files for one product, then compare them with another product's files. Preserve the original path and filename when citing an observation so it can be checked later.

### Use as Reference

When building or configuring an agent, treat these files as reference material. Copy only the parts you are authorized to use, adapt them to the target tool's supported format, and review for secrets, unsafe instructions, and product-specific assumptions.

### Reproduce an Artifact

Some artifacts include product-specific collection notes. Follow those notes first; for example, [`Amp/README.md`](Amp/README.md) documents how to obtain an Amp thread YAML export. This repository does not provide a general extraction script, and a file in this collection is not proof that it is current or complete.

## Scope and Limitations

- The collection can change as new artifacts are added or corrected, so prefer paths and filenames over a permanently copied directory index.
- A `.json` or `.yaml` file may describe tools without being directly accepted by the product that inspired it.
- Do not upload private prompts, credentials, or other sensitive material to this repository or to third-party services.
- For corrections, include the affected path and the source or reproduction evidence in an issue or pull request.
