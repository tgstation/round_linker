import { getInput, setFailed } from "@actions/core"
import { getOctokit, context } from "@actions/github"

async function run(): Promise<void> {
  try {
    // Get issue number of the payload
    const issue_number = context.payload.issue?.number
    if (!issue_number) {
      setFailed("Issue number retrieval failed")
      return
    }

    //github client to make requests
    const octokit: ReturnType<typeof getOctokit> = getOctokit(getInput("repo-token", { required: true }))

    //get issue body
    const response = await octokit.rest.issues.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issue_number,
    })
    const issue_body = response.data.body
    if (!issue_body) {
      setFailed("Issue body retrieval failed")
      return
    }

    //modify issue body with round link id
    const re = /(\[?Round ID\]?:\s*)(\d+)/g
    if (issue_body.match(re)) {
      const new_body = issue_body.replace(
        re,
        "$1[$2](https://statbus.space/round/$2)",
      )

      await octokit.rest.issues.update({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issue_number,
        body: new_body,
      })
    }
  } catch (e) {
    setFailed(`Action failed ${e}.`)
  }
}

run()
