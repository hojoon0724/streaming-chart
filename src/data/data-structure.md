# Latest

## Artists Summary
All artists and their total numbers
```
{
  {
    "artist": str,
    "artistId": str,
    "totalSum": int,
    "totalDailySum": int,
    "totalTracks": int,
    "percentageDistribution": [float, float, float...]
  },
  {
    "artist": str,
    "artistId": str,
    "totalSum": int,
    "totalDailySum": int,
    "totalTracks": int,
    "percentageDistribution": [float, float, float...]
  },
  ...
}
```


## Artists Full Catalog
Individul files for individul artists
All info for all songs in the catalog
```
{
  "artist": str,
  "artistId": str,
  "songs": [
    {
      "trackName": str,
      "trackId": str,
      "total": int,
      "daily": int,
    },
    ...
  ]
}
```