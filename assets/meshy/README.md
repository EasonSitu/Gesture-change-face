# Meshy opera mask assets

The runtime bundles and expects these three local GLB files:

- `peking-opera-mask.glb`
- `nuo-opera-mask.glb`
- `yellow-opera-mask.glb`

The files are intentionally not replaced with the Meshy preview `.meshy` files. The
preview files are encrypted Meshy delivery assets and are not browser-loadable GLB
models. If a future version needs to refresh an asset, download the GLB through
Meshy's normal model-page export flow and replace the matching file using the names
above. Run `scripts/normalize-meshy-glb.mjs` after refreshing so the current
Three.js v97 loader can resolve the embedded WebP texture sources.

Source pages and license notes are kept in the repository-level `ATTRIBUTIONS.md`.
