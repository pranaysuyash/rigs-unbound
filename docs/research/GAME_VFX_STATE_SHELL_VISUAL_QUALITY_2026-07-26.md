# Research: Vehicle State Shell, Hit Feedback VFX, and Visual Quality Architecture

**Date:** 2026-07-26
**Context:** Rigs Unbound — browser-based 3D vehicle game (Three.js/Vite/TypeScript)

---

## Executive Summary

This document explores a concept the user describes as "a surrounding rig — something that shows hit or strength or shields" — and extends it into a comprehensive visual quality architecture covering textures, shadows, animations, physics feedback, and post-processing. The goal is to make Rigs Unbound a **visually stunning** browser game that communicates vehicle state through an emotionally resonant visual language rather than UI numbers.

---

## Part 1: The "State Shell" — A Surrounding Rig Visualization

### Concept Definition

The "State Shell" is a **semi-transparent visual envelope** surrounding the vehicle that communicates its current condition, capabilities, and reactions. Think of it as the vehicle's "aura" — a visual extension of the rig's personality that reacts to impacts, shows strength/weakness, and makes the invisible (health, shields, strain) visible and beautiful.

### Why This Is Powerful for Rigs Unbound

In a game where vehicles are characters, the State Shell acts as the character's **emotional expression**. A human character shows fear through facial animation; a rig shows strain through its State Shell rippling, flickering, or changing color. This is the bridge between "diegetic vehicle state" and "immediately readable game feedback."

### Visual Language Options

#### Option A: The "Integrity Field" (Sci-Fi / Patchwork Energy)

**Inspiration:** Halo energy shield, Overwatch Reinhardt barrier, Pacific Drive's anomaly effects

A semi-transparent shell that wraps the vehicle silhouette, made of a patched-together energy pattern matching the Patchwork Atlas aesthetic. Not a clean geometric shield — a stitched, imperfect, repairable field.

| State             | Visual Behavior                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| Full health       | Barely visible — faint warm glow at edges only (Fresnel rim light), like heat shimmer               |
| Taking damage     | Ripple effect at impact point + brief flash + hexagonal/organic pattern becomes visible             |
| Low health        | Shell flickers intermittently, colors shift from warm amber to stressed red, pattern shows "cracks" |
| Critical          | Shell pulses erratically, gaps appear, individual hex cells go dark                                 |
| Shield recharging | Gentle pulse wave spreading from center, cells "knitting" back together                             |
| Boosted/buffed    | Shell brightens, glow intensifies, particles drift upward                                           |

**Three.js implementation:**

```
1. Clone rig geometry → scale up 1.03-1.05x → slightly inflated shell mesh
2. Custom ShaderMaterial with:
   - Fresnel effect (bright at edges, transparent at face-on)
   - Animated hexagonal/organic noise pattern (scrolling UV)
   - Hit-point uniform (vec3) → sphere mask → ripple wave from impact
   - Health uniform (float 0-1) → drives opacity, color hue, flicker frequency
3. Additive blending, depth write disabled
4. Impact ripple: send collision point + velocity to shader, animate expanding ring
```

#### Option B: The "Condition Outline" (Stylized / Field-Kit)

**Inspiration:** Sable's moebius outline, Borderlands cel-shading edge, Deep Rock Galactic's outline system

Instead of a bubble, a **dynamic outline** around the vehicle that changes thickness, color, and style based on state.

| State               | Outline Behavior                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------- |
| Healthy             | Clean, thin warm outline — like a technical drawing                                         |
| Damaged             | Outline becomes jagged, sketchy, hand-drawn looking — like the field-kit aesthetic cracking |
| Hit moment          | Outline flares bright white for 2-3 frames, then settles to new damage color                |
| Critical            | Outline pulses red, becomes dashed/broken in damaged sections                               |
| Shield/boost active | Second outline layer appears, glowing, wider                                                |

**Three.js implementation:**

```
1. OutlinePass from pmndrs/postprocessing library
2. Custom edge detection shader using depth + normal buffers
3. Drive outline parameters from feedback.ts health/strain values
4. Animate thickness and color via CSS custom properties bridge
```

#### Option C: The "Heat Signature" (Physical / Grounded)

**Inspiration:** Real thermal imaging, Predator vision, SnowRunner stress indicators

No bubble or outline — instead, the rig's **surface materials themselves** change to communicate state. Hot spots glow where damage occurred. Engine area shows heat. Stressed components emit particle wisps.

| State    | Surface Behavior                                                                           |
| -------- | ------------------------------------------------------------------------------------------ |
| Normal   | Natural PBR materials, subtle emissive glow from headlights/dash                           |
| Stressed | Engine area emissive increases (orange glow), heat distortion above hood                   |
| Hit      | Impact point briefly emits bright orange/white, then darkens to scorched                   |
| Damaged  | Persistent dark patches, emissive "wounds" that glow dull red                              |
| Critical | Multiple wounds, smoke particles from damaged areas, material roughness increases globally |

**Three.js implementation:**

```
1. Custom MeshPhysicalMaterial with damage overlay texture
2. Emissive map driven by damage data per-vertex or per-UV-region
3. Heat distortion: subtle vertex displacement in fragment shader near damage points
4. Smoke: point sprite particles emitted from damage locations
```

### Recommended Approach for Rigs Unbound

**Hybrid: Option A (subtle) + Option C (surface)**

- Use a **faint Fresnel rim glow** (Option A) as the ambient state indicator — always present, barely visible when healthy. This gives every rig a "living" quality.
- Use **impact ripples** (Option A) for hit feedback — satisfying, immediate, directional.
- Use **surface emission changes** (Option C) for persistent damage — the rig literally shows its scars.
- Reserve full shield bubble for future gameplay mechanics (if shields/barriers are added).

This hybrid respects the Patchwork Atlas aesthetic (physical, grounded) while still delivering the satisfying visual feedback of energy shields.

### Impact Ripple Technical Design

```
Collision detected (physics.ts)
  → Generate ImpactEvent { worldPosition, normalizedVelocity, surfaceType }
  → Push to RigFeedbackFrame.impacts[]
  → Renderer reads impacts[], sends to shell shader uniforms
  → Shader: sphereMask(hitPoint, expandingRadius) * fresnel * impactColor
  → Radius expands over 300ms, opacity decays exponentially
  → Camera micro-shake (existing feedback.ts bodyRollOffset/bodyPitchOffset)
  → Particle burst at hitPoint (sparks + debris matching surface type)
  → Audio: impact sound scaled by velocity
  → Gamepad rumble: proportional to velocity (vibrationActuator)
  → DOM: field-kit condition indicator flickers
```

All six feedback channels fire simultaneously for a single collision event. This is "juice" applied to the vehicle-as-character paradigm.

---

## Part 2: Visual Quality Architecture

### Current Baseline Assessment

The existing renderer ([renderer.ts](../../src/game/renderer.ts)) provides:

| Feature         | Current State                   | Quality Level |
| --------------- | ------------------------------- | ------------- |
| Shadows         | Blob shadows (flat circle mesh) | Basic         |
| Tone mapping    | ACES Filmic ✅                  | Good          |
| Fog             | Phase-based exponential fog     | Good          |
| Materials       | Basic MeshStandard (procedural) | Basic         |
| Particles       | Wheel spray particles exist     | Partial       |
| Post-processing | None                            | Missing       |
| Environment map | None                            | Missing       |
| Normal maps     | None                            | Missing       |
| PBR textures    | None                            | Missing       |
| Outline/glow    | None                            | Missing       |
| Contact shadows | None (blob only)                | Missing       |

### Visual Quality Upgrade Roadmap

#### Tier 1: Immediate Impact (Low complexity, high visual return)

##### 1.1 Environment Map (HDRI)

**What:** An HDR equirectangular image used for ambient lighting and reflections on all PBR materials.

**Why:** Single biggest visual quality jump. Everything in the scene gets realistic ambient lighting and reflections. Metal looks metallic. Paint has depth. The sky dome gains believability.

**Implementation:**

```typescript
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
const loader = new RGBELoader();
loader.load("field-hdri.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  this.scene.environment = texture;
  // Do NOT set as background — keep existing sky dome
});
```

**Asset:** Generate or source a low-poly HDRI matching the Patchwork Atlas color palette (warm earth tones, diffuse sky). Tools: Poly Haven (CC0 HDRIs), or bake from the existing sky dome.

**Performance:** Negligible — PMREM generation happens once at load.

##### 1.2 Upgrade to MeshPhysicalMaterial

**What:** Replace `MeshStandardMaterial` with `MeshPhysicalMaterial` on vehicle bodies for clearcoat (car paint look) and better metalness.

**Key settings for field vehicles:**

```typescript
new THREE.MeshPhysicalMaterial({
  color: rigColor,
  metalness: 0.15, // Not chrome — working vehicles
  roughness: 0.55, // Weathered, used, field-tested
  clearcoat: 0.3, // Subtle — not showroom glossy
  clearcoatRoughness: 0.4, // Dusty clearcoat
  envMapIntensity: 0.8,
});
```

**Why this fits Patchwork Atlas:** These aren't showroom cars. They're field machines. Low clearcoat + high roughness = dusty, used, characterful.

##### 1.3 Directional Light Shadows

**What:** Enable `PCFSoftShadowMap` and attach shadows to the existing directional sun light.

**Implementation:**

```typescript
this.renderer.shadowMap.enabled = true;
this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
this.sunLight.castShadow = true;
this.sunLight.shadow.mapSize.set(1024, 1024);
this.sunLight.shadow.camera.near = 0.5;
this.sunLight.shadow.camera.far = 80;
this.sunLight.shadow.bias = -0.0001;
this.sunLight.shadow.normalBias = 0.02;
// Tight frustum around the active area
this.sunLight.shadow.camera.left = -30;
this.sunLight.shadow.camera.right = 30;
this.sunLight.shadow.camera.top = 30;
this.sunLight.shadow.camera.bottom = -30;
```

**Performance consideration:** Shadow maps are the #1 GPU cost. Start at 1024×1024, test on mobile, consider Cascaded Shadow Maps (CSM addon) if terrain is large.

**Blob shadow fallback:** Keep blob shadows as a "quality: low" option. Provide a settings toggle.

##### 1.4 Ground Contact Shadow

**What:** A `ShadowMaterial` plane beneath each rig that catches soft shadows, giving the vehicle visual grounding.

```typescript
const shadowPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(8, 8),
  new THREE.ShadowMaterial({ opacity: 0.25, depthWrite: false }),
);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.receiveShadow = true;
```

**Why:** Contact shadows are what make objects look "placed" on a surface rather than floating.

#### Tier 2: Premium Feel (Medium complexity, high polish)

##### 2.1 Post-Processing Pipeline

**What:** Add bloom, color grading, and vignette using `pmndrs/postprocessing` (more performant than Three.js built-in EffectComposer).

```
npm install postprocessing
```

**Effects to add:**

| Effect              | Purpose                                       | Settings                        |
| ------------------- | --------------------------------------------- | ------------------------------- |
| Bloom               | Headlights glow, shield impacts, sunset sky   | threshold: 0.85, intensity: 0.3 |
| Vignette            | Focus attention on center, hide screen edges  | darkness: 0.4, offset: 0.5      |
| Color grading (LUT) | Match Patchwork Atlas warm/cool phase palette | Phase-specific LUTs             |
| Screen shake        | Collision feedback via camera offset          | Duration: 150ms, decay          |

##### 2.2 Fresnel Rim Light (State Shell - Tier 1)

**What:** A always-on subtle rim glow on the vehicle that communicates "alive" status.

```glsl
// Vertex shader
varying float vFresnel;
void main() {
  vec3 viewDir = normalize(cameraPosition - (modelMatrix * vec4(position, 1.0)).xyz);
  vec3 worldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
  vFresnel = pow(1.0 - max(dot(viewDir, worldNormal), 0.0), 3.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// Fragment shader
uniform float uHealth; // 0.0 = critical, 1.0 = full
uniform vec3 uHealthyColor; // warm amber
uniform vec3 uDamagedColor; // stressed red
varying float vFresnel;
void main() {
  vec3 color = mix(uDamagedColor, uHealthyColor, uHealth);
  float alpha = vFresnel * mix(0.6, 0.08, uHealth); // More visible when damaged
  gl_FragColor = vec4(color, alpha);
}
```

**Result:** At full health, the rig has the faintest warm edge glow — barely noticeable but subconsciously "alive." As damage increases, the rim becomes more prominent and shifts to red/orange, making the rig look stressed without needing a health bar.

##### 2.3 Particle System Expansion

Current particles: wheel spray/dust. Add:

| Particle Effect | Trigger                     | Visual                                                                                       |
| --------------- | --------------------------- | -------------------------------------------------------------------------------------------- |
| Impact sparks   | Collision event             | Bright white/orange point sprites burst from contact point, gravity-affected, 200ms lifetime |
| Smoke wisps     | Damage > 50%                | Slow-rising grey puffs from engine area, alpha-blended, 1.5s lifetime                        |
| Exhaust         | Always (scaled by throttle) | Dark grey puff clouds from exhaust pipe, density tracks engine load                          |
| Terrain debris  | High-speed terrain contact  | Small chunks matching terrain color, arc trajectory                                          |
| Tool engagement | Plough/winch active         | Dirt chunks thrown up, soil color particles, satisfaction particles                          |
| Repair sparkle  | After repair                | Brief upward golden sparkle burst, feel-good reward                                          |

**Implementation:** Pool-based `Points` or `InstancedMesh` with GPGPU texture for position/velocity on high particle counts. For < 500 particles, CPU-driven `BufferGeometry` points are sufficient and simpler.

##### 2.4 Impact Flash + Hitstop

**What:** When a collision occurs above a velocity threshold:

1. **Hitstop:** Freeze the game loop for 2-4 frames (set `dt = 0` but keep rendering)
2. **Flash:** Briefly increase the impacted object's emissive to white for 1 frame
3. **Screen edge flash:** DOM overlay pulses white/red at the edge
4. **Camera punch:** Brief camera offset in the direction opposite to impact normal

**Why:** This is the single most impactful "juice" technique. It transforms a visually dull collision into a visceral, satisfying moment. Every great action game uses it.

#### Tier 3: Distinguished Quality (Higher complexity, showpiece effects)

##### 3.1 Dynamic Weather Visual Effects

| Weather            | Visual Treatment                                                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Rain               | Screen-space droplet shader, increased roughness on all materials, puddle reflections (planar reflections or SSR), fog density increase |
| Dust storm         | Heavy fog + directional particle wind, desaturation, reduced visibility, UI elements show static                                        |
| Snow               | Accumulation on horizontal surfaces (vertex displacement), white particles, increased material roughness                                |
| Sunset/Golden hour | Warm color grading LUT, lengthened shadows, increased bloom on metallic surfaces                                                        |

##### 3.2 Procedural Vehicle Damage Visualization

Instead of pre-made damage states, procedurally modify the vehicle mesh:

1. **Vertex displacement:** On collision, displace vertices near impact point inward (denting)
2. **Roughness map modification:** Increase roughness at damage points (scratched paint)
3. **Emissive hotspots:** Recently damaged areas glow briefly (heat from impact)
4. **Decal system:** Apply "damage decals" (scratch textures, dents) at impact UV coordinates

##### 3.3 Dynamic Lighting from Vehicle

| Light Source   | Implementation                                              |
| -------------- | ----------------------------------------------------------- |
| Headlights     | Two SpotLights attached to rig, cast shadows, toggle on/off |
| Tail lights    | Red PointLights, intensity tracks braking                   |
| Dashboard glow | Small warm PointLight inside cab area                       |
| Turn signals   | Blinking amber PointLights                                  |
| Warning lights | Pulsing red when health low                                 |
| Tool lights    | Work lights on attachments                                  |

**Performance:** Use `LightHelper` to debug frustums. Limit to 3-4 active shadow-casting lights max.

##### 3.4 Screen-Space Ambient Occlusion (SSAO)

**What:** Darkens creases, contact lines, and enclosed areas for a more grounded, three-dimensional look.

**Why:** Makes the terrain and vehicle geometry feel solid and "placed" rather than flat-shaded.

**Implementation:** Use `SSAOEffect` from `pmndrs/postprocessing`. Low-radius, subtle intensity — it should be felt, not seen.

---

## Part 3: Animation Quality

### Vehicle Animation Hierarchy

```
Rig Root (physics-driven position/rotation)
  ├── Chassis
  │     ├── Body shell (bodyRollOffset, bodyPitchOffset from feedback.ts) ✅ exists
  │     ├── Suspension travel (per-wheel, driven by terrain contact) ⬜ to add
  │     ├── Engine vibration (subtle high-freq oscillation at idle) ⬜ to add
  │     └── Damage jiggle (loose parts rattle when damaged) ⬜ to add
  ├── Wheels
  │     ├── Rotation (speed-driven) ✅ exists
  │     ├── Steering turn (front wheels) ✅ exists
  │     └── Bounce (individual wheel spring) ⬜ to add
  ├── Attachments
  │     ├── Tool-specific animation (plough lift/lower, winch spool) ⬜ to add
  │     └── Tool engagement reaction (resistance, bounce-back) ⬜ to add
  └── Effects Group
        ├── Exhaust particles ⬜ to add
        ├── State Shell / rim glow ⬜ to add (THIS DOCUMENT)
        ├── Headlight cones ⬜ to add
        └── Damage smoke/sparks ⬜ to add
```

### Key Animation Principles

1. **Secondary motion sells weight:** The chassis doesn't just follow physics — it overshoots slightly then settles. This is the difference between "videogame" and "heavy machine."
2. **Everything has follow-through:** When the rig stops, the body pitches forward slightly then rocks back. When it turns, the body leans opposite then corrects. Already partially in `feedback.ts` — needs spring-damper refinement.
3. **Idle is never static:** A running engine creates micro-vibration. A healthy rig hums. A damaged rig shudders.
4. **Tool animations have "bite":** When a plough enters soil, there should be a brief resistance moment (the rig slows slightly, body dips toward the tool) before the tool engages. This is the tool-engagement equivalent of hitstop.

---

## Part 4: Physics Feel

### Current Physics Baseline

The project has a substantial physics system ([physics.ts](../../src/game/physics.ts), 28KB) with fixed-step simulation, terrain traversal, and collision detection. The feedback system ([feedback.ts](../../src/game/feedback.ts)) already derives:

- `speedRatio` → drives camera FOV boost
- `tractionLoss` → available for slip visualization
- `driveLoad` → available for engine strain effects
- `lateralLoad` → drives body roll
- `steeringAngle` → drives wheel turn visual

### Feedback Channels to Add

| Signal           | Source              | Visual Effect                                              | Audio Effect                         |
| ---------------- | ------------------- | ---------------------------------------------------------- | ------------------------------------ |
| `impactVelocity` | collision.ts        | Hitstop + flash + shell ripple + sparks                    | Metal crunch scaled by velocity      |
| `engineStrain`   | state.ts engineLoad | Engine area emissive glow, exhaust density                 | Engine pitch + strain overtones      |
| `terrainType`    | terrain.ts surface  | Wheel spray color/density, debris type                     | Rolling sound (gravel, mud, asphalt) |
| `damageLevel`    | state.ts strain     | Shell rim color shift, smoke particles, roughness increase | Rattle/squeak overlay on movement    |
| `toolEngagement` | state.ts module     | Camera dip, resistance moment, soil particles              | Tool-specific engagement sound       |
| `repairEvent`    | state.ts repair     | Golden sparkle burst, shell brightens                      | Satisfying mechanical "click"        |

### Spring-Damper System for Animation

Currently `feedback.ts` computes offsets directly. For higher visual quality, add spring-damper interpolation:

```typescript
class SpringDamper {
  value = 0;
  velocity = 0;
  constructor(
    public stiffness: number, // How fast it snaps to target
    public damping: number, // How much it overshoots (lower = bouncier)
  ) {}

  update(target: number, dt: number): number {
    const force = (target - this.value) * this.stiffness;
    const dampForce = -this.velocity * this.damping;
    this.velocity += (force + dampForce) * dt;
    this.value += this.velocity * dt;
    return this.value;
  }
}
```

Apply to: body roll, body pitch, camera follow distance, FOV changes, suspension travel. Everything that currently "snaps" to its target should instead "spring" to it.

---

## Part 5: Rigs Unbound Visual North Star

### The Goal in One Sentence

> **A Rigs Unbound screenshot should look like a premium indie game — warm, characterful, physically grounded — not a tech demo and not a prototype.**

### Visual Pillars

| Pillar                         | What It Means                                         | What It Doesn't Mean                      |
| ------------------------------ | ----------------------------------------------------- | ----------------------------------------- |
| **Warm and weathered**         | Dusty clearcoat, worn surfaces, amber light           | Not photorealistic, not cold/clinical     |
| **Physically grounded**        | Soft shadows, contact shadows, weight animation       | Not floating, not flat-shaded             |
| **Alive and responsive**       | Every action has visual + audio reaction              | Not static, not dead when idle            |
| **State-readable at a glance** | Shell glow, smoke, color shifts communicate condition | Not number-heavy, not hidden behind menus |
| **Performant on mobile**       | All effects are scalable/toggleable                   | Not desktop-only, not FPS-killing         |

### Quality Settings Architecture

```
Quality: Low (mobile/old hardware)
  - Blob shadows
  - No post-processing
  - No particles beyond wheel spray
  - Basic materials
  - State Shell: rim glow only (Fresnel, no impact ripples)

Quality: Medium (default)
  - PCFSoftShadowMap (1024)
  - Bloom + vignette
  - Particle system (pooled, < 500)
  - MeshPhysicalMaterial + environment map
  - State Shell: rim glow + impact ripples
  - Headlights (no shadows)

Quality: High (desktop/powerful mobile)
  - CSM shadows (2048)
  - Full post-processing (bloom, SSAO, color grading)
  - GPU particles (> 1000)
  - Full PBR + normal maps + clearcoat
  - State Shell: full shader with hexagonal pattern
  - Dynamic headlight shadows
  - Weather effects
```

---

## Open Questions

1. **State Shell aesthetic:** Which visual language fits Rigs Unbound best — energy field (sci-fi), outline (stylized), or heat signature (physical)? Or the recommended hybrid?
2. **Shadow map budget:** Is 1024×1024 sufficient for the terrain scale, or should we pursue CSM from the start?
3. **Particle budget:** Target particle count for mobile? 200? 500?
4. **HDRI source:** Generate a custom HDRI from the existing sky dome colors, or use a modified Poly Haven asset?
5. **Post-processing library:** Use `pmndrs/postprocessing` (community standard) or build minimal passes from scratch for smaller bundle?
6. **Quality auto-detection:** Should the game auto-detect performance capability and set quality, or let the user choose?

---

## Cross-References

- [Master UI Synthesis](GAME_UI_MASTER_SYNTHESIS_2026-07-26.md) — Five-layer information architecture
- [Micro-Interactions & Juice](GAME_UI_MICROINTERACTIONS_JUICE_FEEL_2026-07-26.md) — CSS/DOM animation techniques, hitstop, screenshake
- [Adaptive & State-Driven UI](GAME_UI_ADAPTIVE_GENERATIVE_SYSTEMS_2026-07-26.md) — Vehicle-as-UI concept, UI degradation
- [feedback.ts](../../src/game/feedback.ts) — Current rig perception contract
- [renderer.ts](../../src/game/renderer.ts) — Current rendering pipeline

## Addendum (2026-07-26) - the quality ladder is measurable, but the shell language is still not runtime-owned

- Re-checked the quality/profile contracts against the current repository state.
- The repo now has a measurable visibility and profile ladder:
  - `full`, `standard`, and `mobile-safe` profile targets in the render contract,
  - visibility counters in the performance snapshot,
  - developer-facing bridge and visibility diagnostics.
- What is still missing is the actual state-shell runtime layer:
  - no promoted shell shader profile that is proven in the browser as the
    canonical vehicle-state language,
  - no representative-device evidence tying the shell look to the selected
    quality profile,
  - no public-approval boundary for the shell presentation itself.
- So the shell concept is now well articulated in design terms, but the repo
  still needs one explicit browser-proved visual shell profile before this can
  be treated as a shipped presentation system instead of an architectural lane.
- Evidence depth: Tier 1 static contract inspection plus Tier 4 prior browser
  anchoring for the runtime surface.

## Addendum (2026-07-26) - the runtime pieces exist, but the shell is still not a canonical browser-proved profile

- Re-checked the shell-related runtime hooks in `src/game/renderer.ts`,
  `src/game/feedback.ts`, and `src/game/audio.ts`.
- The shell is now real enough to point at in code:
  - the renderer has a state-shell mesh and material slot,
  - the feedback frame carries integrity and impact data,
  - the audio layer already modulates a shell oscillator from integrity.
- That still does not equal a canonical presentation system:
  - the shell language is not yet promoted to one browser-proved visual profile,
  - the selected quality band is not yet the authoritative owner of that shell
    language,
  - representative-device proof is still missing for the shell look itself.
- So the repo has crossed from concept-only to partial runtime substrate, but
  the shell remains an architectural lane until one browser-proved visual
  profile owns it.
- Evidence depth: Tier 1 static source inspection. No new browser/device proof
  was run in this update.

## Addendum (2026-07-26) - state-shell presentation supports episode grammar, but it is not the episode grammar

- The current shell language already does useful support work for the game:
  it makes rig condition, impact, and state transitions readable at a glance.
- That makes the shell a support layer for the episode grammar, because
  episodes only stay legible when the player can read the machine’s condition
  as part of the lived moment.
- The layering stays explicit:
  - episode grammar names the lived moment,
  - state-shell presentation reinforces that moment with the current rig’s
    visible condition language,
  - the shell remains presentation, not authority.
- This note intentionally does not promote the shell into a separate gameplay
  system; it only keeps the dependency visible so future episode work can rely
  on the same readable rig-state language.

## Addendum (2026-07-26) - the shell still needs one browser-proved profile owner

- Re-checked the shell lane against the current browser-delivery and render
  profile contracts.
- The runtime pieces are already real:
  - `renderer.ts` builds a dedicated state-shell mesh and shader envelope,
  - `feedback.ts` computes integrity and impact data that drive that shell,
  - the renderer pushes the shell uniforms from live rig feedback each frame.
- The remaining gap is not another effect idea; it is one browser-proved shell
  profile that owns the visible state language for the selected quality mode.
- That shell profile should be explicitly tied to the current quality band and
  a public approval boundary, so the presentation layer is promoted by proof
  rather than by concept alone.
- Until that exists, the shell remains a contract lane rather than a shipped
  presentation profile.
- Evidence depth: Tier 1 static source inspection. No new browser/device proof
  was run in this update.

## Addendum (2026-07-29) - the next shell proof is one browser-proved profile, not a style fork

- The shell lane already has the core ingredients:
  - a state-shell mesh and shader envelope;
  - live integrity and impact data from feedback;
  - profile-dependent quality policy elsewhere in the render stack.
- The next proof slice should be one browser-proved shell profile that owns the
  visible rig-state language for a single quality band, with a clear public
  approval boundary.
- That means no separate shell style forks for the same quality level. The
  contract should prove one owned profile first, then let later variation build
  on that owner.
- Anything else? No. The shell lane only becomes shippable when one profile can
  explain itself clearly in the browser.
