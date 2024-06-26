chrome.runtime.onMessage.addListener((message) => {
  const infoDiv = document.getElementById('info');
  
  if (message.error) {
    infoDiv.textContent = message.error;
  } else {
    infoDiv.textContent = `User: ${message.repoUser}\nRepo: ${message.repoName}`;
  }
});

// Request the current tab's URL and check it on popup load
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const url = tabs[0].url;
  const githubRepoRegex = /^(https?:\/\/)?(www\.)?github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)(\/)?$/;

  const match = url.match(githubRepoRegex);
  const infoDiv = document.getElementById('info');

  if (match) {
    const repoUser = match[3];
    const repoName = match[4];
    infoDiv.textContent = `User: ${repoUser}\nRepo: ${repoName}`;
  } else {
    infoDiv.textContent = "Not on a GitHub repo page";
  }
});