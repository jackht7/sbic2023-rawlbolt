import PropTypes from 'prop-types';
import { useRef, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useTheme } from '@mui/material/styles';
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  CardContent,
  ClickAwayListener,
  Grid,
  IconButton,
  Paper,
  Popper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import {
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';

import ProfileTab from './ProfileTab';
import SettingTab from './SettingTab';
import MainCard from '~/components/MainCard';
import Transitions from '~/components/@extended/Transitions';
import avatar from '~/assets/avatar.png';
import { useMetaMask } from '~/hooks/useMetaMask';
import { ThemeType } from '~/themes';
import { formatAddress, formatChainAsNum } from '~/utils';

// tab panel wrapper
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
}

async function fetchChainList() {
  return await (await fetch('https://chainid.network/chains.json')).json();
}

const Profile = () => {
  const theme = useTheme() as ThemeType;
  const { wallet, connectMetaMask, terminate, sdk, sdkConnected } =
    useMetaMask();
  const [chainName, setChainName] = useState('');
  const [nativeCurrency, setNativeCurrency] = useState('');

  const formatedAddress = formatAddress(wallet.address);

  useEffect(() => {
    fetchChainList()
      .then((res) => {
        const networkInfo = res.find(
          (metadata) => metadata.chainId == wallet.chainId
        );
        setChainName(networkInfo?.name);
        setNativeCurrency(networkInfo?.nativeCurrency.symbol);
      })
      .catch(console.error);
  }, [wallet.chainId]);

  const handleLogout = async () => {
    // logout
  };

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const iconBackColorOpen = 'grey.300';

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <ButtonBase
        sx={{
          p: 0.25,
          bgcolor: open ? iconBackColorOpen : 'transparent',
          borderRadius: 1,
          '&:hover': { bgcolor: 'secondary.lighter' },
        }}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        {wallet && wallet.accounts.length > 0 && (
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ p: 0.5 }}
          >
            <Avatar alt="profile" src={avatar} sx={{ width: 32, height: 32 }} />
            <Typography variant="subtitle1">{formatedAddress}</Typography>
          </Stack>
        )}
      </ButtonBase>
      {wallet.accounts.length < 1 && (
        <Button variant="contained" onClick={connectMetaMask}>
          Login
        </Button>
      )}
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 9],
              },
            },
          ],
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="fade" in={open} {...TransitionProps}>
            {open && (
              <Paper
                sx={{
                  boxShadow: theme.customShadows.z1,
                  width: 290,
                  minWidth: 240,
                  maxWidth: 290,
                  [theme.breakpoints.down('md')]: {
                    maxWidth: 250,
                  },
                }}
              >
                <ClickAwayListener onClickAway={handleClose}>
                  <MainCard elevation={0} border={false} content={false}>
                    <CardContent sx={{ px: 2.5, pt: 3 }}>
                      <Grid
                        container
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Grid item>
                          <Stack
                            direction="row"
                            spacing={1.25}
                            alignItems="center"
                          >
                            <Avatar
                              alt="profile"
                              src={avatar}
                              sx={{ width: 32, height: 32 }}
                            />
                            <Stack>
                              <Typography variant="h6">
                                {formatedAddress}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {'< '}
                                {chainName}
                                {' >'} {wallet.balance} {nativeCurrency}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Grid>
                        <Grid item>
                          <IconButton
                            size="large"
                            color="secondary"
                            onClick={handleLogout}
                          >
                            <LogoutOutlined />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </CardContent>
                    {open && (
                      <>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                          <Tabs
                            variant="fullWidth"
                            value={value}
                            onChange={handleChange}
                            aria-label="profile tabs"
                          >
                            <Tab
                              sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textTransform: 'capitalize',
                              }}
                              icon={
                                <UserOutlined
                                  style={{
                                    marginBottom: 0,
                                    marginRight: '10px',
                                  }}
                                />
                              }
                              label="Profile"
                              {...a11yProps(0)}
                            />
                            <Tab
                              sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textTransform: 'capitalize',
                              }}
                              icon={
                                <SettingOutlined
                                  style={{
                                    marginBottom: 0,
                                    marginRight: '10px',
                                  }}
                                />
                              }
                              label="Setting"
                              {...a11yProps(1)}
                            />
                          </Tabs>
                        </Box>
                        <TabPanel value={value} index={0} dir={theme.direction}>
                          <ProfileTab handleLogout={handleLogout} />
                        </TabPanel>
                        <TabPanel value={value} index={1} dir={theme.direction}>
                          <SettingTab />
                        </TabPanel>
                      </>
                    )}
                  </MainCard>
                </ClickAwayListener>
              </Paper>
            )}
          </Transitions>
        )}
      </Popper>
    </Box>
  );
};

export default Profile;
