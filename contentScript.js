const githubRepoRegex = /^(https?:\/\/)?(www\.)?github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)(\/)?$/;

const url = window.location.href;
const match = url.match(githubRepoRegex);

if (match) {
  const repoUser = match[3];
  const repoName = match[4];
  chrome.runtime.sendMessage({ repoUser, repoName });
} else {
  chrome.runtime.sendMessage({ error: "Not on a GitHub repo page" });
}
