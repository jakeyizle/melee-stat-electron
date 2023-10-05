import Table from '@mui/joy/Table';
import { STAGES } from '../constants/meleeIds';
import Typography from '@mui/joy/Typography';

type HistoricalGameTableProps = {
  games: HistoricalGame[]
}

export default function HistoricalGameTable({ games }: HistoricalGameTableProps) {
  //2023-08-24T02:22:50Z
  games = games.sort(((a,b) => {
    const a_date: any = new Date(a.dateTime);
    const b_date: any = new Date(b.dateTime);
    return b_date - a_date
  })).map(x=> {
    const dateTime = new Date(x.dateTime);
    x.dateTime = dateTime.toLocaleString();
    return x;
  })
  function renderRows() {
    return games.map((game, index) => {
      return (<tr key={'rows' + index}>
        <td key={'date' + index}><Typography>{game.dateTime}</Typography></td>
        <td key={'winner' + index}><Typography>{game.winner}</Typography></td>
        <td key={'stage' + index}><Typography>{STAGES.find(x => x.id === game.stage)?.stageSlug}</Typography></td>
      </tr>)
    })
  }
  return (
    <>
      <Table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Winner</th>
            <th>Stage</th>
          </tr>
        </thead>
        <tbody>
          {renderRows()}
        </tbody>
      </Table>
    </>
  );
}
