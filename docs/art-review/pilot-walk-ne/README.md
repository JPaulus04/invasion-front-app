# Northeast walk candidate

West revision c093984 passed all jobs in run 40043302955. Reviewed west video from artifact 12540243505 with 8fps aspect-preserving, fixed-height crops: alternating steps, steady weapon, return to idle. Cardinal scale continuity remains a polish item.

These four northeast frames are review assets only, not bundled or selected during gameplay. Built-in image generation used pilot_ne.png as identity reference. Initial generation repeated a leg phase; a targeted bottom-row correction switches the exposed sole to the opposite boot. Revised sheet exec-1787f7ab-4a99-4691-98c8-292cf3d97961.png.

Initial prompt:
Create a transparent 2x2 sprite sheet of four chronological WALK frames for this exact Outpost Zero pilot. Use attached northeast pilot as exact identity/camera/heading reference: rear three-quarter view facing upper RIGHT, orange visor only at right edge, blue armor, white helmet trim, backpack orange round battery, same short pistol to upper right. Do not rotate or mirror. Upper body, helmet, backpack, arms and gun stay at identical local positions, proportions and size in all four equal cells. Legs alternate distinctly: top-left left boot rearward lower-left and right leg forward upper-right; top-right left leg passing under hip, right planted; bottom-left right boot rearward lower-left and LEFT leg forward upper-right, opposite limb phase; bottom-right right knee passing, left foot planted. Show knee bends and alternating boot soles, not duplicated leading leg. Full body same scale, generous transparent padding. Rounded dimensional cartoon 3D exactly matching reference, upper-left light. No floor, ground shadows, text, grid, labels or background. Four distinct gait poses arranged row-major.

Correction: preserve all upper bodies and top row; bottom-left screen-right leg rearward with sole facing camera lower right, screen-left leg forward; bottom-right right knee passing, left foot planted.

Extraction: four 627px cells at common 41% scale, helmet center aligned to original NE sprite and top y16; 256px RGBA canvases. Alpha noise below 20 removed. Bounds checks passed. In-game registration, motion and stop transition remain unverified. Next integrate a simulator-only NE preview using diagonal movement, then review continuous video. Build 322 stays development-only; no upload or reset.
