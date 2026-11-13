import React from 'react';
import { UserSession } from '../api';
import { 
  GraduationCap, 
  Database, 
  UserCheck, 
  LogOut, 
  Home,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  user: UserSession | null;
  onSelectPersona: (username: string) => void;
  onLogout: () => void;
  onToggleLanding: () => void;
  isLandingView?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  onSelectPersona, 
  onLogout,
  onToggleLanding,
  isLandingView = false 
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-md text-slate-900 border-b border-slate-200/90 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Identity */}
          <button 
            onClick={onToggleLanding}
            className="flex items-center space-x-3 text-left group hover:opacity-95 transition"
            title="Return to UniSphere Showcase Overview"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:bg-blue-700 transition">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">UniSphere</span>
                <span className="text-[10px] uppercase font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                  3NF / BCNF
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">University Academic ERP & Intelligence</p>
            </div>
          </button>

          {/* Persona Switcher Buttons */}
          <div className="hidden lg:flex items-center space-x-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-semibold px-2 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              Role:
            </span>
            <button
              onClick={() => onSelectPersona('admin')}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
                user?.role === 'ADMIN' && !isLandingView
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              Registrar (Admin)
            </button>
            <button
              onClick={() => onSelectPersona('dr_edgar')}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
                user?.role === 'FACULTY' && !isLandingView
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              Dr. Edgar Codd (Faculty)
            </button>
            <button
              onClick={() => onSelectPersona('student_aarav')}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
                user?.username === 'student_aarav' && !isLandingView
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              Aarav (Student)
            </button>
            <button
              onClick={() => onSelectPersona('student_rohan')}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
                user?.username === 'student_rohan' && !isLandingView
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-700 hover:bg-white'
              }`}
            >
              Rohan (Defaulter)
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            
            {/* MySQL Engine Online Badge */}
            <div className="hidden sm:flex items-center space-x-1.5 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>MySQL 8.0</span>
            </div>

            {/* Toggle Action Button */}
            {isLandingView ? (
              <button
                onClick={onToggleLanding}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
              >
                <span>Enter Live ERP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onToggleLanding}
                className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 transition"
              >
                <Home className="w-3.5 h-3.5 text-blue-600" />
                <span>Showcase Overview</span>
              </button>
            )}

            {user && (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-800">{user.displayName}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {user.rollOrCode || user.role}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
