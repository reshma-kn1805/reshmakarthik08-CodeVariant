import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AssessmentProvider } from './state/AssessmentContext.jsx';
import { Navbar } from './components/layout/Navbar.jsx';
import { Footer } from './components/layout/Footer.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { AssessPage } from './pages/AssessPage.jsx';
import { VerdictPage } from './pages/VerdictPage.jsx';
import { HistoryPage } from './pages/HistoryPage.jsx';
import { ActionPage } from './pages/ActionPage.jsx';
import { CatalogPage } from './pages/CatalogPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <AssessmentProvider>
      <HashRouter>
        <div className="flex flex-col min-h-screen bg-brand-surface text-ink antialiased">
          <Navbar />
          <main className="flex-1" id="main-content">
            <Routes>
              {/* Core required routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/assess" element={<AssessPage />} />
              <Route path="/verdict" element={<VerdictPage />} />
              <Route path="/verdict/:id" element={<VerdictPage />} />
              <Route path="/history" element={<HistoryPage />} />

              {/* Extended capability routes */}
              <Route path="/action" element={<ActionPage />} />
              <Route path="/explore" element={<CatalogPage />} />

              {/* 404 Page */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </AssessmentProvider>
  );
}
