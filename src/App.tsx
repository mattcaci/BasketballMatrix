import { Navigate, Route, Routes } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { CheckInPage } from './pages/CheckInPage';
import { MatrixPage } from './pages/MatrixPage';
import { RosterPage } from './pages/RosterPage';
import { useAppState } from './storage/AppStateContext';

export default function App() {
  const { loading } = useAppState();

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="app-shell">
      <main>
        <Routes>
          <Route path="/" element={<CheckInPage />} />
          <Route path="/roster" element={<RosterPage />} />
          <Route path="/matrix" element={<MatrixPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <NavBar />
    </div>
  );
}
