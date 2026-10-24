import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AssessmentProvider } from './state/AssessmentContext.jsx';
import { Navbar } from './components/layout/Navbar.jsx';
import { Footer } from './components/layout/Footer.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { AssessPage } from './pages/AssessPage.jsx';
import { VerdictPage } from './pages/VerdictPage.jsx';
import { ActionPage } from './pages/ActionPage.jsx';
import { CatalogPage } from './pages/CatalogPage.jsx';

export default function App() {
  return (
    <AssessmentProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-brand-surface text-ink antialiased">
          <Navbar />
          <main className="flex-1" id="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/assess" element={<AssessPage />} />
              <Route path="/verdict" element={<VerdictPage />} />
              <Route path="/action" element={<ActionPage />} />
              <Route path="/explore" element={<CatalogPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AssessmentProvider>
  );
}
