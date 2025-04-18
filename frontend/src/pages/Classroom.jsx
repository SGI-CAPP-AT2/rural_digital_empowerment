import React from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Container,
  Avatar,
} from "@mui/material";
import ClassIcon from "@mui/icons-material/Class";

const dummyAnnouncements = [
  { id: 1, message: "Welcome to the course!", postedBy: "Mr. John Doe" },
  {
    id: 2,
    message: "First assignment will be posted tomorrow.",
    postedBy: "Mr. John Doe",
  },
];

const dummyAssignments = [
  { id: 1, title: "Assignment 1: Algebra Basics", dueDate: "April 25, 2025" },
  { id: 2, title: "Quiz 1: Expressions", dueDate: "April 27, 2025" },
];

const ClassroomHomePage = ({
  course = {
    title: "Math 101",
    description: "Introduction to Algebra",
    teacher: "Mr. John Doe",
  },
}) => {
  return (
    <Container
      maxWidth="lg"
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
        height: "100vh",
        pt: 3,
      }}
    >
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          flexWrap: "wrap",
        }}
      >
        <Avatar sx={{ bgcolor: "white", color: "primary.main" }}>
          <ClassIcon />
        </Avatar>
        <Box>
          <Typography
            variant="h5"
            noWrap
            sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {course.title}
          </Typography>
          <Typography
            variant="body2"
            noWrap
            sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {course.description}
          </Typography>
          <Typography
            variant="caption"
            noWrap
            sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {course.teacher}
          </Typography>
        </Box>
      </Paper>

      {/* Content in Flexbox */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          mt: 3,
        }}
      >
        {/* Announcements */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Announcements
          </Typography>
          <Paper variant="outlined">
            <List disablePadding>
              {dummyAnnouncements.map((a) => (
                <React.Fragment key={a.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Typography
                          noWrap
                          sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                        >
                          {a.message}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                        >
                          Posted by {a.postedBy}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>

        {/* Assignments */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Assignments
          </Typography>
          <Paper variant="outlined">
            <List disablePadding>
              {dummyAssignments.map((a) => (
                <React.Fragment key={a.id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography
                          noWrap
                          sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                        >
                          {a.title}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                        >
                          Due: {a.dueDate}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default ClassroomHomePage;