import {Octokit} from '@octokit/core';
// https://github.com/octokit/core.js#readme
export async function getLatestRelease(repoOwner, repoName) {
  const octokit = new Octokit({
      auth: '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'
  })
  
  const resp = await octokit.request(`GET /repos/${repoOwner}/${repoName}/releases/latest`, {
      owner: repoOwner,
      repo: repoName,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
  });
 return resp.data.published_at;
};

getLatestRelease('octokit', 'core.js').then((response) => {
  console.log(response)
});