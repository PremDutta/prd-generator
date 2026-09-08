import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import NewPrd from "./pages/NewPrd.jsx";
import Library from "./pages/Library.jsx";
import PrdView from "./pages/PrdView.jsx";
import Shared from "./pages/Shared.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/new" element={<NewPrd />} />
          <Route path="/library" element={<Library />} />
          <Route path="/prds/:id" element={<PrdView />} />
          <Route path="/shared/:shareId" element={<Shared />} />
        </Routes>
      </main>
    </div>
  );
}
