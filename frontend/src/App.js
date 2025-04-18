import { Route, Routes, BrowserRouter } from "react-router-dom";
import RegisterPage from "./pages/Register";
import LoginPage from "./pages/Login";
import { ThemeProvider } from "@mui/material";
import { darkTheme } from "./constants/themes";
import ClassroomHome from "./pages/ClassroomHome";
import Classroom from "./pages/Classroom";
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={darkTheme}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/home" element={<ClassroomHome />} />
          <Route path="/classroom/:id" element={<Classroom />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;