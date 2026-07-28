# Vehicle Family Atlas — 2026-07-28

These images are project-owned exploratory references generated with the
built-in image generation tool. They are not shipped meshes, orthographic
turnarounds, runtime assets, or proof of production readiness.

| File                                                   | Coverage                                                                 | SHA-256                                                            | Dimensions  |
| ------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------ | ----------- |
| `utility-tow-lineup-2026-07-28.png`                    | mechanic, tow, recovery, flatbed, service, inspection                    | `a583007d3cb2cd371651b082602b1e677f28c5552ba3e87c4755dd0639684dcf` | 1536 × 1024 |
| `rescue-emergency-lineup-2026-07-28.png`               | ambulance, flood response, mountain rescue, water tender, clinic, search | `ecc2ef99b174bde00c15ecc76952032e46b6beee474e74581b5c9469dea16c`   | 1536 × 1024 |
| `extreme-aspiration-lineup-2026-07-28.png`             | snow, dune, amphibious, VTOL, sky barge, orbital                         | `5719c85ef26196ee8f1d21ad00bd6fd4c54e7e4511ee8eeeb95297c0c3db299d` | 1536 × 1024 |
| `utility-tow-recovery-candidate-01-2026-07-28.png`     | isolated candidate for reconstruction intake                             | `d52f39285b12a29acd722ac3d66633d48460ca4a155c8e8e33114f399d60cfe3` | 1536 × 1024 |
| `utility-tow-reconstruction-turnaround-2026-07-28.png` | generated four-view visual turnaround aid                                | `f5d54ce75833df345c54af6f3e1d8859bb561ff7e7978c33fd565ba3eca65b03` | 1536 × 1024 |
| `utility-tow-mode-diff-board-2026-07-28.png`           | same utility/tow rig across five mode meanings                           | `54b53a56da452287fcf8ed976162eee3cde42e4ac3274d8394d3de26768ee78d` | 1536 × 1024 |
| `snow-crawler-reconstruction-candidate-2026-07-28.png` | isolated extreme-terrain candidate                                       | `29f6dcc4e1e0c1861a43359a9146500498fb267479b20381f7f5c99b2c6c3ce1` | 1536 × 1024 |

Use these sheets to select candidates and identify silhouette/hardpoint
questions. Before `img2threejs`, crop one complete vehicle with generous
background margin and record its stable family/spec ID.

## Review notes

- Utility/tow: strongest grounded family for the next isolated reconstruction;
  the tow boom and tracked recovery crawler expose clear articulation and
  attachment questions.
- Rescue/emergency: useful role breadth, but generated real-world-looking
  symbols must be treated as an open public-reuse/provenance question.
- Extreme/aspiration: strongest locomotion breadth; select one believable
  near-term rig and one deliberate horizon rig so grounded play and long-term
  wonder are both represented.
- Isolated utility/tow candidate: strong single-view intake shape with clear
  front tow eyes, rear winch, folded boom, tool drawers, and two-axle stance;
  multi-view, scale, socket, and underside evidence remain open.
- Turnaround: useful for component and socket discussion, but generated views
  are not exact orthographic proof.
- Mode board: demonstrates changed verbs and constraints; it is not a source
  for mesh dimensions.
- Snow crawler: strong grounded extreme candidate with readable tracks and
  blade; rear/side/top views and scale remain open.

Anything else? Generate failure-state and occlusion variants before declaring
any family visually production-ready.

The structured proposal for the utility/tow candidate lives at
`docs/research/assets/utility-tow-intake-2026-07-28/object-sculpt-spec-proposed.json`.
It is deliberately below strict validation and runtime admission.
