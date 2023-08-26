import { Button, CardMedia, Link, Stack, Typography } from '@mui/material';

import MainCard from '~/components/MainCard';

import avatar from '~/assets/avatar.png';

// TODO: change href
const NavCard = () => (
  <MainCard sx={{ bgcolor: 'grey.50', m: 3 }}>
    <Stack alignItems="center" spacing={2.5}>
      <CardMedia component="img" image={avatar} sx={{ width: 112 }} />
      <Stack alignItems="center">
        <Typography variant="h5">RawlBolt</Typography>
        <Typography variant="h6" color="secondary">
          Checkout pro features
        </Typography>
      </Stack>
      <Button
        component={Link}
        target="_self"
        href="/"
        variant="contained"
        color="success"
        size="small"
      >
        Pro
      </Button>
    </Stack>
  </MainCard>
);

export default NavCard;
