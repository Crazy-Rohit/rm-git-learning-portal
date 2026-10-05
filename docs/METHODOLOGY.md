# How stage 1 is checked

This course is a completion record from Rohit Manna. It is not a GitHub certification.

A pass comes from a public repository, not from the handbook exercises. The handbook stores ticks only in the browser.

## Stage 1

The learner opens a Start issue, then a Submit issue, on `Crazy-Rohit/rm-git-learning-portal`. The workflow reads the public repository `USERNAME/git-lab`.

| Check | What must be true |
| --- | --- |
| Repository name | The form says `USERNAME/git-lab` |
| Public | The repository exists and is public |
| Owner | The owner id is the id of the account that opened the issue |
| Template | It was created from `Crazy-Rohit/rm-git-lab-template` |
| Personal code | `.stage/stage-1.txt` matches the code from the Start issue |
| Ignore rule | `.gitignore` has a line that is exactly `*.log` |
| Commits | At least three commits after the start time, linked to that GitHub account |
| README | One of those commits changes `README.md` |

Stages 2 to 7 are not open. Submitting one of them does not pass.

The start time is the clock of the Start workflow. Opening Start again does not move that time. Five Submit issues are allowed per account per day.
