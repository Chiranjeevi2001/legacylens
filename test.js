const githubRepoRegex = /^(https?:\/\/)?(www\.)?github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)(\/)?$/;

const testUrls = [
    "https://github.com/user/repo",
    "http://github.com/user/repo",
    "www.github.com/user/repo",
    "github.com/user/repo",
    "https://www.youtube.com/watch?v=5fb2aPlgoys",
    "https://github.com/user/repo/",
    "https://github.com/user/repo/extra",
];

testUrls.forEach(url => {
    const match = url.match(githubRepoRegex);
    if (match) {
        console.log(`Matched URL: ${url}`);
        console.log(`User: ${match[3]}`);
        console.log(`Repo: ${match[4]}`);
    } else {
        console.log(`Did not match: ${url}`);
    }
});
