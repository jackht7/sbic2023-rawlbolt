import { LoginOutlined, ProfileOutlined } from '@ant-design/icons';

const icons = {
  LoginOutlined,
  ProfileOutlined,
};

// TODO: set target to true, NavItem will then set target="_blank"
// Opens the linked document in a new window or tab
const pages = {
  id: 'authentication',
  title: 'Authentication',
  type: 'group',
  children: [
    {
      id: 'login',
      title: 'Login',
      type: 'item',
      url: '/login',
      icon: icons.LoginOutlined,
      // target: true,
    },
    {
      id: 'register',
      title: 'Register',
      type: 'item',
      url: '/register',
      icon: icons.ProfileOutlined,
      // target: true,
    },
  ],
};

export default pages;
