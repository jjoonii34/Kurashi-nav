# Third-party notices

Open-source code and reference material used by kuramiru. Data sources and
their credits are listed separately in `docs/DATA_SOURCES.md`; npm packages
keep their own licence files under `web/node_modules`.

## In use

| Name | Licence | Where | How it is used |
|---|---|---|---|
| OpenCC character tables | Apache-2.0 | https://github.com/BYVoid/OpenCC | `web/geo/hanzi.ts` is generated from `JPShinjitaiCharacters.txt` and `TSCharacters.txt`, reduced to the kanji in the bundled place names (`web/scripts/build-hanzi.ts`). |

## Planned — not used yet

Listed by `docs/requirements/v1.4-design-reference.md`. Each entry is
confirmed, with the licence file checked, when the code first uses it.

| Name | Licence (as stated in the requirements, not yet checked here) | Where | Planned use |
|---|---|---|---|
| 地理院地図 gsimaps | BSD-2-Clause | https://github.com/gsi-cyberjapan/gsimaps | Reference for layer switching and legends on the hazard map. Code only; map tiles and data have their own terms. |
| Tremor | Apache-2.0 | https://github.com/tremorlabs/tremor | Copied components for the summary card and cost bars, with a source and modification note in each file. |
| vaul | MIT | https://github.com/emilkowalski/vaul | Bottom sheet on the location screen. |
