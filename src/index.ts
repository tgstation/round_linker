import {getInput, setFailed} from '@actions/core'
import {getOctokit, context} from '@actions/github'

async function run(): Promise<void> {
    try {
        // Get issue number of the payload
        const issue_number = context.payload.issue?.number
        if (issue_number == undefined) {
            setFailed('Issue number retrieval failed')
            return
        }

        //get issue body
        let issue_body = context.payload.issue?.body
        if (!issue_body) {
            return
        }

        //modify issue body with round link id
        const re = /(\[?Round ID\]?:\s*)(\d+)/g
        if (issue_body.match(re)) {
            issue_body = issue_body.replace(
                re,
                '$1[$2](https://statbus.space/round/$2)'
            )

            //github client to make requests
            const octokit: ReturnType<typeof getOctokit> = getOctokit(
                getInput('repo-token', {required: true})
            )

            await octokit.rest.issues.update({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: issue_number,
                body: issue_body,
                headers: {
                    'X-GitHub-Api-Version': '2026-03-10'
                }
            })
        }
    } catch (e) {
        setFailed(`Action failed ${e}.`)
    }
}

run()
