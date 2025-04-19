import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Divider,
  Button,
  ListItemAvatar,
  useMediaQuery,
  CssBaseline,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import ClassIcon from "@mui/icons-material/Class";
import Sidebar from "../components/Sidebar";
import { Logout } from "@mui/icons-material";
import { useProfile } from "../context/profile.context";
import styled from "styled-components";

const Avatar = styled.img`
  height: 30px;
  border-radius: 50%;
  margin: 5px;
`;

const drawerWidth = 240;

const ClassroomHome = ({ classes = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile, signOut } = useProfile();
  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };
  console.log(profile.avatar);

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <CssBaseline />

      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            noWrap
            sx={{ flexGrow: 1, overflow: "hidden", textOverflow: "ellipsis" }}
          >
            My Classrooms
          </Typography>
          <Avatar src={profile.avatar} alt="avatar" />
          <IconButton color="inherit">
            <Logout onClick={signOut} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Mobile Drawer */}
        {isMobile && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
          >
            <Sidebar drawerWidth={drawerWidth} />
          </Drawer>
        )}
        {/* Desktop Static Drawer */}
        {!isMobile && (
          <Drawer
            variant="permanent"
            sx={{
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
              },
            }}
            open
          >
            <Sidebar />
          </Drawer>
        )}
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <List>
          {classes.map((course) => (
            <React.Fragment key={course.id}>
              <ListItem
                alignItems="flex-start"
                secondaryAction={
                  <Button variant="outlined" size="small">
                    Open
                  </Button>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "secondary.main" }}>
                    <ClassIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      noWrap
                      sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                      {course.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                      >
                        {course.description}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                      >
                        {course.teacher}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default ClassroomHome;
