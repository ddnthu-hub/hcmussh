import React from 'react';
import { NavigationTab, Major } from '../types';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { MajorModal } from '../components/MajorModal';
import { BackToTop } from '../components/BackToTop';

interface PublicLayoutProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  modalMajor: Major | null;
  onCloseModal: () => void;
  onPredictMajor: (majorId: string) => void;
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  currentTab,
  onSelectTab,
  modalMajor,
  onCloseModal,
  onPredictMajor,
  children,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 print:bg-white">
      {/* Public Top Header & Navigation */}
      <div className="print:hidden fixed inset-x-0 top-0 z-50 h-[74px]">
        <Navbar currentTab={currentTab} onSelectTab={onSelectTab} />
      </div>
      <div className="print:hidden h-[74px]" aria-hidden="true" />

      {/* Main Public Content Area */}
      <main className="flex-1 print:p-0">
        {children}
      </main>

      {/* Global Major Details Modal */}
      <div className="print:hidden">
        <MajorModal
          major={modalMajor}
          onClose={onCloseModal}
          onPredictMajor={onPredictMajor}
        />
      </div>

      {/* Bottom Public Footer */}
      <div className="print:hidden">
        <Footer onSelectTab={onSelectTab} />
      </div>

      {/* Back to Top */}
      <div className="print:hidden">
        <BackToTop />
      </div>
    </div>
  );
};
