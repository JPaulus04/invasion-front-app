# Build 330 production ability draft

This batch replaces the bare card symbols with cached, shaded equipment illustrations: ammunition, emitters, orbiting spheres and steel upgrade modules. Artwork occupies an 80-point clipped window beside readable rarity, title, effect and rank/slot context. Rarity borders still come from TacticalDraftRules; drop weights are unchanged.

The real showLevelUp flow now includes a 1.35-second staggered draw with vertically scrolling artwork. Repeated artwork is the actual chosen reward, not fake alternative rewards. Tap skips without selecting or rerolling. Reduce Motion skips the animation. Actual touch selection dims other cards and confirms the chosen card for 0.24 seconds before calling the same activation route used by QA. Combat remains paused during this response, and repeated selection is blocked. Overlay cleanup cancels pending callbacks.

Cards distinguish new skills from rank-ups, show current/next tactical rank out of three, explain slot consumption, retain live synergy previews, and label eligible evolution as ready. Movement now states the actual +6 speed benefit. Existing acquisition, evolution, firing and combat rules remain authoritative.

Validation: local source sanity and whitespace checks; simulator scenarios assert skip preserves choices/pending rewards/paused state and settles artwork, then exercise normal activation/resume. Xcode compilation and rendered visual quality require the full GitHub review. No TestFlight upload. Quantitative damage/burn descriptions beyond current source-backed copy and a loadout-flight animation remain outside this batch. No 9.5/10 quality claim without reviewing captures.
