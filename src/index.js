const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const token = core.getInput("repo-token", { required: true });
    const issue_number = getIssueNumber();
    if (!issue_number) {
      core.setFailed("Issue number retrieval failed");
      return;
    }
    const client = new github.GitHub(token);
    const issue_body = await getIssueBody(client, issue_number)
    if (!issue_body) {
      core.setFailed("Issue body retrieval failed");
      return;
    }
    createLinks(client, issue_number, issue_body)
  }
  catch (e) {
    core.setFailed("Action failed.");
  }

}

function getIssueNumber() {
  const issue = github.context.payload.issue;
  if (!issue) {
    return undefined;
  }
  return issue.number;
}

async function getIssueBody(client, issue_number) {
  const getResponse = await client.issues.get({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: issue_number
  });
  return getResponse.data.body
}

// Would be less intrusive but more spammy with a comment, undecided.
async function createLinks(client, issue_number, issue_body) {
  let re = /(\[Round ID\]: )(\d+)/g
  if(issue_body.match(re))
  {
    const new_body = issue_body.replace(re, "$1[$2](https://scrubby.melonmesa.com/round/$2)");

    const getResponse = await client.issues.update({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: issue_number,
      body: new_body
    });
  }
}

run();