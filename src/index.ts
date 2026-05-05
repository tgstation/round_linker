import * as core from "@actions/core"
import * as github from "@actions/github"

async function run(): Promise<void> {
    try {
        // Get issue number of the payload
        const issue_number = github.context.payload.issue?.number
        if (!issue_number) {
            core.setFailed("Issue number retrieval failed")
            return
        }

        //github client to make requests
        const octokit: ReturnType<typeof github.getOctokit> = github.getOctokit(
            core.getInput("repo-token", { required: true }),
        )

        //get issue body
        const response = await octokit.rest.issues.get({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: issue_number,
        })
        const issue_body = response.data.body
        if (!issue_body) {
            core.setFailed("Issue body retrieval failed")
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
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                issue_number: issue_number,
                body: new_body,
                headers: {
                    "X-GitHub-Api-Version": "2026-03-10",
                },
            })
        }
    } catch (e) {
        core.setFailed(`Action failed ${e}.`)
    }
}

run()
