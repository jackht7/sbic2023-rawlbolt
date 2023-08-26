import { styled } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';

import { drawerWidth } from '~/lib/themeConfig';

const openedMixin = (theme) => ({
  width: drawerWidth,
  borderRight: `1px solid ${theme.palette.divider}`,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  boxShadow: 'none',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: 0,
  borderRight: 'none',
  boxShadow: theme.customShadows.z1,
});

const MiniDrawerStyled = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ theme; open }>(({ theme, open }) => {
  let mixin;
  if (open) {
    mixin = openedMixin(theme);
  }
  if (!open) {
    mixin = closedMixin(theme);
  }
  return {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...mixin,
    '& .MuiDrawer-paper': mixin,
  };
});

export default MiniDrawerStyled;
