import {getInput, setFailed} from '@actions/core'
import {getOctokit, context} from '@actions/github'

async function run(): Promise<void> {
    try {
        //get issue number of the payload
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

        //check for regex changes
        let changes = false

        //modify issue body with round link id
        const re = /(\[?Round ID\]?:\s*)(\d+)/g
        if (issue_body.match(re)) {
            issue_body = issue_body.replace(
                re,
                '$1[$2](https://statbus.space/round/$2)'
            )
            changes = true
        }

        //modify issue body with byond client download link
        const ce = /(\[?Client Version\]?:\s*)((\d+)\.(\d+))/g
        if (issue_body.match(ce)) {
            issue_body = issue_body.replace(
                ce,
                '[$1](https://www.byond.com/download/build/$3):' +
                    '[Windows](https://www.byond.com/download/build/$3/$2_byond_setup.zip)' + //windows zip file with installer
                    ',' +
                    '[Linux](https://www.byond.com/download/build/$3/$2_byond_linux.zip)' //linux zip folder
            )
            changes = true
        }

        //no changes
        if (!changes) {
            return
        }

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
    } catch (e) {
        setFailed(`Action failed ${e}.`)
    }
}

run()
