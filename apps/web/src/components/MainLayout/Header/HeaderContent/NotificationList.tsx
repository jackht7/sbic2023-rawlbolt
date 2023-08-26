import {
  GiftOutlined,
  MessageOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Divider,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from '@mui/material';

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

type NotificationItem = {
  message: string;
  colour: string;
  type: string;
  time: string;
  action: () => void;
};

const icon = (type) => {
  switch (type) {
    case 'warn':
      return <SettingOutlined />;
    default:
      return <MessageOutlined />;
  }
};

const NotificationList = ({ items }: { items: Array<NotificationItem> }) => {
  return (
    <List
      component="nav"
      sx={{
        p: 0,
        '& .MuiListItemButton-root': {
          py: 0.5,
          '& .MuiAvatar-root': avatarSX,
          '& .MuiListItemSecondaryAction-root': {
            ...actionSX,
            position: 'relative',
          },
        },
      }}
    >
      {items.map((item, index) => (
        <div key={index}>
          <ListItemButton onClick={item.action}>
            <ListItemAvatar>
              <Avatar
                sx={{
                  color: `${item.colour}.main`,
                  bgcolor: `${item.colour}.lighter`,
                }}
              >
                {icon(item.type)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={<Typography variant="h6">{item.message}</Typography>}
              secondary={item.time}
            />
          </ListItemButton>
          <Divider />
        </div>
      ))}

      {items.length > 0 && (
        <ListItemButton sx={{ textAlign: 'center', py: `${12}px !important` }}>
          <ListItemText
            primary={
              <Typography variant="h6" color="primary">
                View All
              </Typography>
            }
          />
        </ListItemButton>
      )}
    </List>
  );
};

export default NotificationList;
