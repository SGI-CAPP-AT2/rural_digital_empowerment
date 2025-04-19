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
import { AddCircleOutlineOutlined } from "@mui/icons-material";

const Sidebar = ({ drawerWidth }) => (
  <Box sx={{ width: drawerWidth - 1 }}>
    <Toolbar />
    <Divider />
    <List>
      <ListItem button>
        <ListItemIcon>
          <InboxIcon />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography
              noWrap
              sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
            >
              All Classes
            </Typography>
          }
        />
      </ListItem>
      <ListItem button>
        <ListItemIcon>
          <AddCircleOutlineOutlined />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography
              noWrap
              sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
            >
              Create Classroom
            </Typography>
          }
        />
      </ListItem>
    </List>
  </Box>
);
export default Sidebar;
