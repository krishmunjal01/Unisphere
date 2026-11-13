import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserSession, 
  authApi, 
  getStoredToken, 
  setStoredToken, 
  removeStoredToken 
} from './api';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';

import { LandingPageView } from './views/LandingPageView';
import { DashboardView } from './views/DashboardView';
import { StudentsView } from './views/StudentsView';
import { FacultyView } from './views/FacultyView';
import { CoursesView } from './views/CoursesView';
import { AttendanceView } from './views/AttendanceView';
import { ExamsView } from './views/ExamsView';
import { FeesView } from './views/FeesView';
import { TimetableView } from './views/TimetableView';
import { DbmsLabView } from './views/DbmsLabView';

import { GraduationCap, LogIn, Activity } from 'lucide-react';

export function App() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isLandingView, setIsLandingView] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = getStoredToken();
    if (token) {
      try {
        const res = await authApi.getMe();
        setUser(res.user);
      } catch (err) {
        removeStoredToken();
        setUser(null);
      }
    }
    setLoading(false);
  };

  const handlePersonaSwitch = async (username: string, targetTab?: TabType) => {
    try {
      const res = await authApi.login(username, 'password123');
      setStoredToken(res.token);
      setUser(res.user);
      setIsLandingView(false);
      if (targetTab) {
        setCurrentTab(targetTab);
      } else {
        setCurrentTab('dashboard');
      }
    } catch (err: any) {
      console.error('Failed to switch persona:', err);
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await authApi.login(loginUsername, loginPassword);
      setStoredToken(res.token);
      setUser(res.user);
      setIsLandingView(false);
      setCurrentTab('dashboard');
    } catch (err: any) {
      setLoginError(err.message);
    }
  };

  const handleLogout = () => {
    removeStoredToken();
    setUser(null);
    setIsLandingView(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-700 text-sm">
        <Activity className="w-5 h-5 animate-spin mr-2 text-slate-900" />
        Initializing UniSphere Academic Database System...
      </div>
    );
  }

  // 1. If explicitly in Landing Page view OR logged out, show the Landing Page!
  if (isLandingView || !user) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
        <LandingPageView 
          onEnterPortal={(personaUsername, targetTab) => {
            const persona = personaUsername || 'admin';
            handlePersonaSwitch(persona, targetTab as TabType);
          }} 
        />
      </div>
    );
  }

  // 2. Operational ERP Workspace view
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      
      {/* Universal Top Navbar */}
      <Navbar 
        user={user} 
        onSelectPersona={(u) => handlePersonaSwitch(u)} 
        onLogout={handleLogout} 
        onToggleLanding={() => setIsLandingView(true)}
        isLandingView={false}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Module Sidebar */}
        <Sidebar 
          currentTab={currentTab} 
          onSelectTab={setCurrentTab} 
          userRole={user.role} 
        />

        {/* Dynamic Content Pane with Smooth Framer-Motion Transitions */}
        <main className="flex-1 p-6 lg:p-8 min-w-0 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentTab}-${user.username}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {currentTab === 'dashboard' && <DashboardView user={user} onNavigate={setCurrentTab} />}
              {currentTab === 'students' && <StudentsView user={user} />}
              {currentTab === 'faculty' && <FacultyView user={user} />}
              {currentTab === 'courses' && <CoursesView user={user} />}
              {currentTab === 'attendance' && <AttendanceView user={user} />}
              {currentTab === 'exams' && <ExamsView user={user} />}
              {currentTab === 'fees' && <FeesView user={user} />}
              {currentTab === 'timetable' && <TimetableView user={user} />}
              {currentTab === 'dbms-lab' && <DbmsLabView user={user} />}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>

    </div>
  );
}

export default App;
