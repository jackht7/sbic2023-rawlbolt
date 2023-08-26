import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Badge,
  Box,
  ClickAwayListener,
  IconButton,
  Paper,
  Popper,
  useMediaQuery,
} from '@mui/material';
import { BellOutlined, CloseOutlined } from '@ant-design/icons';

import MainCard from '~/components/MainCard';
import Transitions from '~/components/@extended/Transitions';
import { ThemeType } from '~/themes';
import { useMetaMask } from '~/hooks/useMetaMask';
import { isSupportedNetwork } from '~/lib/networkConfig';
import NotificationList from './NotificationList';

const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem',
};
const actionSX = {
  mt: '6px',
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none',
};
const iconBackColorOpen = 'grey.300';
const iconBackColor = 'grey.100';

const Notification = () => {
  const theme = useTheme() as ThemeType;
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  // TODO: fetch notifications instead of using state
  const [notificationList, setNotificationList] = useState([]);

  // TODO: move to useMetaMask() hook
  const { wallet } = useMetaMask();
  const lineaTestnetId = import.meta.env.VITE_PUBLIC_NETWORK_ID;
  const walletChainSupported = isSupportedNetwork(wallet.chainId);

  const switchNetwork = async () => {
    if (walletChainSupported) return;

    await window.ethereum?.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: lineaTestnetId }],
    });
  };

  // now chainInfo is strongly typed or fallback to linea if not a valid chain
  useEffect(() => {
    if (isSupportedNetwork(wallet.chainId) || wallet.accounts.length == 0) {
      setNotificationList([]);
    } else {
      const [weekday, monthDay, year, hourMin] = new Date()
        .toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        })
        .split(',');

      setNotificationList([
        {
          message: 'Switch to default network LineaGoerli',
          colour: 'error',
          type: 'warn',
          time: `${weekday.trim()}, ${monthDay.trim()} ${year.trim()}, ${hourMin.trim()}`,
          action: switchNetwork,
        },
      ]);
    }
  }, [wallet.chainId]);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };
  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  useEffect(() => {
    if (notificationList.length == 0) setOpen(false);
  }, [notificationList]);

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <IconButton
        disableRipple
        color="secondary"
        sx={{
          color: 'text.primary',
          bgcolor: open ? iconBackColorOpen : iconBackColor,
        }}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        {wallet.accounts.length > 0 && notificationList.length > 0 && (
          <Badge badgeContent={notificationList.length} color="primary">
            <BellOutlined />
          </Badge>
        )}
        {(wallet.accounts.length == 0 || notificationList.length == 0) && (
          <BellOutlined />
        )}
      </IconButton>
      <Popper
        placement={matchesXs ? 'bottom' : 'bottom-end'}
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
                offset: [matchesXs ? -5 : 0, 9],
              },
            },
          ],
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="fade" in={open} {...TransitionProps}>
            <Paper
              sx={{
                boxShadow: theme.customShadows.z1,
                width: '100%',
                minWidth: 285,
                maxWidth: 420,
                [theme.breakpoints.down('md')]: {
                  maxWidth: 285,
                },
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard
                  title="Notification"
                  elevation={0}
                  border={false}
                  content={false}
                  secondary={
                    <IconButton size="small" onClick={handleToggle}>
                      <CloseOutlined />
                    </IconButton>
                  }
                >
                  {notificationList.length > 0 && (
                    <NotificationList
                      items={notificationList}
                    ></NotificationList>
                  )}
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
};

export default Notification;
