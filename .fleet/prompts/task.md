# Task: {{issue.key}} — {{issue.summary}}

You are working in the `{{repo}}` repository, a Firefox browser extension
(WebExtension, Manifest V2) built and linted with `web-ext`.

**Source:** {{source}}
**Issue type:** {{issue.type}}
**Labels:** {{issue.labels}}
**Issue URL:** {{issue.url}}

## Description

{{issue.description}}

## Instructions

1. Read the issue description carefully.
2. Make the smallest correct change that fully resolves the issue.
3. Keep the existing code style and public interfaces.
4. The extension source lives under `src/`; run `web-ext lint --source-dir src`
   before finishing.
5. Do **not** edit files under `.fleet/`.
