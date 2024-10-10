# LegacyLens - Legacy Scoring for GitHub Repository

### A browser extension that scores the legacy content of a github repo

This extension provides users information about the legacy state of a gihub repo with two categories of metrics: age and code complexity

## Installation :
Follow the steps below to install the Code Chronicle Chrome extension:

### Step1: Clone the repository:
 ```bash
git clone https://github.com/Chiranjeevi2001/legacylens.git
```
### Step2: Provide the GitHub Personal Token for rate limit extension
1. Create your [personalized fine-grained github token (PAT)](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token). (Leave permissions as default)
2. Paste the token in the RHS of line number 4
   ```JavaScript
   const token = 'PASTE YOUR TOKEN HERE'
   ```
   in `popup.js` file
   
### Step3: Open Chrome Extensions manager
1. Open Google Chrome (or any Chromium-based browser)
2. Navigate to the extensions page by entering `chrome://extensions` in the address bar


### Step4: Enable Developer Mode
In the top right corner, toggle the *Developer Mode* switch to enable it.

### Step5: Load the extension
1. Click the *Load Unpacked* button
2. In the file browser, select the folder where the repository was cloned (it should contain the `manifest.json` file)
3. Click on the pin icon to pin the extension to your browser's toolbar

### Step6: Enjoy the extension!
Navigate to the main page of any GitHub repository, and open the extension to begin the assessment. 


## _Note_
You can customize the weights to each of the metrics! Just open `age_weights.json` and/or `complexity_weights.json` files to configure weights given to each metric. Also, there is an in-built settings option in the extension itself. Adjust the values based on your preference, or leave it be! By doing this, users can define 'LEGACY' according to their own needs!

Feel free to customize the tool and play around
