# The sheets: one per brand, same layout

| Brand | Sheet | id |
|---|---|---|
| Refluke | Refluke content machine | `1Ga2Kx8UoX0xum17eITfDhL6JER2SnAAeEfHfUJ8W3I4` |
| TMV | TMV content machine | `12qqX96HeeSb_KnSXDdZEjKd1LSaax1odcP7snXCrCAs` |

Links: `https://docs.google.com/spreadsheets/d/<id>/edit`.

- Tools: the Google Sheets connector (`get_values`, `append_values`, `update_values`). Load them with ToolSearch if deferred. Both write tools parse input like the Sheets UI: a string starting with `=` becomes a formula.
- One sheet per brand. Never write a brand's script to the other brand's sheet, and never create a new sheet; if the connector is off, say so and stop before writing.
- Script IDs: `R001…` in Refluke, `T001…` in TMV.

## Tabs

| Tab | sheetId | Who writes | Columns |
|---|---|---|---|
| Scripts | 0 | this skill | A ID · B Date · C Status · D Format · E Topic · F Came from · G Hook options · H Chosen hook · I Script (spoken) · J Words · K Est. seconds · L CTA keyword · M Caption · N Shot list · O Sources · P Open questions · Q Posted URL · R Notes |
| Ideas | 1 | ai-trend-scout (that brand's run) | A Scout date · B Trend · C What happened · D Why now · E Proof · F Sources · G Social signal · H Reel to shoot · I Format · J Hook draft · K CTA idea · L Score (1-5) · M Status · N Script ID |
| Performance | 2 | Ajay (or Claude when he pastes numbers) | A Script ID · B Posted date · C Platform · D URL · E Views · F Likes · G Comments · H Saves · I Shares · J Follows · K Comments per 1k views · L Notes |
| Hooks | 3 | seeded with Nick's 49; add Refluke hooks that did well | A Hook · B Pattern · C Format · D From · E Likes · F Notes |

Dropdowns: Scripts Status = Idea, Drafted, Approved, Shot, Edited, Posted, Dropped. Ideas Status = New, Picked, Skipped, Scripted. Format (Scripts D, Ideas I):
- Refluke: Tool review, Use case, Claude trick, ChatGPT trick, AI shortcut, News, Model update, List, Alternative, Trend story, Marketing.
- TMV: Search update, Study / data, AI visibility how-to, Prompt check, Myth, Use case, Tool review, List, Alternative, News, Trend story, Content marketing.

## Writing a script row

1. `get_values` on `Scripts!A:A`. Next ID = the brand letter (`R` / `T`) + 3 digits, one more than the highest (`R001` / `T001` if none).
2. `append_values` to `Scripts!A1` with one row of 18 cells:
   - A the ID · B today `YYYY-MM-DD` · C `Drafted` · D the format (exact dropdown text) · E topic in under 8 words
   - F where it came from: `idea: <Ajay's words, short>` / `reference: <link>` / `Ideas row <date> <trend>`
   - G the 3 hooks, one per line, each prefixed `[pattern]` · H the chosen hook
   - I the full spoken script, one sentence per line (the hook is its first line)
   - J `=IF(INDIRECT("I"&ROW())="","",COUNTA(SPLIT(INDIRECT("I"&ROW())," "&CHAR(10))))`
   - K `=IF(INDIRECT("J"&ROW())="","",ROUND(INDIRECT("J"&ROW())/245*60))`
   - L CTA keyword in caps · M the caption (with hashtags)
   - N shot list, one line per sentence: `1 HOOK | <on screen> | Ajay records / we build`
   - O sources, one per line: `claim: URL` · P open questions / `[NEED]` items, or empty
   - Q empty · R empty
3. `get_values` on that row and check J and K show numbers and I is complete. Text cells must not start with `+`, `-` or `=` (they turn into broken formulas); start with a word or a leading `'`.

## Updating

- Edits to a script: find the row by ID in column A, then `update_values` on that row's cells only (e.g. `Scripts!H7:I7`). Don't touch J and K (formulas).
- Status changes: `update_values` on column C of that row.
- Picking an idea: Ideas row → M `Scripted`, N the new script ID.
- Performance rows: J/K style formula for K: `=IF(N(INDIRECT("E"&ROW()))=0,"",INDIRECT("G"&ROW())/INDIRECT("E"&ROW())*1000)`.
- A hook that did well (top third of Performance by views or comments per 1k): add it to Hooks with From = the script ID and its likes.
