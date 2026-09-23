import React, { useState } from 'react';
import { NavigationTab, Major } from './types';
import { useAppRouter, resolvePath } from './lib/router';
import { PublicLayout } from './layouts/PublicLayout';
import { HomePage } from './pages/HomePage';
import { MajorOrientationPage } from './pages/MajorOrientationPage';
import { ScoreLookupPage } from './pages/ScoreLookupPage';
import { AdmissionPredictorPage } from './pages/AdmissionPredictorPage';
import { ScoreDistributionPage } from './pages/ScoreDistributionPage';
import { AdmissionGuidePage } from './pages/AdmissionGuidePage';
import { UserMailboxPage } from './pages/UserMailboxPage';

// Admin area & Auth
import { AdminAuthProvider } from './admin/auth/AdminAuthContext';
import { AdminArea } from './admin/AdminArea';

export default function App() {
  const { isAdmin, adminSubRoute, publicSubRoute, navigate } = useAppRouter();
  const [modalMajor, setModalMajor] = useState<Major | null>(null);

  const handleSelectTab = (tab: NavigationTab | string) => {
    navigate(resolvePath(tab));
  };

  const handleViewMajor = (major: Major) => {
    setModalMajor(major);
  };

  const handleSelectMajorForPrediction = (majorIds: string | string[], filters?: { programType?: string; admissionForm?: string; combination?: string }) => {
    const ids = Array.from(new Set((Array.isArray(majorIds) ? majorIds : [majorIds]).filter(Boolean)));
    const params = new URLSearchParams();
    if (ids.length > 0) params.set('ma_nganh', ids.join(','));
    if (filters?.programType) params.set('he_dao_tao', filters.programType);
    if (filters?.admissionForm) params.set('phuong_thuc', filters.admissionForm);
    if (filters?.combination) params.set('to_hop', filters.combination);
    navigate(params.toString() ? `/du-bao?${params.toString()}` : '/du-bao');
  };

  // ==========================================================================
  // ADMIN AREA: Completely isolated routing and layout under /admin
  // ==========================================================================
  if (isAdmin) {
    return (
      <AdminAuthProvider>
        <AdminArea subRoute={adminSubRoute || 'dashboard'} />
      </AdminAuthProvider>
    );
  }

  // ==========================================================================
  // PUBLIC AREA: Pure candidate experience at root (/) and public paths
  // ==========================================================================
  const currentPublicTab: NavigationTab = (publicSubRoute as NavigationTab) || 'home';

  return (
    <PublicLayout
      currentTab={currentPublicTab}
      onSelectTab={handleSelectTab}
      modalMajor={modalMajor}
      onCloseModal={() => setModalMajor(null)}
      onPredictMajor={handleSelectMajorForPrediction}
    >
      {currentPublicTab === 'home' && (
        <HomePage
          onSelectTab={handleSelectTab}
          onViewMajor={handleViewMajor}
          onSelectMajorForPrediction={handleSelectMajorForPrediction}
        />
      )}

      {currentPublicTab === 'orientation' && (
        <MajorOrientationPage
          onSelectTab={handleSelectTab}
          onViewMajor={handleViewMajor}
          onSelectMajorForPrediction={handleSelectMajorForPrediction}
        />
      )}

      {currentPublicTab === 'scores' && (
        <ScoreLookupPage
          onSelectTab={handleSelectTab}
          onViewMajor={handleViewMajor}
          onSelectMajorForPrediction={handleSelectMajorForPrediction}
        />
      )}

      {currentPublicTab === 'prediction' && (
        <AdmissionPredictorPage
          onSelectTab={handleSelectTab}
          onViewMajor={handleViewMajor}
        />
      )}

      {currentPublicTab === 'distribution' && (
        <ScoreDistributionPage
          onSelectTab={handleSelectTab}
          onViewMajor={handleViewMajor}
          onSelectMajorForPrediction={handleSelectMajorForPrediction}
        />
      )}

      {currentPublicTab === 'guide' && (
        <AdmissionGuidePage onSelectTab={handleSelectTab} />
      )}

      {currentPublicTab === 'messages' && <UserMailboxPage />}
    </PublicLayout>
  );
}
