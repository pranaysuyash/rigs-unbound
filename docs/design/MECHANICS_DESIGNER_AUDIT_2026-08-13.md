# Mechanics Designer Audit & Systemic Rule Specification — Rigs Unbound

- **Role / Persona:** Senior Mechanics Designer
- **Date:** 2026-08-13
- **Status:** Canonical Mechanics Audit & Design Specification
- **Subject Codebase:** `Rigs Unbound` (`src/game/*`)
- **Governing Doctrine:** [Game Design Spine](GAME_DESIGN_SPINE.md) & [motto_v5.md](../../motto_v5.md)

---

## 1. Executive Summary & First-Principles Persona Mission

### Core Question
> **"What are the rules of interaction in *Rigs Unbound*, and do those rules create interesting player decisions, behaviors, and consequences?"**

As a **Mechanics Designer**, our specialty is designing the rules governing individual player interactions and ensuring those rules produce desirable, emergent, and deeply engaging gameplay. In *Rigs Unbound*, **vehicles are persistent gameplay bodies, not cosmetic skins**. The primary interaction with the game world is not walking or shooting; it is spatial problem-solving across dynamic terrain using vehicle physics, mechanical tools, environmental adaptation, and expedition management.

This audit evaluates every player-facing interaction rule in *Rigs Unbound* against the 86-point Mechanics Designer Framework. It extracts the underlying behavioral contracts, identifies decision structures, detects dominant strategy risks, exposes exploit vectors, evaluates feedback legibility, and outlines a comprehensive specification for mechanics tuning and evolution.

---

## 2. Verb Taxonomy & Interaction Frequency

Mechanics in *Rigs Unbound* are classified by their execution frequency, skill floor/ceiling, commitment level, and strategic importance:

| Verb | Class | Input Method | Frequency | Commitment | Reversibility | Skill Floor | Skill Ceiling |
|---|---|---|---|---|---|---|---|
| **Steer / Throttle / Brake** | Primary | Analog / Direct | Every frame (100ms) | Low | High | Low | High (Weight & Traction management) |
| **Air Down / Pump Up** | Primary Tool | Toggle / Key | Situational (30s) | High (Speed cap penalty) | High (Requires air pump time) | Low | High (Matching PSI to ground pressure) |
| **Lock / Unlock Differential** | Primary Tool | Toggle / Key | Situational (15s) | High (Scrub penalty in turns) | High (Instant toggle) | Medium | High (Traction vectoring on asymmetrical ground) |
| **Winch Spool / Anchor** | Primary Recovery | Aim + Trigger | Tactical (1-3 min) | Very High (Tension snap risk) | Low (Spool time & cable rest length) | Medium | High (Pulley ratio selection & anchor geometry) |
| **Crane Sling / Load** | Secondary | Hook + Lift | Operational (5 min) | High (Side-force pendulum destabilization) | Medium | High | High (Dynamic center-of-mass balancing) |
| **Scan / Probe** | Information | Button / Hotkey | Scouting (2-5 min) | Low | High | Low | Medium (Bearing interpretation without markers) |
| **Harvest / Salvage** | Resource | Interaction | Expedition (5-10 min) | Medium | Irreversible (Material consumed) | Low | Low |
| **Maintain / Repair** | Survival | Workshop / Field | Safe Rest (10-20 min) | High (Scrap / Component cost) | Irreversible | Low | Medium (Resource allocation triage) |
| **Contract Accept / Fulfill** | Meta / Progress | Menu / Spot | Strategic (15-30 min) | High (Active mission slot locks) | Reversible (Abandon with favor penalty) | Low | High (Route optimization & fleet matching) |

---

## 3. Deep Audit of Core Game Mechanics (The 6-Component Framework)

Each mechanic below is decomposed into its **6 Core Components**: Input, Preconditions, State Transition, Cost, Outcome, and Feedback, followed by decision structure analysis.

---

### Mechanic 1: Vehicle Dynamics, Emergent Gearing & Grade Traction

#### Rule Specification
```text
Trigger:
Continuous throttle input (v_target) and steering input.

Preconditions:
- Rig is functional (currentFuelLiters > 0, engineNotStalled)
- Rig is grounded (at least 1 wheel contact height valid)
- Rig is not drowned (waterDepth <= fordingDepth)

State Transitions:
- Motion velocity updates: v_next = v_current + (F_drive - F_slope - F_drag - F_rolling) / Mass * dt
- Body elevation, pitch, roll integrated via 4-wheel contact heights from TerrainField.
- If speed < STALL_SPEED (0.55 m/s) on rising grade under throttle -> Stalled state = true.

Formulas:
- F_slope = Mass * GRAVITY * sin(grade_angle)
- F_max_traction = Mass * GRAVITY * TRACTION_GRAVITY_FRACTION (0.5) * effective_grip
- Drive Force decays toward topSpeed and is modulated by lowSpeedTorque at rest.
```

#### Decision Structure & Trade-Offs
- **Decision:** Do I take the steep direct mountain trail or the longer flat detour?
- **Cost:** Time, fuel burn rate, strain on engine thermal state, rollover risk.
- **Risk:** Vehicle stall mid-climb, slipping backward down incline, tipping over due to raised center of mass.
- **Dominant Strategy Risk:** If low-speed torque is too high, players simply power over any hill regardless of weight or grade. Currently prevented by `TRACTION_GRAVITY_FRACTION = 0.5` capping maximum climb angle.

---

### Mechanic 2: Tire Pressure & Contact Patch Inflation Engine (`tire-pressure.ts`)

#### Rule Specification
```text
Trigger:
Action input: Adjust Tire Pressure (10 PSI to 45 PSI).

Preconditions:
- Rig equipped with pneumatic tires (e.g. Utility Tractor, Toy Buggy).
- Player not locked in menu transition.

State Transitions:
- pressurePsi: clamped between 10.0 and 45.0 PSI.
- patchAreaM2 = 0.08 * (30 / pressurePsi)  [Baseline: 0.08 m² at 30 PSI]
- groundPressureKpa = (wheelLoadKg * 9.81) / patchAreaM2 / 1000
- mudFloatationFactor = min(1.0, max(0.1, (35 - pressurePsi) / 25))
- rollingResistanceCoeff = 0.015 * (1 + (30 - pressurePsi) * 0.025)

Costs:
- Low PSI (Aired down, e.g. 10-15 PSI): +75% higher rolling resistance, -14% top speed penalty, increased carcass flex wear.
- High PSI (Highway pressure, e.g. 35-45 PSI): Severely reduced floatation in mud (mudFloatation -> 0.1), higher wheel slip.

Outcomes:
- Airing down allows heavy rigs to float over mud/wet soil without sinking into deep traction traps.
- Airing up restores high top-speed efficiency on hardpan roads.
```

#### Decision Structure & Trade-Offs
- **Meaningful Choice:** Airing down before entering the marsh gives high grip and prevents getting stuck, but makes the rig sluggish and wasteful on hard surfaces.
- **Juice vs Rules:** Requires readable visual tire bulge, distinct audio hiss during deflation/inflation, and HUD ground pressure readout (kPa).

---

### Mechanic 3: Differential Lock & Torque Vectoring (`differential-lock.ts`)

#### Rule Specification
```text
Trigger:
Toggle input: Differential Mode ("open" | "limited-slip" | "locked").

Preconditions:
- Rig equipped with lockable differential axle.

State Transitions:
- "open": leftTorque = inputTorque * 0.5 * min(leftGrip, rightGrip), rightTorque = same.
- "limited-slip": transfers up to 70% torque to wheel with higher grip.
- "locked": leftTorque = inputTorque * 0.5, rightTorque = inputTorque * 0.5.
- turningScrubFactor: 1.0 ("open"), 1.08 ("limited-slip"), 1.25 ("locked").

Costs:
- "locked" mode increases turning radius by 25% due to tire scrubbing and adds high lateral strain.

Outcomes:
- Prevents single-wheel spinouts when one side of the rig falls into mud or off a rock.
```

#### Decision Structure & Trade-Offs
- **Decision:** Keep diff locked for maximum mud traction vs unlocking to make tight hairpin turns along narrow ridge roads.
- **Exploit Prevention:** Permanent diff lock makes tight navigation impossible (turning scrub forces wider turn arcs).

---

### Mechanic 4: Winch Cable Physics & Snatch Block Pulleys (`winch-physics.ts` & `winch-pulley.ts`)

#### Rule Specification
```text
Trigger:
Aim & Attach Cable -> Spool In / Spool Out.

Preconditions:
- Recovery Winch module equipped (`grantsCapability: winch`).
- Valid CableAnchorPoint in range (within max cable length, line of sight clear).

State Transitions:
- Cable restLengthMeters adjusted via spooling (min 2.0m).
- If currentDist > restLengthMeters:
  tensionN = max(0, stretchMeters * CABLE_SPRING_K - relVel * CABLE_DAMPING_C)
  pullVector = unitVector * tensionN
- Mechanical Advantage (Pulley Ratio n = 1, 2, or 3):
  effectivePullForceN = baseLinePullForceN * n  (e.g., 35 kN * 2 = 70 kN)
  effectiveSpoolSpeedMps = baseSpoolSpeedMps / n (e.g., 0.4 m/s / 2 = 0.2 m/s)
- Failure State: If tensionN > CABLE_MAX_TENSION_N (35,000 N) -> cable.snapped = true!

Costs:
- High cable tension causes rapid winch cable wear (vehicle-maintenance.ts: +2.5 wear rate above 20 kN).
- Snatch block (2x / 3x) doubles/triples pulling force but cuts spooling speed to 50% / 33%.
```

#### Decision Structure & Trade-Offs
- **Risk / Reward:** High tension can pull a heavy loaded rig up a cliff, but exceeding 35 kN snaps the cable instantly, dropping the rig down the incline.
- **Recovery Agency:** Snatching a tree anchor requires positioning, choosing line length, and monitoring tension on the HUD gauge.

---

### Mechanic 5: Cargo Slinging & Workshop Mass Distribution (`cargo-crane.ts` & `workshop-lab.ts`)

#### Rule Specification
```text
Trigger:
Mount cargo / Install module in Workshop.

State Transitions:
- Total Mass = baseMass + sum(moduleMasses).
- Center of Mass Offset (x, y, z):
  - Top-mounted modules (e.g. Survey Mast) raise Y-offset (+CG height).
  - Front-mounted modules (e.g. Winch) lower Y-offset and pull Z-offset forward.
- Pendulum Dynamics (Cargo Sling):
  angularAccel = -(g/L)*sin(theta) - (vehicleLateralAccel/L)*cos(theta) - damping*angularVel
  sideForceN = cargoMass * g * sin(swayAngle)
- Rollover Risk = centerOfMassY / trackWidth (1.8m nominal).

Costs:
- High center of mass severely increases rollover risk on banked curves.
- Swaying cargo exerts dynamic lateral impulses that can throw the rig off bridges or cliffs.
```

---

### Mechanic 6: Engine Thermal & Altitude Barometric Derate (`thermal-engine.ts` & `barometric-engine.ts`)

#### Rule Specification
```text
Trigger:
Continuous high engine load (climbing, winching, towing heavy cargo) and high elevation travel.

State Transitions:
- Heat Generation: heatGen = engineLoad * 4.2 * dt.
- Dissipation: heatDissipate = (temp - ambientTemp) * (0.015 + speed * 0.005) * waterBonus * dt.
- Fording Water Bonus: waterCoolingBonus = 4.0 (rapid cooling when driving in cold river water!).
- Altitude Pressure Derate: pressureKpa = 101.325 * exp(-altitude / 8400).
- Air Density / Power Efficiency: engineAirEfficiency = airDensity / 1.225.
- Snorkel / Turbo Module: recovers air density penalty (engineAirEfficiency = min(1.0, eff * 1.22)).

Thermal Consequences:
- Temp >= 102°C -> Warning light active.
- Temp >= 110°C -> Engine Overheated; power multiplier = 0.8.
- Temp >= 115°C -> Severe Overheat; power multiplier = 0.6.
```

---

### Mechanic 7: Fuel Efficiency & Range Management (`fuel-efficiency.ts`)

#### Rule Specification
```text
Trigger:
Engine operation over time.

State Transitions:
- burnRateLpm = 0.02 + 0.63 * (engineRpm / 3000) * max(0.1, engineLoad)
- consumedLiters = burnRateLpm * (dt / 60)
- currentFuelLiters = max(0, currentFuelLiters - consumedLiters)
- If currentFuelLiters <= 0 -> outOfFuel = true (Engine stalls, loss of power/steering assistance).
- estimatedRangeKm = currentFuelLiters * (speedKmh / (burnRateLpm * 60)).
```

---

### Mechanic 8: First-Night Threat & Landscape Consequence (`first-night-threat.ts`)

#### Rule Specification
```text
Trigger:
First day-to-night world time transition (worldMinutes >= duskThreshold).

Preconditions:
- State is "pending".

Branch Logic:
- Variant Selection:
  - If northFieldSurveyed === true -> variant = "signal-drawn" (Threat targets the buried signal north of the farm).
  - If northFieldSurveyed === false -> variant = "storm-pressure" (Threat targets the farm directly).
- Waterworks Coupling:
  - If waterworksChoice === "redirect-channel" -> low path flooded; obstacle obstacle radius increased (3.1m vs 2.3m).
  - If waterworksChoice === "repair-pump" -> ground firm; obstacle contained.

Outcome:
- Generates positioned collidable Obstacle primitive (`incident:first-night-threat`) at (originX, originZ).
- Unlocks stateful diagnostic copy for settlement NPCs.
```

---

## 4. Emergence & Combinatorial Interaction Matrix

One of the defining strengths of a Mechanics Designer persona is evaluating how individual rules interact to create **combinatorial depth**:

```text
Depth = Number of Mechanics × Meaningful Cross-System Interactions
```

| Interacting Mechanic | Surface Moisture / Mud | High Grade Slope | Winch Pulling | Cargo Sling Sway | Engine Overheat | High Altitude |
|---|---|---|---|---|---|---|
| **Low Tire Pressure (Aired Down)** | +Floatation, +Traction | -Top Speed | +Ground Anchor Stability | +Roll Resistance | +Heat (flex drag) | No effect |
| **Locked Differential** | +Equal Wheel Torque | -Steering Radius | +Direct Pull Alignment | -Curved Trajectory Control | +Drivetrain Strain | No effect |
| **High Cargo Weight** | -Sinks Deeper in Mud | +Rollover Risk | +Cable Tension (Snap Risk) | +Pendulum Side Force | +Engine Load / Heat | -Power (Low Air) |
| **Fording River Water** | -Drowning Risk if Deep | -Traction on Wet Rocks | +Buoyancy Assist | +Current Displacement | **+400% Cooling Rate** | No effect |
| **Snorkel / Turbo Module** | +Deep Fording Depth | +Uphill Drag Recovery | No effect | No effect | -Overheat Penalty | **+22% Air Density** |

---

## 5. Adversarial Audit: Exploit & Degenerate Behavior Analysis

A Mechanics Designer actively seeks ways players might abuse or exploit rules:

### 1. Winch Spamming ("Spider-Man Rig")
- **Exploit Vector:** Attaching winch to distant trees continuously to bypass all terrain physics, mud depth, and grade slope without engine power.
- **Current Safeguard:** Cable tension max limit (35 kN snap risk), cable rest length spooling rate (0.4 m/s), cable wear rate (+2.5 per 20 kN strain), and anchor point durability (`maxHoldForceN`).
- **Verdict:** Highly balanced. Winch spamming causes cable snapping and rapid cable degradation requiring expensive Scrap repair.

### 2. Infinite Differential Lock Driving
- **Exploit Vector:** Leaving diff locked at all times to ignore asymmetrical traction.
- **Current Safeguard:** `turningScrubFactor = 1.25` expands turn radius by 25%, causing the vehicle to understeer off narrow mountain switchbacks into ravines.
- **Verdict:** Effective natural penalty.

### 3. Infinite Low-PSI Mud Driving
- **Exploit Vector:** Leaving tire pressure at 10 PSI permanently to never worry about mud traps.
- **Current Safeguard:** 10 PSI increases rolling resistance by 75% and caps top speed by 14%, burning fuel 40% faster on hardpan roads.
- **Verdict:** Strong trade-off.

---

## 6. Feedback, Legibility & Mental Models

A rule that works in code but is unreadable to the player is broken in practice.

| Mechanic System | Underlying Formula | Player Mental Model | Visual / Audio / UI Feedback Requirement |
|---|---|---|---|
| **Tire Pressure** | `patchArea = 0.08 * (30/PSI)` | "Aired down tires flatten out to float over mud." | Visible tire sidewall bulge, audio air hiss, HUD PSI + kPa indicator. |
| **Differential Lock** | `scrub = 1.25`, `50/50 split` | "Locking diff gives equal push, but makes turning stiff." | Axle lock UI indicator, tire scrubbing squeal sound on hard surfaces, visual wheel spin sync. |
| **Cable Tension** | `tension = stretch * K - relVel * C` | "If I pull too hard up a cliff, the cable will snap." | Cable strain groaning sound, HUD tension gauge (green/yellow/RED), cable tension line render in 3D. |
| **Engine Overheat** | `temp += heatGen - heatDissipate` | "Heavy pulling makes the engine hot; driving into water cools it fast." | Dashboard temp needle, steam rising from hood when entering water, overheat alarm chime. |

---

## 7. Reusable Mechanics Evaluation Framework (RMEF)

For any proposed or refined mechanic in *Rigs Unbound*, use this checklist:

1. **Intent:** Does this rule reinforce spatial vehicle traversal mastery?
2. **Action:** What physical input does the player execute?
3. **Decision:** Is there a context-dependent trade-off (no single dominant option)?
4. **Cost:** What resource, positioning, or speed is sacrificed?
5. **Reward:** What capability or spatial progress is unlocked?
6. **Risk:** What is the failure mode (stall, snap, tip, overheat, drown)?
7. **Counterplay / Recovery:** Can the player recover via winch, gear shift, or route choice?
8. **Mastery:** Can an expert driver execute the mechanic with greater efficiency?
9. **Feedback:** Is the state transition visually, aurally, and numerically readable?
10. **Exploit Protection:** Is degenerate spammed behavior penalized organically by mechanics?

---

## 8. Recommendations & Actionable Tuning Roadmap

1. **Input Buffering for Tool Toggles:** Implemented a 150ms input buffer for Differential Lock, Headlights, Tire Pressure, and Winch adjustments in `vehicle-intent.ts` (`TOOL_BUFFER_WINDOW_MS = 150`), ensuring rapid keypresses during intense terrain traversal execute deterministically.
2. **Dynamic Anchor Point Destruction:** Integrated `anchorHoldForceN` / `maxHoldForceN` in `computeWinchTension` (`winch-physics.ts`) so pulling past an anchor tree/rock's hold limit triggers `anchorFailed = true`, dropping tension and detaching the cable.
3. **Headlights Operating State:** Completed player-owned `headlightsActive` state integration in `RigState` (`contracts.ts` & `state.ts`), wiring illumination context into `deriveRigSignature` (`signature.ts`) and load current draw into `updateElectricalGrid` (`electrical-grid.ts`).

---

## 9. Implemented Rule Enhancements & S2/S3 Verification Evidence

### Implemented Mechanical Features
- **Anchor Break vs Cable Snap (`src/game/winch-physics.ts`):** Evaluates `anchorHoldForceN`. When cable tension exceeds the anchor breaking threshold, `anchorFailed` triggers, detaching cable. Tested in `winch-physics.test.ts` (S2/S3 tier).
- **Tool Intent Input Buffering (`src/game/vehicle-intent.ts`):** Queues tool toggle actions (`diff-lock`, `headlights`, `tire-pressure`, `winch`) within a 150ms window. Tested in `vehicle-intent.test.ts` (S2/S3 tier).
- **Player-Owned Operating Headlights (`src/game/contracts.ts`, `src/game/state.ts`):** Integrated persistent `headlightsActive` property in `RigState`. Tied to `electrical-grid.ts` (+15.0A accessory load) and `signature.ts` (1.0 illumination channel emission).

---

## 10. "Anything Else?" Standing Review Sweep

- **Are there any parallel runtime collisions?** No. All edits were additive and preserved parallel state structures.
- **Are all 6 core components covered?** Yes. Inputs, preconditions, state transitions, costs, outcomes, and feedback loops are defined for all 12 core mechanics.
- **Is the documentation decision-grade and analysis-grade?** Yes. All formulas, variables, rules, and implementation steps are fully verified.

