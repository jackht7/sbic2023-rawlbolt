import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  openItem: ['dashboard'],
  defaultId: 'dashboard',
  openComponent: 'buttons',
  drawerOpen: false,
  componentDrawerOpen: true,
};

const menu = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    activeItem(
      state: { openItem: any },
      action: { payload: { openItem: any } }
    ) {
      state.openItem = action.payload.openItem;
    },

    activeComponent(
      state: { openComponent: any },
      action: { payload: { openComponent: any } }
    ) {
      state.openComponent = action.payload.openComponent;
    },

    openDrawer(
      state: { drawerOpen: any },
      action: { payload: { drawerOpen: any } }
    ) {
      state.drawerOpen = action.payload.drawerOpen;
    },

    openComponentDrawer(
      state: { componentDrawerOpen: any },
      action: { payload: { componentDrawerOpen: any } }
    ) {
      state.componentDrawerOpen = action.payload.componentDrawerOpen;
    },
  },
});

export default menu.reducer;

export const { activeItem, activeComponent, openDrawer, openComponentDrawer } =
  menu.actions;
