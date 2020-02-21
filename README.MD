# Round ID Linker

Replaces round id's in issue body with links to scrubby.
Accepted round id format :
```
[Round ID]: 1245
```

## Usage

Create a workflow (eg: `.github/workflows/round_linker.yml` see [Creating a Workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file))

### Example workflow

```
name: "Round ID Linker"
on:
  issues:
    types: [opened]

jobs:
  link_rounds:
    runs-on: ubuntu-latest
    steps:
    - uses: tgstation/round_linker@master
      with:
        repo-token: ${{ secrets.GITHUB_TOKEN }}
```

_Note: This grants access to the `GITHUB_TOKEN` so the action can make calls to GitHub's rest API_
