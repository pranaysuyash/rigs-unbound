# Field Plough 01 — Object Reference Generation

- Generated: 2026-07-29
- Model: `gpt-image-1.5`
- Size: `1536x1024`
- Quality: `high`
- Source image: `field-plough-01-object-reference-2026-07-29.png`
- Intended use: isolated reference for the first bounded `img2threejs`
  rig-part package.

## Prompt

> Create a production reference plate for a stylized real-time game rig part: one compact field plough implement for the Patchwork Atlas world, isolated on a plain warm light-gray background, centered and fully visible, front-left three-quarter view, no vehicle, no people, no landscape, no text, no logos. The implement is a rugged three-point-mounted plough with a clear central attachment frame, two lower hitch points, a top link socket, a sturdy cross beam, three curved steel plough shares with readable cutting edges, worn dark painted metal, rust at seams, soil residue in the lower recesses, and a small hydraulic ram with obvious hinge pivots. Keep every part physically connected and separated enough to identify the attachment frame, pivot points, beam, shares, and hydraulic cylinder. Stylized hand-painted 3D game asset reference, controlled studio light, grounded contact shadow, orthographic-feeling camera, clean silhouette, suitable as input for a procedural Three.js reconstruction. Do not make it a scene or an illustration.

## Review note

The generated plate is a strong conditional rig-part input: one dominant
implement, visible attachment frame, repeated plough shares, clear pivot areas,
and readable painted-metal/soil-wear material families. The generated image
appears to show four shares rather than the requested three; the reconstruction
spec must treat the visible repeated system as evidence and record the count
uncertainty instead of silently forcing the prompt's count. Hidden attachment
geometry, dimensions, collision proxy, and actual runtime pivot limits remain
unverified.
