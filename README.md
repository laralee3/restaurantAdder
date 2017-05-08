# restaurantAdder
Interface for quick adding restaurants to a personal project tableau import. Hosted on github pages at [https://laralee3.github.io/restaurantAdder](https://laralee3.github.io/restaurantAdder)

Currently US only. 

### Google API credentials
1) Go to [https://console.developers.google.com/](https://console.developers.google.com/)
2) Make a new project if necessary (any name will do)
3) In the dashboard, select "Enable API"
4) Enable `Google Sheets API`, `Google Places API Web Service`, and `Google Maps JavaScript API`
5) Select the Credentials tab
6) Select `Create Credentials` > `Api Key`
7) Click edit on the newly created Api Key
8) Set Key restriction to `HTTP Referrers` and add `laralee3.github.io/*` for the website, then click save
9) Select `Create Credentials` > `Oauth Client Id`
10) Select `Web Application`
11) For Authorized Javascript origins, set `https://laralee3.github.io` and save
12) Copy the newly created api key and client id key for use in the restaurant adder

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
