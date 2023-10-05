import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { CharacterStrings } from '../constants/meleeIds'
import { getRank } from '../constants/ranks';
type PlayerDisplayProps = {
  connectCode: string,
  characterId: number,
  displayName: string,
  rankedSeasons: undefined | RankedSeason[]
}

export default function PlayerDisplay({connectCode, characterId, displayName, rankedSeasons}: PlayerDisplayProps) {
  const activeSeason = rankedSeasons?.find(x => x.season.status === "ACTIVE")
  const character = CharacterStrings[characterId];
  return (
   <Stack>
    <Typography>{connectCode}</Typography>
    <Typography>{displayName}</Typography>
    <Typography>{character}</Typography>
    {!activeSeason
    ? <Typography>Rating not found</Typography>
    : <Typography>{getRank(activeSeason.ratingOrdinal)} {`(${activeSeason.ratingOrdinal})`} </Typography>}
   </Stack>
  );
}
