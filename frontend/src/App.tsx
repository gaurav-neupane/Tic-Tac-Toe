import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/Home";
import Game from "./pages/Game";
import { Toaster } from "sonner";


function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" theme="dark" />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/game" element={<Game/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
