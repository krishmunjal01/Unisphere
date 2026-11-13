import React, { useState, useEffect } from 'react';
import { dbmsLabApi, UserSession } from '../api';
import { 
  Cpu, 
  GitBranch, 
  Layers, 
  Terminal, 
  Activity, 
  Clock, 
  Play, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Search,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface DbmsLabViewProps {
  user: UserSession;
}

export const DbmsLabView: React.FC<DbmsLabViewProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'cte' | 'window' | 'explain' | 'terminal'>('cte');
  
  // CTE State
  const [cteData, setCteData] = useState<any>(null);
  const [cteCourseId, setCteCourseId] = useState<number>(5); // CS401
  const [loadingCte, setLoadingCte] = useState(false);

  // Window Functions State
  const [windowData, setWindowData] = useState<any>(null);
  const [loadingWindow, setLoadingWindow] = useState(false);

  // EXPLAIN ANALYZE State
  const [explainData, setExplainData] = useState<any>(null);
  const [explainQuery, setExplainQuery] = useState<string>(
    "SELECT ar.student_id, ar.session_id, ar.status FROM attendance_records ar WHERE ar.student_id = 1 AND ar.status = 'PRESENT';"
  );
  const [loadingExplain, setLoadingExplain] = useState(false);

  // Terminal State
  const [terminalQuery, setTerminalQuery] = useState<string>(
    "SELECT * FROM vw_student_attendance_summary WHERE examination_eligibility = 'DEFAULTER_SHORTAGE';"
  );
  const [terminalResult, setTerminalResult] = useState<any>(null);
  const [loadingTerminal, setLoadingTerminal] = useState(false);
  const [terminalError, setTerminalError] = useState<string | null>(null);

  // Auto-run CTE on initial mount
  useEffect(() => {
    handleRunCTE(5);
  }, []);

  const handleRunCTE = async (courseIdOverride?: number) => {
    const cId = courseIdOverride !== undefined ? courseIdOverride : cteCourseId;
    setLoadingCte(true);
    try {
      const data = await dbmsLabApi.runRecursiveCTE(cId, 1);
      setCteData(data);
    } catch (err: any) {
      console.error('Failed to run CTE:', err);
    } finally {
      setLoadingCte(false);
    }
  };

  const handleRunWindow = async () => {
    setLoadingWindow(true);
    try {
      const data = await dbmsLabApi.runWindowFunctions();
      setWindowData(data);
    } catch (err: any) {
      console.error('Failed to run Window Functions:', err);
    } finally {
      setLoadingWindow(false);
    }
  };

  const handleRunExplain = async () => {
    setLoadingExplain(true);
    try {
      const data = await dbmsLabApi.runExplainAnalyze(explainQuery);
      setExplainData(data);
    } catch (err: any) {
      console.error('Failed to run EXPLAIN ANALYZE:', err);
    } finally {
      setLoadingExplain(false);
    }
  };

  const handleRunTerminal = async () => {
    setLoadingTerminal(true);
    setTerminalError(null);
    try {
      const data = await dbmsLabApi.executeRawQuery(terminalQuery);
      setTerminalResult(data);
    } catch (err: any) {
      setTerminalError(err.message);
    } finally {
      setLoadingTerminal(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner - Clean Light Academic Theme */}
      <div className="bg-white text-slate-900 rounded-3xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            Viva Showcase Console
          </span>
          <span className="text-xs text-slate-500">• Advanced Relational Engine Benchmarking</span>
        </div>
        <h1 className="text-2xl font-bold mt-1 text-slate-900">DBMS Intelligence Laboratory</h1>
        <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
          Interactive evaluation tools to demonstrate procedural database features: Recursive Common Table Expressions (CTEs), SQL Window Functions, B-Tree index optimization via EXPLAIN ANALYZE, and dynamic relational algebra execution.
        </p>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-100">
          <button
            onClick={() => { setActiveTab('cte'); if (!cteData) handleRunCTE(); }}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition ${
              activeTab === 'cte' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            Recursive CTE Prerequisite Tree
          </button>
          <button
            onClick={() => { setActiveTab('window'); if (!windowData) handleRunWindow(); }}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition ${
              activeTab === 'window' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Window Functions Ranking
          </button>
          <button
            onClick={() => { setActiveTab('explain'); if (!explainData) handleRunExplain(); }}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition ${
              activeTab === 'explain' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            EXPLAIN ANALYZE Execution Plans
          </button>
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition ${
              activeTab === 'terminal' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Live SQL Viva Terminal
          </button>
        </div>
      </div>

      {/* 1. RECURSIVE CTE TAB */}
      {activeTab === 'cte' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Acyclic Prerequisite Graph Traversal</h2>
                <p className="text-xs text-slate-500">
                  Traverses self-referential <code className="text-blue-700 bg-blue-50 font-mono px-1 py-0.5 rounded border border-blue-100">course_prerequisites</code> hierarchy using <code className="font-mono text-blue-700 bg-blue-50 px-1 py-0.5 rounded border border-blue-100">WITH RECURSIVE</code>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={cteCourseId}
                  onChange={e => {
                    const cId = parseInt(e.target.value, 10);
                    setCteCourseId(cId);
                    handleRunCTE(cId);
                  }}
                  className="text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option value={5}>CS401: Distributed Systems (Multi-Tier Tree)</option>
                  <option value={3}>CS301: Database Management Systems</option>
                  <option value={2}>CS201: Data Structures & Algorithms</option>
                </select>

                <button
                  onClick={() => handleRunCTE()}
                  disabled={loadingCte}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  {loadingCte ? 'Traversing...' : 'Execute CTE'}
                </button>
              </div>
            </div>

            {/* Benchmark Latency Tag */}
            {cteData && (
              <div className="flex items-center justify-between text-xs bg-blue-50/60 p-3 rounded-xl border border-blue-200/80">
                <span className="font-semibold text-slate-700">Database Execution Engine:</span>
                <span className="font-mono text-blue-700 font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Latency: {cteData.executionMs} ms • Rows Returned: {cteData.rowCount}
                </span>
              </div>
            )}

            {/* Visual Tree Display */}
            {cteData?.data && cteData.data.length > 0 ? (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Dependency Hierarchy (Resolved Levels)</div>
                <div className="grid grid-cols-1 gap-2">
                  {cteData.data.map((item: any, idx: number) => (
                    <div 
                      key={idx} 
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 flex items-center justify-between transition shadow-2xs"
                      style={{ marginLeft: `${(3 - item.dependency_depth) * 20}px` }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                          Depth Level: {item.dependency_depth}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 text-xs">{item.required_prerequisite}</span>
                          <span className="text-xs text-slate-600 ml-2">({item.prerequisite_title})</span>
                          <span className="text-[10px] text-slate-400 block">Required for: <strong>{item.target_course}</strong></span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-slate-700">Student Grade: {item.student_grade}</div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded inline-block mt-0.5 ${
                          item.eligibility_state === 'CLEARED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.eligibility_state}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : !loadingCte && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 text-center">
                No prerequisites required for this course (Root level node).
              </div>
            )}

            {/* SQL Snippet View */}
            {cteData?.sql && (
              <div className="mt-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Executed SQL Query</span>
                <div className="bg-slate-900 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center space-x-1.5 pb-2 border-b border-slate-800 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-mono text-slate-400 ml-2">MySQL 8.0 Query Engine</span>
                  </div>
                  <pre className="text-blue-300 text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {cteData.sql}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. WINDOW FUNCTIONS TAB */}
      {activeTab === 'window' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Department Percentile & Rank Computation</h2>
                <p className="text-xs text-slate-500">
                  Analytical calculations using <code className="font-mono text-blue-700 bg-blue-50 px-1 py-0.5 rounded border border-blue-100">DENSE_RANK() OVER (PARTITION BY department_id)</code> and <code className="font-mono text-blue-700 bg-blue-50 px-1 py-0.5 rounded border border-blue-100">CUME_DIST()</code>
                </p>
              </div>

              <button
                onClick={handleRunWindow}
                disabled={loadingWindow}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                {loadingWindow ? 'Calculating...' : 'Run Window Functions'}
              </button>
            </div>

            {windowData && (
              <div className="flex items-center justify-between text-xs bg-blue-50/60 p-3 rounded-xl border border-blue-200/80">
                <span className="font-semibold text-slate-700">Analytical Window Engine:</span>
                <span className="font-mono text-blue-700 font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Latency: {windowData.executionMs} ms • Rows: {windowData.rowCount}
                </span>
              </div>
            )}

            {windowData?.data && (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Roll No</th>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3 text-right">CGPA</th>
                      <th className="py-2.5 px-3 text-center">Dept Rank (DENSE_RANK)</th>
                      <th className="py-2.5 px-3 text-right">Percentile (CUME_DIST)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {windowData.data.map((r: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-blue-600">{r.university_roll_no}</td>
                        <td className="py-2.5 px-3 font-sans font-medium text-slate-800">{r.student_name}</td>
                        <td className="py-2.5 px-3 font-sans font-semibold text-slate-700">{r.department_code}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">{r.cumulative_cgpa}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            r.department_rank === 1 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700'
                          }`}>
                            #{r.department_rank}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                          {r.percentile_in_dept}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {windowData?.sql && (
              <div className="mt-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Executed SQL Window Query</span>
                <div className="bg-slate-900 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center space-x-1.5 pb-2 border-b border-slate-800 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-mono text-slate-400 ml-2">MySQL Window Partition</span>
                  </div>
                  <pre className="text-blue-300 text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {windowData.sql}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. EXPLAIN ANALYZE TAB */}
      {activeTab === 'explain' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Query Optimization & Execution Cost Analysis</h2>
              <p className="text-xs text-slate-500">
                Live query plan evaluation using MySQL 8 <code className="font-mono text-blue-700 bg-blue-50 px-1 py-0.5 rounded border border-blue-100">EXPLAIN ANALYZE</code> and B-Tree index scan inspection
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">Query to Analyze:</label>
              <textarea
                rows={3}
                value={explainQuery}
                onChange={e => setExplainQuery(e.target.value)}
                className="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-300 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setExplainQuery("SELECT ar.student_id, ar.session_id, ar.status FROM attendance_records ar WHERE ar.student_id = 1 AND ar.status = 'PRESENT';")}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2 py-1 rounded"
                >
                  Indexed Query (idx_ar_student_status)
                </button>
                <button
                  type="button"
                  onClick={() => setExplainQuery("SELECT * FROM fee_invoices WHERE status = 'OVERDUE' AND due_date < CURRENT_DATE;")}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2 py-1 rounded"
                >
                  Invoice Status Query (idx_invoice_status)
                </button>
              </div>

              <button
                onClick={handleRunExplain}
                disabled={loadingExplain}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                {loadingExplain ? 'Analyzing...' : 'Run EXPLAIN ANALYZE'}
              </button>
            </div>

            {explainData && (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Raw Execution Plan Tree</span>
                <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {explainData.rawPlan}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. LIVE SQL TERMINAL TAB */}
      {activeTab === 'terminal' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Live Examiner SQL Terminal</h2>
              <p className="text-xs text-slate-500">Execute arbitrary read-only queries (SELECT, WITH, SHOW, CALL) directly against the live MySQL instance</p>
            </div>

            <div className="space-y-2">
              <textarea
                rows={4}
                value={terminalQuery}
                onChange={e => setTerminalQuery(e.target.value)}
                placeholder="Enter SQL statement: SELECT * FROM ..."
                className="w-full p-3 font-mono text-xs bg-slate-900 text-blue-200 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setTerminalQuery("SELECT * FROM vw_faculty_workload;")}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded font-mono"
                >
                  vw_faculty_workload
                </button>
                <button
                  type="button"
                  onClick={() => setTerminalQuery("SELECT * FROM vw_fee_defaulters;")}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded font-mono"
                >
                  vw_fee_defaulters
                </button>
                <button
                  type="button"
                  onClick={() => setTerminalQuery("SELECT * FROM audit_logs ORDER BY performed_at DESC LIMIT 10;")}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded font-mono"
                >
                  audit_logs
                </button>
                <button
                  type="button"
                  onClick={() => setTerminalQuery("SHOW FULL TABLES;")}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded font-mono"
                >
                  SHOW TABLES
                </button>
              </div>

              <button
                onClick={handleRunTerminal}
                disabled={loadingTerminal}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                {loadingTerminal ? 'Executing...' : 'Execute Query'}
              </button>
            </div>

            {terminalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{terminalError}</span>
              </div>
            )}

            {terminalResult && (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs bg-blue-50/60 p-2.5 rounded-xl border border-blue-200/80">
                  <span className="font-semibold text-slate-700">Query Executed Successfully</span>
                  <span className="font-mono text-blue-700 font-bold">
                    Latency: {terminalResult.executionMs} ms • Rows: {terminalResult.rowCount}
                  </span>
                </div>

                {Array.isArray(terminalResult.data) && terminalResult.data.length > 0 ? (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-80 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 sticky top-0">
                        <tr>
                          {terminalResult.columns.map((col: string, idx: number) => (
                            <th key={idx} className="py-2 px-3 whitespace-nowrap">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {terminalResult.data.map((row: any, rIdx: number) => (
                          <tr key={rIdx} className="hover:bg-slate-50">
                            {terminalResult.columns.map((col: string, cIdx: number) => (
                              <td key={cIdx} className="py-2 px-3 whitespace-nowrap text-slate-700">
                                {typeof row[col] === 'object' && row[col] !== null 
                                  ? JSON.stringify(row[col]) 
                                  : String(row[col] ?? 'NULL')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-400 text-xs">Query executed with zero rows returned.</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
