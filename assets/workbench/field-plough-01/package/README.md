# Field Plough 01 runtime sidecar

`tools/export-field-plough-glb.cjs` exports the authored model through the
canonical review harness on port `4173` using Three's `GLTFExporter`.

```bash
node tools/start-canonical-dev-server.cjs
node tools/export-field-plough-glb.cjs
```

The default derived artifact is
`assets/runtime/field-plough-01.glb`. The tool prints the byte size, SHA-256,
and basic GLB structure. Re-running with unchanged source bytes does not
rewrite the artifact. The part contract is recorded in
`field-plough-01.part-package.json`. The factory supports 3-share and 4-share
variants, wear and paint variants, stable attachment sockets, replaceable
share/cutting-edge sockets, and material-slot metadata. The GLB remains a
repo-local derivative until the parallel-owned runtime lane admits it. It is
deliberately not public-approved and does not grant visual mesh collision
authority.
