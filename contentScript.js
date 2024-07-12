( () => {
  // const src = chrome.runtime.getURL('utils/utils.js');
  // const content_script = await import(src);

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const {type, repoUser, repoName} = message;
      if(type === 'NEW')
      {
          // const latestReleaseDate = await content_script.getLatestReleaseDate(repoUser, repoName);
          // latestReleaseDate.then((date) => {
          //  response({date, repoUser, repoName})});
          Response({repoUser, repoName});
      }
  });
  
})();