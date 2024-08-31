// popup.js
// get the latest release date (if exists)

const token = '';
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
  const url = `https://backend-8bl53qh53-chiranjeevi-b-ss-projects.vercel.app/repo_avg_loc?owner=${repoUser}&repo=${repoName}`;
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
  const url = `https://backend-8bl53qh53-chiranjeevi-b-ss-projects.vercel.app/get_avg_ccn?owner=${repoUser}&repo=${repoName}`;
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
  return score.toFixed(2);
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

// function to fill the circular progress bar

function calculateFinalScore(scores) {
  let finalScore = 0;
  for (let key in scores) {
    
    console.log(key, scores[key]);
    if(scores[key] !== 0 && scores[key] !== NaN) {
      finalScore += parseInt(scores[key]);
    }
  }
  return (finalScore/100)*100;
}

function setProgress(percent) {
    const circle = document.querySelector('.progress-ring__circle');
    const progressText = document.querySelector('.progress-ring__text');
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    const offset = circumference - (percent / 100 * circumference);
    circle.style.strokeDashoffset = offset;

    progressText.textContent = `${percent.toFixed(2)}%`;
}

// function to fill the individual progress bars
function setProgressBars(scores, weights, releaseDateProgressBar, deploymentDateProgressBar, commitDateProgressBar, pullReqDateProgressBar, issueDateProgressBar, avgLocProgressBar, avgCCNProgressBar) {
  for(let key in scores) {
      switch(key) {
        case 'releaseDate':
          let value1 = scores[key];
          if(weights !== undefined && "releaseWeight" in weights) {
            value1 /= weights.releaseWeight;
          }
          fillProgressBar(value1, releaseDateProgressBar);
          break;
        case 'deploymentDate':
          let value2 = scores[key];
          if(weights !== undefined && "deploymentWeight" in weights) {
            value2 /= weights.deploymentWeight;
          }
          fillProgressBar(value2, deploymentDateProgressBar);
          break;
        case 'commitDate':
          let value3 = scores[key];
          if(weights !== undefined && "commitWeight" in weights) {
            value3 /= weights.commitWeight;
          }
          fillProgressBar(value3, commitDateProgressBar);
          break;
        case 'pullReqDate':
          let value4 = scores[key];
          if(weights !== undefined && "pullRequestWeight" in weights) {
            value4 /= weights.pullRequestWeight;
          }
          fillProgressBar(value4, pullReqDateProgressBar);
          break;
        case 'issueDate':
          let value5 = scores[key];
          if(weights !== undefined && "issueWeight" in weights) {
            value5 /= weights.issueWeight;
          }
          fillProgressBar(value5, issueDateProgressBar);
          break;
        case 'avgLoc':
          let value6 = scores[key];
          if(weights !== undefined && "locWeight" in weights) {
            value6 /= weights.locWeight;
          }
          fillProgressBar(value6, avgLocProgressBar);
          break;
        case 'avgCCN':
          let value7 = scores[key];
          if(weights !== undefined && "ccnWeight" in weights) {
            value7 /= weights.ccnWeight;
          }
          fillProgressBar(value7, avgCCNProgressBar);
          break;
        default: console.log("Invalid key");
    }
  }
}

function fillProgressBar(value, element)
{ 
  const v = parseFloat(value).toFixed(2);
  value = String(v);
  element.style.setProperty('--width', v);
  element.setAttribute('data-label', value+"%");
}

// get the weights of the metrics

// Request the current tab's URL and check it on popup load
chrome.tabs.query({ active: true, currentWindow: true }, async(tabs) => {
  const url = tabs[0].url;
  const githubRepoRegex = /^(https?:\/\/)?(www\.)?github\.com\/([A-Za-z0-9_-]+)\/([A-Za-z0-9_.-]+)\/?$/;

  const match = url.match(githubRepoRegex);
  const infoDiv = document.getElementById('info');
  // const releaseDate = document.getElementById('releaseDate');
  const releaseDateProgressBar = document.getElementById('releaseDateProgressBar');
  // const deploymentDate = document.getElementById('deploymentDate');
  const deploymentDateProgressBar = document.getElementById('deploymentDateProgressBar');
  // const commitDate = document.getElementById('commitDate');
  const commitDateProgressBar = document.getElementById('commitDateProgressBar');
  // const pullReqDate = document.getElementById('pullRequestDate');
  const pullReqDateProgressBar = document.getElementById('pullRequestDateProgressBar');
  // const issueDate = document.getElementById('lastIssueResolvedDate');
  const issueDateProgressBar = document.getElementById('lastIssueResolvedDateProgressBar');
  // const avgLoc = document.getElementById('avgLoc');
  const avgLocProgressBar = document.getElementById('avgLocProgressBar');
  // const avgCCN = document.getElementById('avgCCN');
  const avgCCNProgressBar = document.getElementById('avgCCNProgressBar');


  // reference dates and limits

  const referenceDateInput = document.getElementById('referenceDate');
  const locLimitInput = document.getElementById('locLimit');
  const ccnLimitInput = document.getElementById('ccnLimit');
  const saveSettingsButton = document.getElementById('saveSettings');

  // progress circle

  
  if (match) {
    const repoUser = match[3];
    const repoName = match[4];
    infoDiv.innerHTML = `${repoUser}/${repoName}`;

    // read the weights

    let weights;
    fetch(chrome.runtime.getURL('weights.json'))
      .then(response => response.json())
      .then(data => {
        weights = data;
        console.log(weights);
      })
      .catch(error => {
        console.log("Could not fetch weights");
        weights = {"error": error}
      });
      let total = 0;
      for(let key in weights) {
        if(key !== "error") {
          if(weights[key] > 1) {
            weights[key] = 1;
          }
          total += weights[key];
        }
      }
      // normalize the weights if they don't sum up to 1
      if(total !== 1) {
        for(let key in weights) {
          if(key !== "error") {
            weights[key] /= total;
          }
        }
      }

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
        let scores = {};
        const promises = [
          getLatestReleaseDate(repoUser, repoName).then((date) => {
            if(date === undefined) {
              // releaseDate.innerHTML = "NILL";
              scores['releaseDate'] = 0;
              return;
            }
            const score = daysSince(date, referenceDate);
            scores['releaseDate'] = score; 
            if("releaseWeight" in weights) {
              scores["releaseDate"] *= weights.releaseWeight;
            }
          }),
          getLatestDeploymentDate(repoUser, repoName).then((date) => {
            if(date === undefined) {
              // deploymentDate.innerHTML = "NILL";
              scores['deploymentDate'] = 0;
              return;
            }
            const score = daysSince(date, referenceDate);
            scores['deploymentDate'] = score;
            if("deploymentWeight" in weights) {
              scores["deploymentDate"] *= weights.deploymentWeight;
            }
          }),
          
          getLatestCommitDate(repoUser, repoName).then((date) => {
            if(date === undefined) {
              // commitDate.innerHTML = "NILL";
              scores['commitDate'] = 0;
              return;
            }
            const score = daysSince(date, referenceDate);
            scores['commitDate'] = score;
            if("commitWeight" in weights) {
              scores["commitDate"] *= weights.commitWeight;
            }
          }),
      
          getLatestAcceptedPullRequestDate(repoUser, repoName).then((date) => {
            if(date === undefined) {
              // pullReqDate.innerHTML = "NILL";
              scores['pullReqDate'] = 0;
              return;
            }
            console.log("Merged at: ", date);
            if(date === null) {
              // pullReqDate.innerHTML = "NILL";
              scores['pullReqDate'] = 0;
              return;
            }
            const score = daysSince(date, referenceDate);
            scores['pullReqDate'] = score;
            if("pullRequestWeight" in weights) {
              scores["pullReqDate"] *= weights.pullRequestWeight;
            }
          }),
      
          getLastIssueResolvedDate(repoUser, repoName).then((date) => {
            if(date === undefined) {
              // issueDate.innerHTML = "NILL";
              scores['issueDate'] = 0;
              return;
            }
            const score = daysSince(date, referenceDate);
            scores['issueDate'] = score;
            if("issueWeight" in weights) {
              scores["issueDate"] *= weights.issueWeight;
            }
          }),
          // let defaultBranch = 'main';
          // getDefaultBranch(repoUser, repoName).then((branch) => {
          //   defaultBranch = branch;
          // });
          getAvgLoc(repoUser, repoName).then((data) => {
            if(data === undefined || data.average_loc === NaN) {
              // avgLoc.innerHTML = "NILL";
              scores['avgLoc'] = 0;
              return;
            }
            const score = calculateScore(data.average_loc, locLimit);
            if(score === NaN) {
              // avgLoc.innerHTML = "NILL";
              scores['avgLoc'] = 0;
              return;
            }
            scores['avgLoc'] = score; 
            if("locWeight" in weights) {
              scores["avgLoc"] *= weights.locWeight;
            }
          }),
      
          get_avg_CCN(repoUser, repoName).then((data) => {
            if(data === undefined) {
              // avgCCN.innerHTML = "NILL";
              scores['avgCCN'] = 0;
              return;
            }
            const score = calculateScore(data.avg_complexity, ccnLimit);
            if(score === NaN) {
              // avgCCN.innerHTML = "NILL";
              scores['avgCCN'] = 0;
              return;
            }
            scores['avgCCN'] = score;
            if("ccnWeight" in weights) {
              scores["avgCCN"] *= weights.ccnWeight;
            }
          })
      ];
      Promise.all(promises).then(() => {
        const progressValue = calculateFinalScore(scores);
        setProgress(progressValue);
        setProgressBars(scores, weights, releaseDateProgressBar, deploymentDateProgressBar, commitDateProgressBar, pullReqDateProgressBar, issueDateProgressBar, avgLocProgressBar, avgCCNProgressBar);
      });
    });
  });
    // put all scores in an object
    let scores = {};
    const promises = [
      getLatestReleaseDate(repoUser, repoName).then((date) => {
        if(date === undefined) {
          // releaseDate.innerHTML = "NILL";
          scores['releaseDate'] = 0;
          return;
        }
        const score = daysSince(date, referenceDateInput.value);
        scores['releaseDate'] = score;
        if("releaseWeight" in weights) {
          scores["releaseDate"] *= weights.releaseWeight;
        }
      }),
      getLatestDeploymentDate(repoUser, repoName).then((date) => {
        if(date === undefined) {
          // deploymentDate.innerHTML = "NILL";
          scores['deploymentDate'] = 0;
          return;
        }
        const score = daysSince(date, referenceDateInput.value);
        scores['deploymentDate'] = score;
        if("deploymentWeight" in weights) {
          scores["deploymentDate"] *= weights.deploymentWeight;
        }
      }),
      
      getLatestCommitDate(repoUser, repoName).then((date) => {
        if(date === undefined) {
          // commitDate.innerHTML = "NILL";
          scores['commitDate'] = 0;
          return;
        }
        const score = daysSince(date, referenceDateInput.value);
        scores['commitDate'] = score;
        if("commitWeight" in weights) {
          scores["commitDate"] *= weights.commitWeight;
        }
      }),

      getLatestAcceptedPullRequestDate(repoUser, repoName).then((date) => {
        if(date === undefined) {
          // pullReqDate.innerHTML = "NILL";
          scores['pullReqDate'] = 0;
          return;
        }
        console.log("Merged at: ", date);
        if(date === null) {
          // pullReqDate.innerHTML = "NILL";
          scores['pullReqDate'] = 0;
          return;
        }
        const score = daysSince(date, referenceDateInput.value);
        scores['pullReqDate'] = score;
        if("pullRequestWeight" in weights) {
          scores["pullReqDate"] *= weights.pullRequestWeight;
        }
      }),

      getLastIssueResolvedDate(repoUser, repoName).then((date) => {
        if(date === undefined) {
          // issueDate.innerHTML = "NILL";
          scores['issueDate'] = 0;
          return;
        }
        const score = daysSince(date, referenceDateInput.value);
        scores['issueDate'] = score;
        if("issueWeight" in weights) {
          scores["issueDate"] *= weights.issueWeight;
        }
      }),
      // let defaultBranch = 'main';
      // getDefaultBranch(repoUser, repoName).then((branch) => {
      //   defaultBranch = branch;
      // });
      getAvgLoc(repoUser, repoName).then((data) => {
        if(data === undefined || data.average_loc === undefined) {
          // avgLoc.innerHTML = "NILL";
          scores['avgLoc'] = 0;
          return;
        }
        const score = calculateScore(data.average_loc, locLimitInput.value);
        if(score === NaN) {
          // avgLoc.innerHTML = "NILL";
          scores['avgLoc'] = 0;
          return;
        }
        scores['avgLoc'] = score;
        if("locWeight" in weights) {
          scores["avgLoc"] *= weights.locWeight;
        }
      }),

      get_avg_CCN(repoUser, repoName).then((data) => {
        if(data === undefined || data.avg_complexity === undefined) {
          // avgCCN.innerHTML = "NILL";
          scores['avgCCN'] = 0;
          return;
        }
        const score = calculateScore(data.avg_complexity, ccnLimitInput.value);
        scores['avgCCN'] = score;
        if("ccnWeight" in weights) {
          scores["avgCCN"] *= weights.ccnWeight;
        }
      })
    ]; 
    // fill the circle

    Promise.all(promises).then(() => {
      const progressValue = calculateFinalScore(scores);
      setProgress(progressValue);
      setProgressBars(scores, weights, releaseDateProgressBar, deploymentDateProgressBar, commitDateProgressBar, pullReqDateProgressBar, issueDateProgressBar, avgLocProgressBar, avgCCNProgressBar);
    });
   
  } 
  else {
    const dashboard = document.getElementById('dashboard');
    dashboard.innerHTML = "<h1>Not a valid GitHub repository</h1>";
  }
  
});