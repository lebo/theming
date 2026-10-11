# REA investigation of the Graphical UI public demo

Date: 2026-10-11

## Tool execution

The official **`rea-agents@6.4.0`** npm package was executed, using its `rea` binary. This was not the unrelated npm package named `rea`. `npm view rea-agents name version repository.url --json` returned `rea-agents`, `6.4.0`, and `git+https://github.com/morluto/rea.git`. The CLI help banner identifies itself as `rea@6.4.0`.

Execution used Node 24.21.0 and npm 11.19.0 in an ephemeral Vercel Sandbox. No host agent configuration was changed. The REA workflow skill and JavaScript artifact guide were read from the official repository.

Command actually executed:

```sh
npm exec --yes --package=rea-agents -- rea analyze-javascript-application /tmp/rea-focused --artifact-format directory --max-heap-mb 768 --analysis-timeout-ms 30000 --format json > /tmp/rea-result.json
```

The command exited **0** after **27,275 ms**. The JSON output was 36,017,103 characters and was inspected through bounded metadata and finding projections, not copied into the application.

## Public artifact scope

The unauthenticated page `https://www.graphicalui.com/marketing/preview?mode=light` was fetched. Its HTML referenced 27 same-origin JavaScript scripts. Three scripts containing the visible editor labels `Edit theme` or `Letter spacing` were selected for focused static analysis. Their downloaded bytes were not executed by the analyzer.

All three source URLs carry the query `?dpl=dpl_5ANqESxt911XyD2AV8LeXybAt7Cs`.

| Local analysis name | Public path | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| 13.js | `/_next/static/chunks/0gc4m-eubagm..js` | 82,493 | `71573f8ce4c53527f8efd635f3f79304a32fd5f1ee5c10b2e978b6fff2153d99` |
| 16.js | `/_next/static/chunks/0t8d91xutlbg0.js` | 278,707 | `4d9589d26a9e406ff00bc26fffeb43f2bf67a2e95fb46966716404b7a686872f` |
| 23.js | `/_next/static/chunks/0ctwkj9lcmi--.js` | 197,271 | `d2d5c4f14a9968a522fff58c84f4688649314723ddcbae78d8e33369db5dd65f` |

REA subject directory digest: `6b1089b36066789390d5f78cad84691e37e5c350afb8f4bc08c920df55f46bf3`.

## Evidence and observations

Primary Evidence ID: `ev_c8f40732ad409e88e3ab1582a60b59103be38326496d7f365ecb1262b02e30a8`.

Provider: `rea-javascript-application` / `REA JavaScript application analyzer` / version `1`. Predicate: `rea.javascript-application-analysis`. Authority: `shipped-artifact`. Confidence: `derived`.

- REA parsed all 3 selected JavaScript files, read 558,471 bytes, visited 149,694 AST nodes, and reported 0 parse failures and 11 findings. The application graph contains 19 nodes and 19 edges.
- Static AST evidence identifies a literal `fetch` reference to `/api/theme-defaults` in 23.js, line 516, columns 110102–110299. This establishes that the shipped bundle references a theme-defaults endpoint. It does not establish the endpoint's runtime availability, returned data, or permission requirements. The endpoint was not called during this investigation.
- REA also finds literal `get` arguments for `component`, `tab`, `theme`, `mode`, `state`, `part`, `option`, and `variant` in 16.js (line 1, columns 215572–216290), plus `mode` in 23.js. These are candidates for editor selection/state handling, not proof of a backend route or a complete state schema. REA labels these as endpoint candidates based on syntax; a generic `get` call does not itself establish network traffic.
- A bounded label scan used to choose the analysis scope found `Edit theme`, `Letter spacing`, and `Typography` in 13.js; all of those plus `Motion` and `Corners` in 16.js; and `Edit theme`, `Motion`, `Corners`, and `Typography` in 23.js. These labels corroborate the visible customization categories. Their presence does not prove that advanced editing is enabled in the public demo.

## Reconstruction implications

The independent implementation can reasonably model a theme as shared design tokens, keep active component/variant/state selection separately, and apply the theme across interactive previews. These are design decisions informed by public UI observations and the static evidence above. The report does not claim recovery of Graphical UI's complete algorithms or private service behavior.

No downloaded source bundle, minified function, or proprietary asset was added to the rebuilt application. Analysis materials were temporary; only this finding report is intended for the repository.

## Limits

Graph coverage is explicitly **partial**. REA reports that semantic graphs for 13.js and 16.js exceeded the parent result budget; static and module facts were retained. Its reported result budget was 408,248,652 bytes, worker heap limit 830,472,192 bytes, and worker timeout 30,000 ms. There was no parse failure, but this is not complete semantic recovery.

Only 3 of 27 scripts were analyzed. Cross-file relationships outside that selected inventory remain unknown. No bundle bootstrap was executed. Static imports, endpoints, state candidates, and storage relationships do not prove execution. Dynamic or obfuscated relationships can remain unresolved. Public UI behavior was inspected separately through the browser; advanced controls disabled in the public demo cannot be validated from interaction alone.

## References

- https://github.com/morluto/rea
- https://github.com/morluto/rea/blob/main/.agents/skills/reverse-engineer-anything/SKILL.md
- https://github.com/morluto/rea/blob/main/.agents/skills/reverse-engineer-anything/references/javascript-applications.md
- https://www.graphicalui.com/marketing/preview?mode=light
