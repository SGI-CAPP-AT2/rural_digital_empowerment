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
                <Route path="/" element={<ClassroomHome />} />
                <Route path="/classroom/:id" element={<Classroom />} />
              </Route>
            </Route>
          </Routes>
        </ProfileProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
