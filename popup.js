// get the latest release date (if exists)
async function getLatestReleaseDate(repoUser, repoName) {
  const response = await fetch(`https://api.github.com/repos/${repoUser}/${repoName}/releases/latest`);
  const data = await response.json();
  if(data.published_at)
  {
    return data.published_at;
  }
  return undefined
};

// get the latest commit date
async function getLatestCommitDate(repoUser, repoName) {
  const url = `https://api.github.com/repos/${repoUser}/${repoName}/commits`;
  // console.log('Sending request to: ', url);
  const response = await fetch(url);
  const data = await response.json();
  if(data[0].commit.author.date === undefined) 
  {
    return undefined; 
  }
  return data[0].commit.author.date;
};

// get the latest pull request accepted

async function getLatestAcceptedPullRequestDate(repoUser, repoName) {

  const url = `https://api.github.com/repos/${repoUser}/${repoName}/pulls?state=closed`;
  const response = await fetch(url);
  const data = await response.json();
  if(data.length === 0 || data.status === "404" || data[0].merged_at === undefined)  
    {
      return undefined;
    }
  return data[0].merged_at;
};

// get the last issue resolved date
async function getLastIssueResolvedDate(repoUser, repoName) {

  const url = `https://api.github.com/repos/${repoUser}/${repoName}/issues?state=closed`;
  const response = await fetch(url);
  const data = await response.json();
  if(data.length === 0 || data.status === "404" || data[0].closed_at === undefined) 
    {
      return undefined;
    }
  return data[0].closed_at;
};

// get the default branch of the repo	
async function getDefaultBranch(repoUser, repoName) {
  const url = `https://api.github.com/repos/${repoUser}/${repoName}`;
  const response = await fetch(url);
  const data = await response.json();
  if(data.default_branch === undefined)
  {
    return "main";
  }
  return data.default_branch;
};

// get the file count in the repo

async function getAvgLoc(repoUser, repoName) {
  const url = `https://backend-3tg8kybjc-chiranjeevi-b-ss-projects.vercel.app/repo_avg_loc?owner=${repoUser}&repo=${repoName}`;
  const response = await fetch(url);
  // exception handling
  // if (!response.ok) {
  //   return "Error fetching data";
  // }
  let data;
  try{
      data = await response.json();
      return data;
  }
  catch(e){
      // console.log("Error printing", e);
      return undefined;
  }
};

// function to calculate the number of days since a given date
function daysSince(dateString) {
  const pastDate = new Date(dateString);
  const currentDate = new Date();
  const timeDifference = currentDate - pastDate;

  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  return daysDifference;
}

function isValidJson(jsonString) {
  try {
      JSON.parse(jsonString);
      return true;
  } catch (e) {
      return false;
  }
}




// Request the current tab's URL and check it on popup load
chrome.tabs.query({ active: true, currentWindow: true }, async(tabs) => {
  const url = tabs[0].url;
  const githubRepoRegex = /^(https?:\/\/)?(www\.)?github\.com\/([A-Za-z0-9_-]+)\/([A-Za-z0-9_.-]+)\/?$/;

  const match = url.match(githubRepoRegex);
  const infoDiv = document.getElementById('info');
  const releaseDate = document.getElementById('releaseDate');
  const commitDate = document.getElementById('commitDate');
  const pullReqDate = document.getElementById('pullRequestDate');
  const issueDate = document.getElementById('lastIssueResolvedDate');
  const fileCount = document.getElementById('repoFilesCount');
  const totalLoc = document.getElementById('totalLoc');
  const avgLoc = document.getElementById('avgLoc');
  if (match) {
    const repoUser = match[3];
    const repoName = match[4];
    infoDiv.innerHTML = `${repoUser}/${repoName}`;
    getLatestReleaseDate(repoUser, repoName).then((date) => {
      if(date === undefined) {
        releaseDate.textContent = "NILL";
        return;
      }
      const d = new Date(date);
      const days = daysSince(date);
      releaseDate.innerHTML = `${days}`;
    });

    getLatestCommitDate(repoUser, repoName).then((date) => {
      if(date === undefined) {
        commitDate.textContent = "NILL";
        return;
      }
      const d = new Date(date);
      const days = daysSince(date);
      commitDate.innerHTML = `${days}`;
    });

    getLatestAcceptedPullRequestDate(repoUser, repoName).then((date) => {
      if(date === undefined) {
        pullReqDate.textContent = "NILL";
        return;
      }
      const d = new Date(date);
      const days = daysSince(date);
      pullReqDate.innerHTML = `${days}`;
    });

    getLastIssueResolvedDate(repoUser, repoName).then((date) => {
      if(date === undefined) {
        issueDate.textContent = "NILL";
        return;
      }
      const d = new Date(date);
      const days = daysSince(date);
      issueDate.innerHTML = `${days}`;
    });
    // let defaultBranch = 'main';
    // getDefaultBranch(repoUser, repoName).then((branch) => {
    //   defaultBranch = branch;
    // });
    getAvgLoc(repoUser, repoName).then((data) => {
      if(data === undefined) {
        fileCount.textContent = "Could not fetch files";
        totalLoc.textContent = "";
        avgLoc.textContent = "";
        return;
      }
      fileCount.innerHTML = `${data.file_count}`;
      totalLoc.innerHTML = `${data.total_loc}`;
      avgLoc.innerHTML = `${data.avg_loc}`;
    });

  } else {
    infoDiv.textContent = "Not on a GitHub repo page";
    releaseDate.textContent = "";
    commitDate.textContent = "";
    pullReqDate.textContent = "";
    issueDate.textContent = "";
    fileCount.textContent = "";
    totalLoc.textContent = "";
    avgLoc.textContent = "";
  }
  
});