# East walk-cycle candidate

Resources: OutpostZero/ArtAssets/pilot_walk_e_0.png through pilot_walk_e_3.png.
Simulator-only flag: -previewPilotWalkEast.
Generation: built-in image-generation tool, transparent RGBA, pilot_e.png reference.

Initial prompt:
Use case: stylized-concept. Asset type: Outpost Zero east-facing walk sprite sheet. Attached pilot_e.png is the exact identity/camera/material reference. Generate ONE transparent square sheet with FOUR equal cells in a 2x2 grid, row-major chronological walk poses. SAME blue armored pilot in each, strictly facing screen RIGHT (east), same elevated orthographic view, no rotation toward camera. Pose 1 near leg extended forward and far leg rearward; pose 2 near leg passing under hip and far foot planted; pose 3 far leg forward and near leg rearward; pose 4 far knee passing and near foot planted. Clearly alternating thigh, knee and boot silhouettes. Helmet, shoulder and orange visor stay identical size and registered at the SAME local pixel position in every cell. Keep short dark pistol pointing right in original hand, steady two-handed ready hold and identical barrel length. Same white helmet trim, blue armor, orange chest/backpack lights. Preserve body proportions and overall scale of reference; no added gear. Polished rounded cartoon 3D, upper-left light. Whole body centered with generous transparent padding, equal character size. No floor, shadow, text, labels, grid lines or background. Four distinct gait poses. Do not mirror the weapon or change handedness.

Revision prompt:
Preserve all helmets, torsos, backpacks, arms and guns and the top row. Change only bottom-row legs to opposite gait phase. Bottom-left: near leg extends backward/left, far leg forward/right. Bottom-right: near knee bends backward with boot lifted left, far boot planted below/right of hip. No mirroring, rotation, text, grid, floor or shadow.

Source: exec-399f5700-228d-4902-884d-86617fb5fc3d.png, 1254px sheet.
Extraction: four 627px cells at common 43% scale; helmet center registered at x117.5 and top y16 on 256px canvases. Alpha noise below 20 removed. No independent pose scaling.
Source sheet rejected before revision: exec-ae20432c-f89c-4719-aefa-e3cba54374ef.png.

These poses remain candidates. Continuous east movement and idle transition must be reviewed in the simulator. Do not mirror them to obtain west: lighting, weapon handedness and backpack placement would reverse.
