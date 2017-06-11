# restaurantAdder
Interface for quick adding restaurants to a personal project tableau import. Hosted on github pages at [https://laralee3.github.io/restaurantAdder](https://laralee3.github.io/restaurantAdder)

Currently US only. 

### Google API credentials
1) Go to [https://console.developers.google.com/](https://console.developers.google.com/)
2) Select the "Select a Project" drop down in the top left
3) Search to find an existing project, or Select the plus (+) icon to create a new project
	a) Enter a name for the new project if creating a new project, then click "Create"
4) Navigate to the Library section using the menu on the left side
5) Select "Sheets API" from the Google Apps API section; you will be taken to the Sheets API Dashboard
6) Click the Enable button at the top of the screen
7) Click the back arrow to navigate back to the API Library
8) Select "Google Maps JavaScript API" from the Google Maps API Section
	a) Repeat steps 6-7
9) Navigate to developers.google.com/places/web-serice
	a) Click Get a Key
	b) Copy API Key to a text file
10) Return to console.developers.google.com
11) Select the Credentials tab
12) Select Create Credentials > Api Key
13) Copy and Paste the API key to a text file for later use
14) Click on Close
15) Click edit on the newly created Api Key
16) Set Key restriction to `HTTP Referrers` 
17) Add laralee3.github.io/* to the Accept requests from these HTTP referrers field
18) Click Save
19) Repeat steps 15 - 18 for all API Keys

20) Select Create Credentials > Oauth Client Id
	a) Configure Consent Screen
	b) Enter a Name for the Application (all other fields can remain blank)
	c) Click Save
21) Select Web Application
22) Enter a Name
23) Set https://laralee3.github.io under Authorized JavaScript origins
24) Click Create
25) Copy the newly created OAuth ID and Client Secret to a text file for later use

### Sheet ID
Target sheet id is required. 

1) Navigate to the target google sheet (i.e. the Restaurants Tab in Google Sheets)
2) Find the target sheet id the id from the url:
	a) https://docs.google.com/spreadsheets/d/{sheetId}/edit
3) Copy the sheet id to a text file

### urlParam shortcut
You can utilize url parameters to make entering the required api key/oauth client id/sheet id faster. 

1)  https://laralee3.github.io/restaurantAdder?apiKey={apiKey}&oathId={oathClientId}&sheetId={sheetId}

2) Bookmark the parameterized url to fill out the form instantly

## Usage
1) On start, enter your api key, client ID, and sheet Id (or utilize the urlparams above for quick access) > Click submit
2) Click the Authorize button in the lower right corner of the map
3) Select your account
4) Click Allow
3) Use the search form on the map to find the desired restaurant
4) Click the `Add`

# Development

## Requirements
- Google account
- git (for Windows, see cmder below)
- [node](https://nodejs.org/en/)

#### Recommended tools
- [Visual Studio Code](https://code.visualstudio.com/) or IDE/editor of choice
	- For VSCode, the ESLint and Debugger for Chrome extensions
- [cmder](http://cmder.net/) (For Windows; will install git to cmder if the full version is used)

## Setup
1) Install git (via cmder or otherwise for Windows) and node
1) In terminal with node installed, run `npm install http-server -g` to install the http-server globally
1) Clone the git project to your local folder: `git clone https://github.com/laralee3/restaurantAdder.git`
1) Navigate to the project folder and run `npm install` to install dependencies
1) Still in the project folder, run: `npm run serve` to serve the project files
1) Open `localhost:8000/index.html` in your browser