# restaurantAdder
Interface for quick adding restaurants to a personal project tableau import. 

Currently US only. 

## Google API credentials
1) Go to [https://console.developers.google.com/](https://console.developers.google.com/)
2) (fill in oauth and api key setup here)

## Sheet ID
Target sheet id is required. Find the sheet id by going to the target google sheet, and grabbing the id from the url:
`https://docs.google.com/spreadsheets/d/{sheetId}/edit`

## urlParam shortcut
You can utilize url params to make entering the required api key/oauth client id/sheet id faster; you can also bookmark it. Just append the following to the url:
`?apiKey={apiKey}&oathId={oathClientId}&sheetId={sheetId}`