// Pure helpers for session note links. No file reads: callers pass the template text.

export const MAX_URL_LENGTH = 4000;

export function noteState(id, publishedIds) {
  return publishedIds.has(id) ? 'published' : 'none';
}

export function notePath(base, id) {
  return `${base}/sessions/${id}/`;
}

export function templateUrl(owner, repo, branch) {
  return `https://github.com/${owner}/${repo}/blob/${branch}/docs/_meta/templates/session-note.md`;
}

export function guideHref(base) {
  return `${base}/guides/add-a-session-note/`;
}

function yamlQuote(title) {
  return `"${title.replace(/[\r\n]+/g, " ").replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

// Exactly two substitutions: the `title:` line and the `updated:` line.
// Replacer functions keep `$` in titles literal.
export function fillTemplate(template, title, day) {
  return template
    .replace(/^title:.*$/m, () => `title: ${yamlQuote(title)}`)
    .replace(/^updated:.*$/m, () => `updated: ${day}T00:00:00Z`);
}

export function startNotesUrl({ owner, repo, branch, id, title, day, template }) {
  const head = `https://github.com/${owner}/${repo}/new/${branch}?filename=docs/sessions/${id}.md`;
  const full = `${head}&value=${encodeURIComponent(fillTemplate(template, title, day))}`;
  if (full.length > MAX_URL_LENGTH) return { url: head, truncated: true };
  return { url: full, truncated: false };
}
