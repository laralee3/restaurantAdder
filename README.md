# restaurantAdder
Interface for quick adding restaurants to a personal project tableau import. Hosted on github pages at [https://laralee3.github.io/restaurantAdder](https://laralee3.github.io/restaurantAdder)

Currently US only. 

### Google API credentials
1) Go to [https://console.developers.google.com/](https://console.developers.google.com/)
2) Make a new project; Set any project name, agree/disagree to email updates, agree to the ToS, and select Create
3) In the dashboard, select "Enable API"
4) Enable `Google Sheets API` by searching the api name, selecting it, and selecting “Enable” 
5) Repeat steps 3 and 4 for `Google Maps JavaScript API`
6) Enable `Google Places API Web Service` by going to [https://developers.google.com/places/web-service/](https://developers.google.com/places/web-service/) and selecting “Get a key”, selecting your project, and selecting “Enable”, then finish
7) Confirm that all 3 apis should be now listed in your api manager dashboard
8) Select the Credentials tab
9) An api key should already be created for you as part of step 6. Select the edit icon for the api key
10) Set Key restriction to HTTP Referrers and add `laralee3.github.io/*` for the website, then click save
11) Select `Create Credentials` > `Oauth Client Id`
12) Select “Configure consent screen”
13) Set a product name (could be “restaurant adder” or whatever you wish) and click save
14) You should be back at the “Create client id” screen. Select `Web Application`
15) For Authorized Javascript origins, set `https://laralee3.github.io` and save
16) At the credentials screen, you should now have an api key and an oauth 2.0 client id. Copy the newly created api key and client id key for use in the restaurant adder

### Sheet ID
Target sheet id is required. Find the sheet id by going to the target google sheet, and grabbing the id from the url:
`https://docs.google.com/spreadsheets/d/{sheetId}/edit`

### urlParam shortcut
You can utilize url params to make entering the required api key/oauth client id/sheet id faster. Just append the following to the url:
`?apiKey={apiKey}&oathId={oathClientId}&sheetId={sheetId}`

You can then bookmark it to fill out the form instantly

## Usage
1) On start, enter your api key, client ID, and sheet Id (or utilize the urlparams above for quick access) and submit
2) Authenticate by clicking "Authorize" in the lower right
3) Once authorized, use the search form on the map and find the desired restaurant
4) Once you've found it, click the `Add` button at the bottom to add it to the google sheet
