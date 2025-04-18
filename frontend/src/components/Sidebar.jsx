import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";
import SettingsIcon from "@mui/icons-material/Settings";

const Sidebar = ({ drawerWidth }) => (
  <Box sx={{ width: drawerWidth - 1 }}>
    <Toolbar />
    <Divider />
    <List>
      {[
        { text: "All Classes", icon: <InboxIcon /> },
        { text: "Settings", icon: <SettingsIcon /> },
      ].map(({ text, icon }) => (
        <ListItem button key={text}>
          <ListItemIcon>{icon}</ListItemIcon>
          <ListItemText
            primary={
              <Typography
                noWrap
                sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
              >
                {text}
              </Typography>
            }
          />
        </ListItem>
      ))}
    </List>
  </Box>
);
export default Sidebar;
