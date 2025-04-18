import { Route, Routes, BrowserRouter } from "react-router-dom";
import RegisterPage from "./pages/Register";
import LoginPage from "./pages/Login";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
