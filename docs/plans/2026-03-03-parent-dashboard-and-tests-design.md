# Parent Dashboard And Tests Design

Date: 2026-03-03

## Approved Direction

- Add a dedicated parent dashboard route as the first page after PIN unlock
- Keep approvals as a focused queue screen
- Improve history so it reads like approved-only reporting
- Add tests after the parent dashboard and history work is complete

## Parent Dashboard

- Route: `/parent/dashboard`
- Make this the default parent landing page
- Show:
  - pending submissions count
  - approved points this month
  - current streak
  - points remaining to goal
  - recent approved submissions
  - recent rejected submissions
  - quick actions into approvals, library, history, and settings

## History

- Preserve monthly cards
- Add goal target, bonus points, and stronger status display
- Keep month drilldown into the month detail page
- Make it explicit that history is derived from approved submissions only

## Tests

- Add store/domain tests for:
  - pending submissions not affecting metrics
  - approval affecting metrics
  - rejection not affecting metrics
  - archive/history derived from approved submissions only

## Notes

- No git repository exists in this workspace, so this design document cannot be committed.
