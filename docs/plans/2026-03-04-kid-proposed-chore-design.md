# Kid Proposed Chore Design

Date: 2026-03-04

## Approved Direction

- Extend the existing `ChoreSubmission` flow so the child can submit either:
  - a library-backed chore
  - a proposed chore with a custom name and point value
- Keep one approval queue for parents
- Make `Add to library` an explicit option during parent approval of proposed chores
- If the approved proposed chore matches an existing library chore name, reuse that library chore instead of creating a duplicate

## Product Rules

- A child can propose a new chore even if the parent library is empty
- Proposed chores require:
  - a non-empty name
  - positive points
  - a date that is today or in the past
- Approving a proposed chore always approves the submission itself so the points count for the selected date
- Adding a proposed chore to the library is optional and happens only when the parent selects that option
- Library matching uses a normalized name comparison:
  - trim leading and trailing whitespace
  - compare case-insensitively
- Reusing an existing library chore must not overwrite that chore's default points
- The approved submission keeps its own approved points even when its linked library chore has a different default point value

## Data Model

Update `ChoreSubmission` to support both submission kinds:

```ts
{
  id: string
  kind: 'library' | 'proposed'
  choreId: string | null
  choreName: string
  points: number
  date: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  reviewedAt: string | null
  updatedAt: string
}
```

Notes:

- `library` submissions carry the selected `choreId`
- `proposed` submissions use `choreId: null` until approval optionally links them to an existing or newly created library chore
- Existing month metrics, archive generation, and history logic continue to operate on approved submissions only

## UI Plan

### Child submission dialog

- Keep the current add chore dialog as the single entry point
- Add two modes:
  - `From library`
  - `Propose new`
- `From library` continues to show selectable library chores plus a date picker
- `Propose new` shows:
  - chore name field
  - points field
  - date field
- The dialog should still be usable when no library chores exist by allowing the child to switch to `Propose new`

### Parent approval queue

- Keep one queue in the approvals screen
- Visually distinguish proposed chores from library submissions
- For proposed chores, show an `Add to library` option before approval
- Approval behavior:
  - with `Add to library` enabled:
    - find an existing chore by normalized name
    - reuse it if found
    - otherwise create a new chore using the approved name and points
  - with `Add to library` disabled:
    - approve the submission without changing the library
- Rejection keeps the submission out of totals and leaves the library unchanged

## Implementation Notes

- Add a name normalization helper in the store or domain utility layer so create and approval flows use one rule
- Preserve the current sorting and derived-metrics behavior
- Keep the library CRUD screen parent-managed; the child only proposes chores through submissions
- Consider a lightweight Dexie schema migration so older local data remains readable when `kind` and nullable `choreId` are introduced

## Test Plan

- Child can submit a proposed chore with name, points, and past or current date
- Future dates are rejected for both library and proposed submissions
- Approving a proposed chore without library add counts points but does not create a chore
- Approving a proposed chore with library add creates a chore when no normalized-name match exists
- Approving a proposed chore with library add reuses the existing library chore when the normalized name matches
- Reusing a chore does not overwrite the library chore's default points
- Rejected proposed chores do not affect metrics or the library

## Notes

- No `writing-plans` skill is available in this workspace, so implementation planning will be handled directly in the project.
