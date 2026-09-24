# UNB-ECE Kanban workflow

All repository changes follow `https://github.com/orgs/UNB-ECE/projects/1`.

- Identify and read the governing issue before implementation.
- Confirm it is on the project and set it to `In progress` when editing starts.
- Treat its acceptance criteria as the definition of done; document approved
  scope changes and create linked issues for deferred work.
- Use an issue branch and a linked draft pull request. Mark it ready and move
  the item to `In review` only after required validation passes.
- Merge wanted changes rather than closing their pull request. Then close the
  issue and confirm the item is `Done`.
- Give subagents the issue number, relevant acceptance criteria, and bounded
  file scope. The parent agent owns GitHub status changes, PR publication,
  merging, and closure unless an exact action is explicitly delegated.
- Record physical UNBdev.board test setup, firmware, revision, expected result,
  and actual result when hardware behavior is part of acceptance.
- Test hardware against a combined revision imported through the normal
  repository URL when separate feature revisions would require manual MakeCode
  dependency pins. A maintainer may formally defer feature-level physical
  criteria to a linked integration-validation issue; keep the feature and its
  documentation explicit that hardware remains unverified.
