# Analysis Results Regression Cleanup Plan

> For Hermes: keep this task list in sync with the session todo list. On resume after compaction, read this file first, compare it to `src/components/dashboard/analysis-results.tsx`, and continue from the first unchecked item.

Goal
- Clean up the analysis UI regression by removing noisy or low-value metrics from the video cards/details and removing the made-up channel-level data-quality UI.

Current context / regression notes
- The attached screenshot shows the main clutter problem in the open card details:
  - formula text inside the two large detail cards makes them visually heavy
  - mini-cards include repeated median views
  - comments and comments/1k are showing as null/empty
  - the video-card badge row still includes a comments badge that is always empty
- The code lived primarily in `src/components/dashboard/analysis-results.tsx`, with one correlated leftover in `src/components/dashboard/saved-analyses-panel.tsx` for the saved-snapshot `MIXED` pill.

Code/task correlation
- Badge row to trim:
  - `analysis-results.tsx:330-347`
  - currently renders views, OS, likes/1k, comments/1k
- Detail cards with formula/helper clutter:
  - `analysis-results.tsx:360-378`
  - currently renders helper text like `views ÷ median views` and `likes ÷ views`
- Mini metric grid to trim:
  - `analysis-results.tsx:381-387`
  - currently renders views, median views, likes, likes/1k, comments, comments/1k
- Made-up channel-level data-quality UI:
  - `analysis-results.tsx:13-17` defines `toneForQuality`
  - `analysis-results.tsx:480` renders the `mixed/strong/weak` pill
- Overall channel analytics strip to reconsider:
  - `analysis-results.tsx:489-505`
  - user explicitly wants the data-quality metric removed; keep median views in the header area, but do not re-add repeated/low-value metrics to the per-video cards

Task list
- [x] 1. Save this plan to disk and mirror it in the session todo list
- [x] 2. Remove formula/helper clutter from the two large detail cards
- [x] 3. Remove comments and comments/1k from the mini detail grid
- [x] 4. Remove median views from the mini detail grid
- [x] 5. Remove the comments/comments-per-1k badge from the collapsed video card row
- [x] 6. Remove the overall `mixed` / data-quality pill from the channel header and saved snapshots panel
- [x] 7. Make sure median views remains visible only at the channel/header level, not repeated inside each video detail card
- [x] 8. Run build verification and manually verify the cleaned-up UI against the screenshot regression
- [x] 9. Update both this plan and the session todo list so completed work is checked off or removed

Proposed approach
1. Edit `src/components/dashboard/analysis-results.tsx` only unless inspection proves a supporting helper is now unused.
2. Simplify the card details so the large cards show only labels and values, not explanatory formulas.
3. Remove comments-related UI entirely from the card view because the data is effectively unavailable.
4. Remove the channel data-quality pill and any copy that overstates confidence in that metric.
5. Keep the task list current as each step completes.

Validation
- [x] `npm run build` passes
- [x] Manual verification on a fresh `@AliAbdaal` analysis confirmed:
  - no comments badge on collapsed cards
  - no comments/comments-per-1k mini-cards
  - no median-views mini-card
  - no helper formulas inside the large outlier/engagement detail cards
  - no `mixed`/data-quality pill in the latest-analysis header or saved snapshots panel
  - median views still appears at the channel/header level

Notes for resume after compaction
- First inspect this file and the session todo list.
- Then re-read `src/components/dashboard/analysis-results.tsx` around the correlated line ranges above.
- Resume from the first unchecked task and check off/remove items as they are completed.


Completion notes
- Edited `src/components/dashboard/analysis-results.tsx` to remove formula clutter, comments-related UI, and repeated median-views mini-cards.
- Edited `src/components/dashboard/saved-analyses-panel.tsx` after correlating the codebase and finding the leftover `MIXED` pill there.
- Session todo list should now be cleared because this cleanup pass is complete.
