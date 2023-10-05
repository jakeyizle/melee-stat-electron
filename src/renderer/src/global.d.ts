
type LiveAndHistoricalData = {
  liveGame: LiveGame
  games: HistoricalGame[]
}

type LiveGame = {
    players: Player[]
    stage: string
}
type Player = {
  characterId: number,
  connectCode: string,
  displayName: string,
  rankedSeasons: undefined | RankedSeason[]
}

type HistoricalGame = {
  characterId: number,
  connectCode: string,
  dateTime: string,
  gameId: number,
  id: number,
  indexId: number,
  name: string,
  path: string,
  stage: number,
  winner: string
}

type RankedSeason = {
  losses: number
  wins: number
  ratingOrdinal: number
  characters: [{character: string, gameCount: number}]
  season: {name: string, status: string}
}
