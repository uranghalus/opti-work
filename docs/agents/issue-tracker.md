# Issue tracker: GitHub Issues

Issues live in repo's GitHub Issues. Use `gh` CLI for all operations.

## Conventions
**Create issue**: `gh issue create --title "..." --body "..."`. Use heredoc multi-line bodies.
- **Read issue**: `gh issue view <number> --comments`, filtering comments `jq` also fetching labels.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` appropriate `--label` `--state` filters.
- **Make an issue sub-issue parent**: `gh issue create --parent <parent> ...`, `gh issue edit <parent> --add-sub-issue <child>` afterwards (`gh` 2.94+). Older `gh`: `gh api --method POST repos/<owner>/<repo>/issues/<parent>/sub_issues -F sub_issue_id=<child-db-id>` (database id, in **Blocking** below).
Without sub-issues, put `Part #<parent>` top child body.
- **Comment on issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

Infer repo `git remote -v`; `gh` does automatically run inside clone.

## Pull requests triage surface
**PRs request surface: no.** _(Set to `yes` if repo treats external PRs feature requests; `/triage` reads flag.)_

If set `yes`, PRs run through same labels states issues, using `gh pr` equivalents:
- **Read PR**: `gh pr view <number> --comments` `gh pr diff <number>` diff.
- **List external PRs triage**: `gh api --paginate 'repos/{owner}/{repo}/pulls?state=open' --jq IN("OWNER","MEMBER","COLLABORATOR") .user.login, [.labels[].name]}'`.
--add-label`/`--remove-label`, GitHub PRs, `#42` 42` 42`. GitHub --comments`.

## Wayfinding operations
Used by `/wayfinder`. **map** single issue **child** issues as tickets.
- **Map**: single issue labelled `wayfinder:map`, holding Notes / Decisions-so-far / Fog body. `gh issue create --label wayfinder:map`.
- **Child ticket**: issue linked map GitHub sub-issue (see **Make issue sub-issue parent**). Where sub-issues aren't enabled, add child task list in map body put `Part of #<map>` top of child body.
Labels: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). Once claimed, ticket assigned driving dev.
- **Blocking**: GitHub's **native issue dependencies**, canonical, UI-visible representation. Add edge `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, where `<blocker-db-id>` blocker's numeric **database id** (`gh api repos/<owner>/<repo>/issues/<n> --jq .id`, _not_ `#number` `node_id`). GitHub reports `issue_dependencies_summary.blocked_by` (open blockers only, live gate). dependencies aren't available, fall back `Blocked by: #<n>, #<n>` line top of child body. ticket unblocked when every blocker closed.
- **Frontier query**: list map's open children (`gh issue list --state open`, scoped map's sub-issues / task list), drop any open blocker (`issue_dependencies_summary.blocked_by 0`, or open issue in `Blocked by` line) or assignee; first in map order wins.
- **Claim**: `gh issue edit <n> --add-assignee @me`, session's first write.
- **Resolve**: `gh issue comment <n> --body "<answer>"`, then `gh issue close <n>`, append context pointer (gist + Decisions-so-far.
