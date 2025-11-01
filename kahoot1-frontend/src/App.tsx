//   import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import Home from './pages/Home';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import AdminDashboard from './pages/AdminDashboard';
// import AdminUpload from './pages/AdminUpload';
// import QuizBuilder from './pages/QuizBuilder';
// import HostControl from './pages/HostControl';
// import PlayerFlow from './pages/PlayerFlow';
// import ProtectedRoute from './components/ProtectedRoute';

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/play/:pin" element={<PlayerFlow />} />
//         <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
//         <Route path="/admin/upload" element={<ProtectedRoute><AdminUpload /></ProtectedRoute>} />
//         <Route path="/admin/quiz/new" element={<ProtectedRoute><QuizBuilder /></ProtectedRoute>} />
//         <Route path="/host/:sessionId" element={<ProtectedRoute><HostControl /></ProtectedRoute>} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;


  import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AdminUpload from './pages/AdminUpload';
import QuizBuilder from './pages/QuizBuilder';
import HostControl from './pages/HostControl';
import PlayerFlow from './pages/PlayerFlow';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/play/:pin" element={<PlayerFlow />} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/upload" element={<ProtectedRoute><AdminUpload /></ProtectedRoute>} />
        <Route path="/admin/quiz/new" element={<ProtectedRoute><QuizBuilder /></ProtectedRoute>} />
        <Route path="/host/:sessionId" element={<ProtectedRoute><HostControl /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
