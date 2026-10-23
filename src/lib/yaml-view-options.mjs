/**
 * YAML for the `.yaml` view and the `.md` frontmatter. `compat` quotes any
 * string a YAML 1.1 reader (PyYAML, gray-matter, js-yaml) would take for
 * another type, such as `2026-10-23T00:00:00Z`, `yes` or `on`, so the record
 * reads back as the `.json` view does. Other strings stay plain.
 *
 * Plain JavaScript so scripts/check-yaml-views.mjs can test the same options.
 */
export const YAML_OPTIONS = Object.freeze({ lineWidth: 0, compat: 'yaml-1.1' });
