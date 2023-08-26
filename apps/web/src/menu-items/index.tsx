import pages from './pages';
import dashboard from './dashboard';

export type MenuType = {
  id: string;
  title: string;
  type: string;
  children: Array<any>;
};

const menuItems = {
  items: [dashboard, pages],
};

export default menuItems;
