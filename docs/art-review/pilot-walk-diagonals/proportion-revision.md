# SE/SW proportion candidates — October 24

Review branch only; not accepted for gameplay. Rebuilt using built-in image generation from original pilot_se.png and pilot_sw.png identity references. Prompt: duplicate exact reference upper body across a transparent 2x2 sheet, preserve helmet/torso/weapon proportions and direction, change only legs to left contact/right passing/right contact/left passing with modest strides. First outputs repeated the leading leg; targeted bottom-left edits required the empty-hand-side leg forward and gun-side leg back.

Final source sheets: SE exec-c0c8f52a-0c21-4047-b79e-66489f727a68.png; SW exec-cbed28af-d6f1-4f74-9a3f-57e742ba8489.png. Extracted four 627px cells at common 40% scale per direction, idle helmet top/center registration, alpha below 20 cleaned, 256px RGBA outputs. All eight fit within canvas.

Compared at equal scale against idle. Helmet sizing closer; SW has shorter vertical leg reach than idle and SE passing/contact poses remain similar. Need actual motion review before accepting these as improvements. Existing runtime fixtures unchanged. Northwest correction acc51b9 compiled; focused captures still running when these candidates were saved separately to avoid cancellation.

Next: finish NW review, compare these candidates in simulator, retain existing assets if motion regresses. No TestFlight upload or reset.
