import { lazy } from 'react';

import Loader from '~/components/Loader/Loader';
import MainLayout from '~/components/MainLayout';

const DashboardDefault = Loader(lazy(() => import('~/pages/dashboard')));
const ReportsDefault = Loader(lazy(() => import('~/pages/reports')));

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />,
    },
    {
      path: 'dashboard',
      element: <ReportsDefault />,
    },
  ],
};

export default MainRoutes;
