import { getInput, setFailed } from "@actions/core";
import { getOctokit, context } from "@actions/github";

async function run() {
  try {
    const token = getInput("repo-token", { required: true });
    const issue_number = getIssueNumber();
    if (!issue_number) {
      setFailed("Issue number retrieval failed");
      return;
    }
    const client = new getOctokit(token);
    const issue_body = await getIssueBody(client, issue_number);
    if (!issue_body) {
      setFailed("Issue body retrieval failed");
      return;
    }
    createLinks(client, issue_number, issue_body);
  } catch (e) {
    setFailed("Action failed.");
  }
}

function getIssueNumber() {
  const issue = context.payload.issue;
  if (!issue) {
    return undefined;
  }
  return issue.number;
}

async function getIssueBody(client, issue_number) {
  const getResponse = await client.issues.get({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issue_number,
  });
  return getResponse.data.body;
}

// Would be less intrusive but more spammy with a comment, undecided.
async function createLinks(client, issue_number, issue_body) {
  let re = /(\[?Round ID\]?:\s*)(\d+)/g;
  if (issue_body.match(re)) {
    const new_body = issue_body.replace(
      re,
      "$1[$2](https://statbus.space/round/$2)",
    );

    const getResponse = await client.issues.update({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issue_number,
      body: new_body,
    });
  }
}

run();
