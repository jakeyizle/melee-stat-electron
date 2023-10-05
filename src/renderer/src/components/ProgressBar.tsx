import LinearProgress from '@mui/joy/LinearProgress';
import Typography from '@mui/joy/Typography';

type ProgressBarProps = {
  currentCount: number,
  maxCount: number
}

export default function ProgressBar({ currentCount, maxCount }: ProgressBarProps) {
  const quotient = currentCount / maxCount || 0;
  const progress = Math.round(quotient * 100)
  return (
    currentCount === maxCount ?
      <></> :
      <LinearProgress
        determinate
        variant="outlined"
        color="primary"
        size="sm"
        thickness={32}
        value={progress}
        sx={{
          '--LinearProgress-radius': '0px',
          '--LinearProgress-progressThickness': '24px',
          boxShadow: 'sm',
          borderColor: 'neutral.500',
        }}
      >
        <Typography
          level="body-xs"
          fontWeight="xl"
          sx={{ mixBlendMode: 'difference' }}
        >
          Loading replays - {currentCount} of {maxCount} ({progress}%)
        </Typography>
      </LinearProgress>
  );
}
