# Material Mission

A Science Lagoon game for Grades 1–6. Children plan fair tests, compare evidence and improve designs for an island school. There are 60 missions, 10 per grade, on Matter and Materials and Science and Technology.

All test results are authored example data from a simple model, not real measurements. Water, heat, electricity and load tests happen on screen only.

## Run it

It is a static site with no build step. Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

Progress is saved in the browser's `localStorage` under `scienceLagoon.materialMission.v1`. It stays on that device and does not sync. No names, voices, photos or locations are stored.

## How a mission works

Brief → Predict → Test → Evidence → Explain → New problem → Summary.

- **Test.** Grades 4–6 plan which single variable to change before the bench unlocks. A fair-test mission stays locked until two tests differ in only that variable.
- **Evidence.** The child says whether the result matched their prediction. Grades 5–6 also label and draw a chart of their own results.
- **Explain.** Answer choices are shuffled per learner. Grades 4–6 build a claim, evidence and reason from their own tests.
- **New problem.** Two questions. *Demonstrated* is recorded only when both are right with no hints and no wrong tries.

## Files

| File | What it holds |
| --- | --- |
| `index.html` | Page, styles (OceanHub theme, high-contrast mode) and SVG patterns |
| `js/content.js` | The 60 missions, their questions and hints, chart tasks, and the room each mission sits in |
| `js/scenes.js` | SVG test-bench scenes, school furniture and the island picture |
| `js/model.js` | Result lookups, fair-test and requirement checks, answer shuffling, the explanation builder |
| `js/app.js` | Saved state, screens, the school street map with the moving player, events |
| `tests/playthrough.js` | Plays every mission start to finish and checks the gates |

The scripts are plain browser scripts loaded in this order: `content.js`, `scenes.js`, `model.js`, `app.js`.

## Edit content

- **Missions.** Each mission in `js/content.js` has a stable `id` and a `v` version. Raise `v` when you change a mission's rules, so saved attempts for it restart. Stamps are kept.
- **Rooms.** `MISSION_ROOM` in `js/content.js` sets which school room each mission appears in. Missions run down the road in their order within the grade.

## Test

```bash
npm install
npx playwright install chromium
npm test
```

The test exits with code 1 if any mission cannot be completed, a gate leaks, or the page logs an error.

## Curriculum status

Grade placements are **proposed** teaching choices. A Maldivian science educator still needs to map each mission to the current adopted NIE syllabus outcome codes and review the example results. No outcome code or full syllabus coverage is claimed.
