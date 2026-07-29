# Risk and Public-Readiness Register

Date: 2026-07-25
Status: early risk framing, not legal advice
Evidence: mostly Tier 1 official documentation; no runtime or production evidence

## Strategic verdict

Proceed as a bounded **vehicle-adventure anthology and public game laboratory**. Do not describe or scope the first product as a browser-scale combination of GTA, Roblox, MMO, licensed vehicle catalog, creator platform, market, and live service.

The project can earn those branches independently. It should be killed or radically reframed if a first public release requires all of the following together:

- one seamless persistent shared world;
- real vehicle brands/designs;
- public UGC and free chat/voice;
- tradable or cash-linked inventory;
- arbitrary scripts/mods;
- broad low-end/mobile browser support.

That combination is an operating company portfolio, not one initial game.

## Risk register

| Risk                            | Current exposure                   | Consequence                                     | Current disposition                                       | Closure gate                                           |
| ------------------------------- | ---------------------------------- | ----------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------ |
| Scope multiplication            | Very high conceptually             | Content/QA explosion and no coherent core       | Bound first slice; map later branches                     | First slice proves identity + continuity               |
| Weak vehicle feel               | Unknown                            | Every mode feels hollow                         | Highest-priority probe                                    | External players enjoy movement before breadth         |
| Disconnected minigames          | High                               | Shared inventory masquerades as coherence       | `VehiclePassport` + `ActivityContract`                    | One persistent consequence crosses a mode transition   |
| Browser compatibility           | High                               | Excluded devices, broken public link            | WebGL 2 compatibility path; WebGPU enhancement            | Measured browser/device matrix                         |
| Download/performance            | High                               | Slow entry, thermal/memory failures             | Budgets, LOD, streaming, pooling, quality scaling         | Active-play traces on representative devices           |
| Local-save eviction             | High once progress matters         | Lost garage/progression                         | Export/import and optional cloud backup                   | Migration, eviction/recovery, conflict tests           |
| Auth/session theft              | Deferred but high-risk             | Account/inventory loss                          | Mature provider, secure cookies/session controls          | Threat model and auth integration tests                |
| Multiplayer cheating/divergence | Deferred but high-risk             | Unfair play, duplicated rewards                 | Server-authoritative inputs/results                       | Latency/attack/reconnect/idempotency suite             |
| Economy fraud                   | Deferred                           | Duplication, disputes, laundering, support load | No player trade/cash; append-only ledger if introduced    | Reconciliation, escrow, recovery, legal review         |
| UGC abuse/copyright             | Deferred                           | Harm, takedowns, malware, moderation burden     | Data-only curated private sharing first                   | Provenance, quarantine, report/block/appeal/moderation |
| Child safety/privacy            | Undecided audience                 | Regulatory and player harm                      | Decide audience/regions before public social data         | Age/privacy/safety design review                       |
| Real vehicle IP                 | High if recognizable               | Trademark/design/licensing dispute              | Fictional original makes at launch                        | Per-asset clearance/license decision                   |
| Third-party asset rights        | Medium                             | Removal, attribution breach, commercial block   | Asset provenance ledger                                   | Exact license/evidence/hash before import              |
| Generative asset provenance     | Medium                             | Unclear rights, style/source concerns           | Proposal-only, tool/input/terms record, replacement path  | Human review and provenance entry                      |
| Accessibility                   | High if deferred                   | Exclusion and rework                            | DOM UI, named actions, assist/reduced-motion from slice 1 | Keyboard/gamepad/touch and WCAG-oriented review        |
| Background throttling/focus     | High in browsers                   | Simulation jumps, unfair loss, battery waste    | Suspend/reconcile explicitly                              | Visibility/focus automated tests                       |
| WebSocket security              | Deferred but high-risk             | Injection, session abuse, DoS                   | WSS, Origin/session/message/rate/replay controls          | Security test and audit logs                           |
| Service shutdown                | Low now, high after accounts/money | Lost value/trust                                | Local core, data export, sunset policy                    | Written before paid value                              |
| Operator overload               | High if social/economy added       | Unhandled reports, restores, disputes           | Preset pings/private invite first                         | Named owner, queues, SLAs, recovery tools              |

## Browser facts that constrain design

- [MDN currently marks WebGPU as limited availability](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API); it also requires a secure context. It is not the only public renderer yet.
- Browser storage is best-effort by default and may be evicted; quotas and private-mode behavior vary. See [MDN storage quotas and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).
- Background tabs throttle timers; simulation needs explicit visibility/focus suspension and resume semantics. See [Chrome background-tab policies](https://developer.chrome.com/blog/background_tabs).
- Canvas/WebGL does not provide the whole semantic interface. Critical menus/status/settings need accessible DOM equivalents. See [MDN canvas accessibility](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/canvas) and [WCAG 2.2](https://www.w3.org/TR/WCAG22/).
- Threaded WASM paths can require HTTPS and cross-origin isolation headers; third-party integration implications must be tested.

## Security baseline for later online work

The [OWASP WebSocket Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html) informs these gates:

- WSS;
- strict Origin validation;
- session revalidation/revocation;
- authorization for every message/action;
- schema, type, range, and size validation;
- per-action and connection rate limits;
- replay/duplication defenses;
- heartbeat, timeout, resource quotas;
- useful privacy-safe audit events.

Do not store durable session/refresh credentials in local storage. Use a mature identity/session design and reauthentication for sensitive operations; see [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).

## Audience, child safety, and social surface

Open questions requiring owner decisions before public accounts/social features:

- intended age range;
- launch regions/countries;
- whether the art/vehicles are likely to attract children regardless of intent;
- whether names, chat, images, builds, levels, replays, and reactions are public;
- data collected and why;
- parental/guardian and minor-protection requirements;
- reporting, blocking, appeals, enforcement, and transparency;
- moderation staffing and after-hours incident response.

Relevant primary references:

- [FTC COPPA guidance](https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-not-just-kids-sites)
- [UK ICO Children’s Code](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/introduction-to-the-childrens-code/)
- [EU Digital Services Act overview](https://digital-strategy.ec.europa.eu/en/policies/digital-services-act)
- [Ofcom child-safety duties](https://www.ofcom.org.uk/online-safety/protecting-children/protection-of-children-duties-under-the-online-safety-act)
- [U.S. Copyright Office DMCA Section 512](https://www.copyright.gov/512/index.html)

This is not a conclusion that every rule applies. It is a reason to determine audience, regions, and product surfaces before collecting social content.

## Vehicle and asset intellectual property

Use original fictional makes, badges, silhouettes, liveries, and sounds for initial public work.

Recognizable real vehicles can implicate more than logos:

- [USPTO likelihood of confusion](https://www.uspto.gov/trademarks/search/likelihood-confusion)
- [USPTO trade dress guidance](https://tmep.uspto.gov/RDMS/TMEP/print?href=TMEP-1200d1e1.html&version=current)
- [USPTO design patents](https://www.uspto.gov/patents/basics/apply/design-patent)

A favorable case about one game/use/jurisdiction is not a universal license. Record a per-asset rights decision or obtain a license.

For “free” assets, [Creative Commons licenses differ materially](https://creativecommons.org/share-your-work/cclicenses/): attribution, share-alike, non-commercial, and no-derivatives conditions are not interchangeable.

Required asset record:

- source URL and creator;
- exact license/version and evidence snapshot;
- commercial/modification/redistribution permissions;
- required attribution;
- source and imported file hashes;
- modifications;
- tool/provider/model/input provenance if generated;
- approver and removal/replacement path.

## Economy and monetization

Initial rule:

- one earned, non-transferable soft resource plus concrete parts/reputation;
- no paid randomness;
- no cash-out;
- no P2P transfer;
- no artificial waiting/streak coercion;
- no client-authored reward or balance.

Why:

- [CFPB research](https://www.consumerfinance.gov/data-research/research-reports/issue-spotlight-video-games/) discusses theft, scams, unauthorized transfers, and weak recourse in gaming markets.
- Convertible/cash-linked currency can raise financial-regulatory questions; see [FinCEN guidance](https://www.fincen.gov/resources/statutes-regulations/guidance/application-fincens-regulations-persons-administering).
- Dark-pattern and accidental-purchase design creates consumer harm and enforcement risk; see the [FTC Epic order](https://www.ftc.gov/news-events/news/press-releases/2023/03/ftc-finalizes-order-requiring-fortnite-maker-epic-games-pay-245-million-tricking-users-making).

Money or trading requires a separate ADR and, at minimum:

- server-authoritative double-entry or equivalent audited ledger;
- idempotency and immutable transaction IDs;
- receipts and before/after state;
- atomic transfer/escrow;
- fraud/velocity controls;
- reconciliation and anomaly investigation;
- account recovery and reauthentication;
- refund, chargeback, dispute, theft, duplication, and rollback workflows;
- parental and regional controls;
- legal/payment/tax review;
- shutdown/value-export policy.

## Staged public model

| Stage                    | Capability                                                                        | Hard exclusions                                        | Expansion evidence                                                    |
| ------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------- |
| A — Solo lab             | One complete vehicle loop, guest play, local/exportable save, deterministic seeds | Account, payment, chat, UGC, trade                     | Cold load, restart, migration, input/accessibility, external playtest |
| B — Account backup       | Optional account link, cloud backup, privacy/export/delete                        | Paid/transferable inventory                            | Duplicate/stale/logout/delete/restore/conflict tests                  |
| C — Invite co-op         | 2–4 player authority, preset pings, reconnect                                     | Public matchmaking, free chat/voice, seamless world    | Cheat rejection, load/cost, idempotent reconnect/reward               |
| D — Curated creation     | Whitelisted data/prefabs, bounded values, private links                           | Arbitrary code/shaders/binary uploads/public discovery | Provenance, quarantine, report/block/takedown/appeal/audit            |
| E — Optional commerce    | Direct-priced non-transferable cosmetics/expansions                               | Cash-out, P2P trading, paid randomness                 | Receipts/refunds/reconciliation/parental/legal review                 |
| F — New product decision | Public discovery/chat, broad UGC, trading, persistent social world                | Automatic roadmap promotion                            | Dedicated trust/safety, fraud, legal, support, moderation, SRE budget |

## Expansion acceptance rules

- A vehicle enters the canonical product only through the capability contract; a bespoke subsystem needs an ADR.
- An activity documents trigger → state → decision → action → exception → terminal state → durable outcome and deterministic fixtures.
- Multiplayer needs authoritative movement/gameplay/reward/inventory, duplicate/replay/rate-limit/reconnect tests, and operator recovery.
- UGC needs provenance, quarantine, reports, blocks, takedowns, appeals, moderator audit, and child-risk handling.
- Money/trading needs ledger, reconciliation, fraud, recovery, dispute, reauthentication, velocity limits, and jurisdiction review.
- A new biome clears critical download, memory, representative mobile frame, readability, navigation, accessibility, and recovery budgets.

## Pause questions

Expansion beyond the solo slice pauses until the owner decides:

- age audience and initial regions;
- whether public UGC, chat, payment, or trading are real requirements;
- which state is local, cloud-backed, or authoritative;
- target browser/device matrix and payload/frame expectations;
- who operates reports, bans, account restores, disputes, and takedowns.

These do not block the first graybox.

## Confidence

Confidence is high in the cited browser/security/platform constraints, medium-high in the strategic stage gates, and low in game-specific severity until a real build, audience, regions, data flows, and operations model exist.

## Anything else?

The safe creative move is not to make the game timid. It is to keep imaginative content cheap and reversible while making identity, money, authority, and public interaction deliberate and auditable.

## Addendum (2026-07-29) - ADR-0039 keeps the public shell distinct from the readiness/gating notes

This register now sits alongside the browser-policy split named in ADR-0039:

- the public shell keeps `#bootstrap-status` semantic and player-facing;
- the public shell keeps `#profile-status` visible and readable;
- acceptance/developer surfaces can carry the deeper runtime readiness and
  diagnostics notes without turning the public HUD into a planning register.

That matters because the public-readiness story is a policy boundary, not a
player-facing diagnostics dump.

## Addendum (2026-07-25) - current runtime still fits the solo-lab gate, not the public-social gate

- Re-checked the readiness register against the current browser daemon snapshot
  and the live repo contracts.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The current runtime still sits comfortably inside the conservative stage-A
  posture described by the register:
  - one bounded playable loop,
  - deterministic local simulation,
  - readable HUD/state surfaces,
  - no evidence of public chat, trade, UGC, or cash-linked systems in the live
    path.
- The register’s higher-risk branches remain future-gated rather than active:
  - multiplayer authority,
  - economy/trading,
  - public UGC and moderation,
  - social identity and child-safety obligations,
  - account recovery and public operator support surfaces.
- That means the register is still doing its job as a launch boundary:
  - it names the risks that would need explicit follow-up before public-social
    expansion,
  - and the current runtime does not yet cross those gates.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.
