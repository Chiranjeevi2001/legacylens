// popup.js
// get the latest release date (if exists)

const token = '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';
async function getLatestReleaseDate(repoUser, repoName) {
  const response = await fetch(`https://api.github.com/repos/${repoUser}/${repoName}/releases/latest`, {
    method: 'GET',
    headers: {
      'Authorization': `token ${token}`
    }
  });
  const data = await response.json();
  if(data && data.published_at)
  {
    return data.published_at;
  }
  return undefined;
};

async function getLatestDeploymentDate(repoUser, repoName) {
  const response = await fetch(`https://api.github.com/repos/${repoUser}/${repoName}/deployments`, {
    method: 'GET',
    headers: {
      'Authorization': `token ${token}`
    }
  });
  const data = await response.json();
  if(data.length!=0 && data[0].updated_at)
  {
    return data[0].updated_at;
  }
  return undefined;
}

// get the latest commit date
async function getLatestCommitDate(repoUser, repoName) {
  const url = `https://api.github.com/repos/${repoUser}/${repoName}/commits`;
  // console.log('Sending request to: ', url);
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `token ${token}`
    }
  })
  const data = await response.json();
  if(data && data[0].commit.author.date === undefined) 
  {
    return undefined; 
  }
  return data[0].commit.author.date;
};

// get the latest pull request accepted

async function getLatestAcceptedPullRequestDate(repoUser, repoName) {

  const url = `https://api.github.com/repos/${repoUser}/${repoName}/pulls?state=closed`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `token ${token}`
    }
  });
  const data = await response.json();
  if(data.length === 0 || data.status === "404" || data[0].merged_at === undefined)  
    {
      return undefined;
    }
  let res = null;
  let i = 0;
  while(i < data.length)
  {
    if(data[i].merged_at !== null)
    {
      res = data[i].merged_at;
      
      break;
    }
    i++;
  }
  return res;
};

// get the last issue resolved date
async function getLastIssueResolvedDate(repoUser, repoName) {

  const url = `https://api.github.com/repos/${repoUser}/${repoName}/issues?state=closed`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `token ${token}`
    }
  });
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
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `token ${token}`
    }
  });
  const data = await response.json();
  if(data.default_branch === undefined)
  {
    return "main";
  }
  return data.default_branch;
};

// get the file count in the repo

async function getAvgLoc(repoUser, repoName) {
  const url = `https://backend-pm23nezy0-chiranjeevi-b-ss-projects.vercel.app/repo_avg_loc?owner=${repoUser}&repo=${repoName}`;
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

async function get_avg_CCN(repoUser, repoName) {
  const url = `https://backend-pm23nezy0-chiranjeevi-b-ss-projects.vercel.app/get_avg_ccn?owner=${repoUser}&repo=${repoName}`;
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
  const deploymentDate = document.getElementById('deploymentDate');
  const commitDate = document.getElementById('commitDate');
  const pullReqDate = document.getElementById('pullRequestDate');
  const issueDate = document.getElementById('lastIssueResolvedDate');
  const avgLoc = document.getElementById('avgLoc');
  const avgCCN = document.getElementById('avgCCN');
  if (match) {
    const repoUser = match[3];
    const repoName = match[4];
    infoDiv.innerHTML = `${repoUser}/${repoName}`;

    getLatestReleaseDate(repoUser, repoName).then((date) => {
      if(date === undefined) {
        releaseDate.textContent = "NILL";
        return;
      }
      const days = daysSince(date);
      releaseDate.innerHTML = `${days}`;
    });
    getLatestDeploymentDate(repoUser, repoName).then((date) => {
      if(date === undefined) {
        deploymentDate.textContent = "NILL";
        return;
      }
      const days = daysSince(date);
      deploymentDate.innerHTML = `${days}`;
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
      console.log("Merged at: ", date);
      if(date === null) {
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
        avgLoc.textContent = "NILL";
        return;
      }
      avgLoc.innerHTML = `${data.average_loc}`; 
    });

    get_avg_CCN(repoUser, repoName).then((data) => {
      if(data === undefined) {
        avgCCN.textContent = "NILL";
        return;
      }
      avgCCN.innerHTML = `${data.avg_complexity}`;
    });

  } else {
    const dashboard = document.getElementById('dashboard');
    dashboard.innerHTML = "<h1>Not a valid GitHub repository</h1>";
  }
  
});