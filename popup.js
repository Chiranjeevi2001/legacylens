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
  if(data && data.length!=0 && data[0].updated_at)
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
function daysSince(dateString, referenceDate) {
  const pastDate = new Date(dateString);
  const currentDate = new Date();
  const refDate = new Date(referenceDate);
  const timeDifference = currentDate - pastDate;
  const refDifference = currentDate - refDate;

  const actualDays = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const refDays = Math.floor(refDifference / (1000 * 60 * 60 * 24));
  if(refDays === 0) {
    return 100;
  }
  const score = (actualDays / refDays)*100;
  if(score > 100)
  {
    return 100;
  }
  return score.toFixed(4);
}


// function to calculate scores
function calculateScore(actualVal, referenceVal) {
  const score = (actualVal / referenceVal) * 100;
  if(score > 100) {
    return 100;
  }
  return score.toFixed(4);
};
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


  // reference dates and limits

  const referenceDateInput = document.getElementById('referenceDate');
  const locLimitInput = document.getElementById('locLimit');
  const ccnLimitInput = document.getElementById('ccnLimit');
  const saveSettingsButton = document.getElementById('saveSettings');

  
  if (match) {
    const repoUser = match[3];
    const repoName = match[4];
    infoDiv.innerHTML = `${repoUser}/${repoName}`;

     // load settings from storage
    chrome.storage.sync.get(['referenceDate', 'locLimit', 'ccnLimit'], (settings) => {
      if (settings.referenceDate) referenceDateInput.value = settings.referenceDate;
      if (settings.locLimit) locLimitInput.value = settings.locLimit;
      if (settings.ccnLimit) ccnLimitInput.value = settings.ccnLimit;
    });

  

    saveSettingsButton.addEventListener('click', () => {
      const referenceDate = referenceDateInput.value;
      const locLimit = parseInt(locLimitInput.value, 10);
      const ccnLimit = parseInt(ccnLimitInput.value, 10);

      if (new Date(referenceDate) < new Date('2008-08-01') || new Date(referenceDate) > new Date()) {
        alert('Please enter a valid reference date between August 2008 and the present date.');
        return;
      }
      if (locLimit < 1 || locLimit > Number.MAX_SAFE_INTEGER) {
        alert('Please enter a valid LOC limit between 1 and INT_MAX.');
        return;
      }
      if (ccnLimit < 1 || ccnLimit > 25) {
        alert('Please enter a valid cyclomatic complexity limit between 1 and 25.');
        return;
      }

      chrome.storage.sync.set({ referenceDate, locLimit, ccnLimit }, () => {
        alert('Settings saved successfully!');

        // recalculating scores
        getLatestReleaseDate(repoUser, repoName).then((date) => {
          if(date === undefined) {
            releaseDate.textContent = "NILL";
            return;
          }
          const score = daysSince(date, referenceDate);
          releaseDate.innerHTML = `${score}`;
        });
        getLatestDeploymentDate(repoUser, repoName).then((date) => {
          if(date === undefined) {
            deploymentDate.textContent = "NILL";
            return;
          }
          const score = daysSince(date, referenceDate);
          deploymentDate.innerHTML = `${score}`;
        });
        
        getLatestCommitDate(repoUser, repoName).then((date) => {
          if(date === undefined) {
            commitDate.textContent = "NILL";
            return;
          }
          const score = daysSince(date, referenceDate);
          commitDate.innerHTML = `${score}`;
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
          const score = daysSince(date, referenceDate);
          pullReqDate.innerHTML = `${score}`;
        });
    
        getLastIssueResolvedDate(repoUser, repoName).then((date) => {
          if(date === undefined) {
            issueDate.textContent = "NILL";
            return;
          }
          const score = daysSince(date, referenceDate);
          issueDate.innerHTML = `${score}`;
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
          const score = calculateScore(data.average_loc, locLimit);
          avgLoc.innerHTML = `${score}`; 
        });
    
        get_avg_CCN(repoUser, repoName).then((data) => {
          if(data === undefined) {
            avgCCN.textContent = "NILL";
            return;
          }
          const score = calculateScore(data.avg_complexity, ccnLimit);
          avgCCN.innerHTML = `${score}`;
        });
        
      });
    });


    getLatestReleaseDate(repoUser, repoName).then((date) => {
      if(date === undefined) {
        releaseDate.textContent = "NILL";
        return;
      }
      const score = daysSince(date, referenceDateInput.value);
      releaseDate.innerHTML = `${score}`;
    });
    getLatestDeploymentDate(repoUser, repoName).then((date) => {
      if(date === undefined) {
        deploymentDate.textContent = "NILL";
        return;
      }
      const score = daysSince(date, referenceDateInput.value);
      deploymentDate.innerHTML = `${score}`;
    });
    
    getLatestCommitDate(repoUser, repoName).then((date) => {
      if(date === undefined) {
        commitDate.textContent = "NILL";
        return;
      }
      const score = daysSince(date, referenceDateInput.value);
      commitDate.innerHTML = `${score}`;
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
      const score = daysSince(date, referenceDateInput.value);
      pullReqDate.innerHTML = `${score}`;
    });

    getLastIssueResolvedDate(repoUser, repoName).then((date) => {
      if(date === undefined) {
        issueDate.textContent = "NILL";
        return;
      }
      const score = daysSince(date, referenceDateInput.value);
      issueDate.innerHTML = `${score}`;
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
      const score = calculateScore(data.average_loc, locLimitInput.value);
      avgLoc.innerHTML = `${score}`; 
    });

    get_avg_CCN(repoUser, repoName).then((data) => {
      if(data === undefined) {
        avgCCN.textContent = "NILL";
        return;
      }
      const score = calculateScore(data.avg_complexity, ccnLimitInput.value);
      avgCCN.innerHTML = `${score}`;
    });

  } else {
    const dashboard = document.getElementById('dashboard');
    dashboard.innerHTML = "<h1>Not a valid GitHub repository</h1>";
  }
  
});