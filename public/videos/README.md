# Hero Background Video Clips

Place short MP4 clips (5–7s) in this folder using the following filenames so the hero picks them up automatically:

- `farmer-field.mp4` — Farmer working in the field
- `tractor-plowing.mp4` — Tractor plowing the soil
- `crops-wind.mp4` — Crops waving in the wind
- `farmer-inspecting.mp4` — Farmer inspecting plants or harvesting

Recommended specs:
- Resolution: 1080p (1920×1080) or 1440p for desktop; 720p is fine for mobile
- Encoding: H.264 MP4 with faststart enabled
- Duration: 5–7 seconds
- No audio (or keep muted)
- Framing: Subject roughly centered for better mobile crop with `object-cover`

Notes:
- The component lazy-loads non-initial clips. Posters fall back to `/images/placeholder-produce.jpg`.
- If `prefers-reduced-motion` is enabled, the hero shows a static image.
