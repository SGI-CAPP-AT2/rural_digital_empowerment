import { Route, Routes, BrowserRouter } from "react-router-dom";
import RegisterPage from "./pages/Register";
import LoginPage from "./pages/Login";
import { ThemeProvider } from "@mui/material";
import { darkTheme } from "./constants/themes";
import ClassroomHome from "./pages/ClassroomHome";
import Classroom from "./pages/Classroom";
import { ProfileProvider } from "./context/profile.context";
import PrivateRoutes from "./routes/PrivateRoutes";
import PublicRoutes from "./routes/PublicRoutes";
import LoadingRoutes from "./routes/LoadingRoutes";
import CreateRoomPage from "./pages/CreateForm";
import JoinRoomPage from "./pages/JoinRoomPage";
import UploadPostPage from "./pages/UploadPostPage";
import ShareAnnouncement from "./pages/ShareAnnouncement";
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={darkTheme}>
        <ProfileProvider>
          <Routes>
            <Route element={<LoadingRoutes />}>
              <Route element={<PublicRoutes />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>
              <Route element={<PrivateRoutes />}>
                <Route path="/join-room" element={<JoinRoomPage />} />
                <Route path="/create-room" element={<CreateRoomPage />} />
                <Route path="/" element={<ClassroomHome />} />
                <Route path="/classroom/:room" element={<Classroom />} />
                <Route path="/upload-post/:room" element={<UploadPostPage />} />
                <Route
                  path="/share-announcement/:room"
                  element={<ShareAnnouncement />}
                />
              </Route>
            </Route>
          </Routes>
        </ProfileProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
