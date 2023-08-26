import logo from '~/assets/logo.png';
import { Box } from '@mui/material';

const Logo = () => {
  // const theme = useTheme();

  return (
    <Box
      component="img"
      sx={{
        height: 25,
        width: 25,
        maxHeight: { xs: 233, md: 167 },
        maxWidth: { xs: 350, md: 250 },
      }}
      alt="RawlBolt"
      src={logo}
    />
  );
};

export default Logo;
