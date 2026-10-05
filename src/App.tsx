import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { ProfileModal } from './components/ProfileModal.tsx';
import { ReportWizard } from './components/ReportWizard.tsx';
import { MatchesView } from './components/MatchesView.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { SearchView } from './components/SearchView.tsx';
import { VerificationModal } from './components/VerificationModal.tsx';
import { HandoverModal } from './components/HandoverModal.tsx';
import { ItemDetailModal } from './components/ItemDetailModal.tsx';
import { 
  UserProfile, 
  ItemReport, 
  MatchResult, 
  ReportType 
} from './types/index.ts';
import { 
  fetchReports, 
  fetchMatches, 
  saveProfile 
} from './services/api.ts';

type AppView = 
  | 'home' 
  | 'lost-wizard' 
  | 'found-wizard' 
  | 'matches' 
  | 'search' 
  | 'dashboard';

const STORAGE_PROFILE_KEY = 'campusfind_student_profile_v1';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileNotice, setProfileNotice] = useState<string | undefined>(undefined);
  const [pendingReportType, setPendingReportType] = useState<ReportType | null>(null);

  // Data states
  const [reports, setReports] = useState<ItemReport[]>([]);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | undefined>(undefined);
  const [detailedReport, setDetailedReport] = useState<ItemReport | null>(null);

  // Verification modal state
  const [verifyModalState, setVerifyModalState] = useState<{
    isOpen: boolean;
    reportId: string;
    partnerReportId: string;
    question?: string;
  }>({
    isOpen: false,
    reportId: '',
    partnerReportId: '',
  });

  // Handover modal state
  const [handoverModalState, setHandoverModalState] = useState<{
    isOpen: boolean;
    reportId: string;
    partnerReportId: string;
    existingHandover?: any;
  }>({
    isOpen: false,
    reportId: '',
    partnerReportId: '',
  });

  // Load profile from localStorage on boot
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROFILE_KEY);
      if (saved) {
        setProfile(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load profile from storage', e);
    }
  }, []);

  // Fetch reports and matches
  const refreshData = useCallback(async () => {
    try {
      const fetchedReports = await fetchReports({ currentUserId: profile?.id });
      setReports(fetchedReports);

      const fetchedMatches = await fetchMatches(selectedReportId, profile?.id);
      setMatches(fetchedMatches);
    } catch (err) {
      console.error('Error refreshing reports or matches:', err);
    }
  }, [profile?.id, selectedReportId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Handle saving profile
  const handleSaveProfile = async (profileData: Partial<UserProfile>) => {
    const saved = await saveProfile(profileData);
    setProfile(saved);
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(saved));
    
    // If user was trying to report an item, transition directly to that wizard!
    if (pendingReportType) {
      const targetType = pendingReportType;
      setPendingReportType(null);
      setCurrentView(targetType === 'LOST' ? 'lost-wizard' : 'found-wizard');
    }
  };

  // Trigger lost / found wizard with profile check
  const startReportFlow = (type: ReportType) => {
    if (!profile) {
      setPendingReportType(type);
      setProfileNotice('Please create or complete your student profile before reporting an item.');
      setIsProfileModalOpen(true);
      return;
    }
    setCurrentView(type === 'LOST' ? 'lost-wizard' : 'found-wizard');
  };

  // On wizard submit success
  const handleReportCreated = async (reportId: string, caseId: string) => {
    await refreshData();
    setSelectedReportId(reportId);
    // Move user to Matches view to see immediate results
    setCurrentView('matches');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={(view) => {
          setSelectedReportId(undefined);
          setCurrentView(view);
        }}
        profile={profile}
        onOpenProfile={() => {
          setProfileNotice(undefined);
          setIsProfileModalOpen(true);
        }}
        matchCount={matches.length}
        activeReportsCount={reports.length}
      />

      {/* Main View Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW 1: HOME LANDING PAGE */}
        {currentView === 'home' && (
          <LandingPage
            onStartLost={() => startReportFlow('LOST')}
            onStartFound={() => startReportFlow('FOUND')}
            onQuickSearch={() => setCurrentView('search')}
            activeReportsCount={reports.length}
            matchesCount={matches.length}
          />
        )}

        {/* VIEW 2: LOST WIZARD */}
        {currentView === 'lost-wizard' && profile && (
          <ReportWizard
            type="LOST"
            profile={profile}
            onCancel={() => setCurrentView('home')}
            onSuccess={handleReportCreated}
          />
        )}

        {/* VIEW 3: FOUND WIZARD */}
        {currentView === 'found-wizard' && profile && (
          <ReportWizard
            type="FOUND"
            profile={profile}
            onCancel={() => setCurrentView('home')}
            onSuccess={handleReportCreated}
          />
        )}

        {/* VIEW 4: MATCHES VIEW */}
        {currentView === 'matches' && (
          <MatchesView
            matches={matches}
            currentUser={profile}
            onOpenVerification={(reportId, partnerReportId, question) => {
              setVerifyModalState({
                isOpen: true,
                reportId,
                partnerReportId,
                question,
              });
            }}
            onOpenHandover={(reportId, partnerReportId) => {
              setHandoverModalState({
                isOpen: true,
                reportId,
                partnerReportId,
              });
            }}
            onRefreshMatches={refreshData}
            onOpenReportWizard={startReportFlow}
          />
        )}

        {/* VIEW 5: SEARCH */}
        {currentView === 'search' && (
          <SearchView
            allReports={reports}
            onSelectReport={(report) => setDetailedReport(report)}
            onOpenReportWizard={startReportFlow}
          />
        )}

        {/* VIEW 6: DASHBOARD */}
        {currentView === 'dashboard' && (
          <DashboardView
            reports={reports}
            currentUser={profile}
            onOpenReportWizard={startReportFlow}
            onOpenMatches={(reportId) => {
              setSelectedReportId(reportId);
              setCurrentView('matches');
            }}
            onOpenVerification={(reportId, partnerReportId, question) => {
              setVerifyModalState({
                isOpen: true,
                reportId,
                partnerReportId,
                question,
              });
            }}
            onOpenHandover={(reportId, partnerReportId, existing) => {
              setHandoverModalState({
                isOpen: true,
                reportId,
                partnerReportId,
                existingHandover: existing,
              });
            }}
            onSelectReport={(report) => setDetailedReport(report)}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center gap-2 font-bold text-slate-800">
            <span>CampusFind AI</span>
            <span>•</span>
            <span className="text-indigo-600 font-semibold">Lost Something? Let AI Find It.</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Intelligent College Campus Lost and Found Platform. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setPendingReportType(null);
        }}
        profile={profile}
        onSaveProfile={handleSaveProfile}
        requiredNotice={profileNotice}
      />

      {/* Secret Item Verification Modal */}
      <VerificationModal
        isOpen={verifyModalState.isOpen}
        onClose={() => setVerifyModalState(prev => ({ ...prev, isOpen: false }))}
        reportId={verifyModalState.reportId}
        partnerReportId={verifyModalState.partnerReportId}
        question={verifyModalState.question}
        onSuccessVerified={refreshData}
        onOpenHandover={() => {
          setHandoverModalState({
            isOpen: true,
            reportId: verifyModalState.reportId,
            partnerReportId: verifyModalState.partnerReportId,
          });
        }}
      />

      {/* Handover Coordination Modal */}
      <HandoverModal
        isOpen={handoverModalState.isOpen}
        onClose={() => setHandoverModalState(prev => ({ ...prev, isOpen: false }))}
        reportId={handoverModalState.reportId}
        partnerReportId={handoverModalState.partnerReportId}
        existingHandover={handoverModalState.existingHandover}
        onSuccess={refreshData}
      />

      {/* Full Detail Inspection Modal */}
      <ItemDetailModal
        isOpen={Boolean(detailedReport)}
        onClose={() => setDetailedReport(null)}
        report={detailedReport}
        currentUser={profile}
        onOpenMatches={(repId) => {
          setSelectedReportId(repId);
          setCurrentView('matches');
        }}
        onOpenHandover={(repId, partId, existing) => {
          setHandoverModalState({
            isOpen: true,
            reportId: repId,
            partnerReportId: partId,
            existingHandover: existing,
          });
        }}
      />

    </div>
  );
}
