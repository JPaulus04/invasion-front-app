# North walk-cycle candidate

Production resources: OutpostZero/ArtAssets/pilot_walk_n_0.png through pilot_walk_n_3.png.
Preview: simulator-only -previewPilotWalkNorth. Ordinary gameplay does not select these frames.

Built-in image-generation tool, transparent background, with pilot_n.png as identity reference.
Prompt: "Outpost Zero rear-facing north walk cycle sprite sheet. Use attached pilot_n.png as exact identity, scale, elevated orthographic camera, lighting, armor and backpack reference. Generate one transparent square sprite sheet with four equal cells in a 2x2 grid. Chronological order row-major: left boot rearward/right leg forward; left knee passing/right foot planted; right boot rearward/left leg forward; right knee passing/left foot planted. Same rear-facing pilot, no turning, steady helmet and torso at identical height and size, identical shoulder width, backpack with orange circular battery, blue armor and white helmet rear trim, pistol on viewer-right held steady. Full body, equal scale, transparent padding, no ground, shadow, text, borders or grid. Soft dimensional cartoon 3D, upper-left lighting, no visor on rear helmet."

Generated 1254px RGBA sheet split into four 627px cells. Common 45% scale, near-transparent noise removed; helmet centers registered to x128 and tops to y16. No independent scaling. Canvas 256px RGBA. Inspect continuous in-game video before accepting. Source sheet: exec-81ea011c-3dc1-48aa-9f95-1cd7313425c5.png.
