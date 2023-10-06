import { useEffect, useState } from 'react'
import ProgressBar from './components/ProgressBar'
import Stack from '@mui/joy/Stack'
import PlayerDisplay from './components/PlayerDisplay'
import Divider from '@mui/joy/Divider'
import Typography from '@mui/joy/Typography'
import HistoricalGameTable from './components/HistoricalGameTable'
import Grid from '@mui/joy/Grid'
// Easiest way to declare a Function Component; return type is inferred.
type AppProps = {}

export const App = ({}: AppProps) => {
  const [currentCount, setLoadCount] = useState(0)
  const [maxCount, setMaxCount] = useState(0)
  const [liveGame, setLiveGame] = useState<LiveGame>()
  const [games, setGames] = useState<HistoricalGame[]>()

  useEffect(() => {
    window.api.listenForGameLoad((currentCount: number, maxCount: number) => {
      console.log(currentCount, maxCount)
      setLoadCount(currentCount)
      setMaxCount(maxCount)
    })
    return () => {
      window.api.removeListener('database-game-loaded')
    }
  }, [])

  useEffect(() => {
    window.api.listenForLiveReplay((liveGame: LiveGame, games: HistoricalGame[]) => {
      setLiveGame(liveGame)
      setGames(games)
    })
    return () => {
      window.api.removeListener('live-replay-loaded')
    }
  }, [])

  function renderLiveGame() {
    if (!liveGame) {
      return
    }
    const playerJsx = liveGame.players.map((player: any) => {
      return (
        <PlayerDisplay
          key={player.connectCode}
          connectCode={player.connectCode}
          displayName={player.displayName}
          characterId={player.characterId}
          rankedSeasons={player.rankedSeasons}
        ></PlayerDisplay>
      )
    })
    // const elm = (<Typography key="vs"> VS. </Typography>)
    const elm = (
      <Divider orientation="vertical" key="vs">
        vs
      </Divider>
    )
    playerJsx.splice(1, 0, elm)
    return playerJsx
  }

  function renderHistoricalGames() {
    if (!games) return
    return (
      <>
        <br />
        <Divider>
          <Typography>Game History</Typography>
        </Divider>
        <HistoricalGameTable games={games} />
      </>
    )
  }
  return (
    <>
      <ProgressBar {...{ currentCount, maxCount }}></ProgressBar>
      {!liveGame ? (
        <Typography>Waiting for game...</Typography>
      ) : (
        <>
          <Grid container spacing={0}>
            <Grid xs={12}></Grid>
            <Grid xs={12} justifyContent={'center'} alignItems={'center'} textAlign={'center'}>
              <Typography level="title-lg">Current Game</Typography>
            </Grid>
            <Grid>
              <Stack justifyContent={'space-between'}>
                <Stack direction="row" justifyContent={'space-between'}>
                  {renderLiveGame()}
                </Stack>
                {renderHistoricalGames()}
              </Stack>
            </Grid>
          </Grid>
        </>
      )}
    </>
  )
}

export default App
