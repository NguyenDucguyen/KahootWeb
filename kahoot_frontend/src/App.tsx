import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import AdminUpload from './pages/AdminUpload';
import HostControl from './pages/HostControl';
import PlayerFlow from './pages/PlayerFlow';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play/:pin" element={<PlayerFlow />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/upload" element={<AdminUpload />} />
        <Route path="/host/:sessionId" element={<HostControl />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
