import { Grid, Typography } from '@mui/material';

import MainCard from '~/components/MainCard';
import ReportsTable from '../dashboard/ReportsTable';

// only show recent reports
const Reports = () => {
  return (
    <Grid item xs={12} md={10} lg={10}>
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid item>
          <Typography variant="h5">Recent Reports</Typography>
        </Grid>
        <Grid item />
      </Grid>
      <MainCard sx={{ mt: 2 }} content={false}>
        <ReportsTable collection={null} />
      </MainCard>
    </Grid>
  );
};

export default Reports;
