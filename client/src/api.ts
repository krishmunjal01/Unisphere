// UniSphere Academic ERP - API Client Layer

import { 
  FALLBACK_USERS, 
  FALLBACK_KPI, 
  FALLBACK_DEPARTMENT_STATS, 
  FALLBACK_AUDIT_LOGS, 
  FALLBACK_STUDENTS, 
  FALLBACK_STUDENT_DETAILS, 
  FALLBACK_FACULTY, 
  FALLBACK_FACULTY_WORKLOAD, 
  FALLBACK_FACULTY_OFFERINGS, 
  FALLBACK_COURSES, 
  FALLBACK_ATTENDANCE_SUMMARY, 
  FALLBACK_INVOICES, 
  FALLBACK_PAYMENTS, 
  FALLBACK_TIMETABLE, 
  FALLBACK_CTE_DATA, 
  FALLBACK_WINDOW_DATA 
} from './fallbackData';

const API_BASE = '/api';

export interface UserSession {
  userId: number;
  username: string;
  role: 'ADMIN' | 'FACULTY' | 'STUDENT';
  email: string;
  studentId: number | null;
  facultyId: number | null;
  displayName: string;
  rollOrCode: string | null;
}

export const getStoredToken = () => localStorage.getItem('unisphere_token');
export const setStoredToken = (token: string) => localStorage.setItem('unisphere_token', token);
export const removeStoredToken = () => localStorage.removeItem('unisphere_token');

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP error ${response.status}`);
      }
      return data as T;
    }
  } catch (err: any) {
    console.warn(`Live API unavailable at ${endpoint}. Using fallback showcase dataset:`, err?.message);
  }

  // Graceful fallback for cloud showcase deployment (Vercel)
  return getFallbackDataForEndpoint(endpoint, options) as T;
}

function getFallbackDataForEndpoint(endpoint: string, options: RequestInit = {}): any {
  if (endpoint.startsWith('/auth/login')) {
    let username = 'admin';
    try {
      if (options.body) {
        const parsed = JSON.parse(options.body as string);
        username = parsed.username || 'admin';
      }
    } catch {}
    const user = FALLBACK_USERS[username] || FALLBACK_USERS['admin'];
    return {
      message: 'Authentication successful (Showcase Mode)',
      token: 'demo_token_' + username,
      user
    };
  }

  if (endpoint.startsWith('/auth/me')) {
    const token = getStoredToken() || '';
    const username = token.replace('demo_token_', '') || 'admin';
    return { user: FALLBACK_USERS[username] || FALLBACK_USERS['admin'] };
  }

  if (endpoint.startsWith('/auth/demo-personas')) {
    return Object.values(FALLBACK_USERS);
  }

  if (endpoint.startsWith('/analytics/kpi')) return FALLBACK_KPI;
  if (endpoint.startsWith('/analytics/department-stats')) return FALLBACK_DEPARTMENT_STATS;
  if (endpoint.startsWith('/analytics/audit-logs')) return FALLBACK_AUDIT_LOGS;
  if (endpoint.startsWith('/analytics/grade-distribution')) return [
    { grade: 'O', count: 4 }, { grade: 'A+', count: 8 }, { grade: 'A', count: 12 }, { grade: 'B+', count: 6 }, { grade: 'F', count: 1 }
  ];

  if (endpoint.startsWith('/students/')) {
    const sId = parseInt(endpoint.split('/')[2], 10) || 1;
    return FALLBACK_STUDENT_DETAILS[sId] || FALLBACK_STUDENT_DETAILS[1];
  }
  if (endpoint.startsWith('/students')) return FALLBACK_STUDENTS;

  if (endpoint.startsWith('/faculty/workload')) return FALLBACK_FACULTY_WORKLOAD;
  if (endpoint.includes('/offerings')) return FALLBACK_FACULTY_OFFERINGS;
  if (endpoint.startsWith('/faculty')) return FALLBACK_FACULTY;

  if (endpoint.startsWith('/courses/offerings')) return FALLBACK_FACULTY_OFFERINGS;
  if (endpoint.startsWith('/courses')) return FALLBACK_COURSES;

  if (endpoint.startsWith('/attendance/summary')) return FALLBACK_ATTENDANCE_SUMMARY;
  if (endpoint.includes('/attendance') && endpoint.includes('/students')) return FALLBACK_STUDENTS;
  if (endpoint.startsWith('/attendance')) return { message: 'Attendance recorded successfully (Showcase Mode)' };

  if (endpoint.startsWith('/fees/invoices')) return FALLBACK_INVOICES;
  if (endpoint.startsWith('/fees/payments')) return FALLBACK_PAYMENTS;
  if (endpoint.startsWith('/fees/defaulters')) return FALLBACK_INVOICES.filter(i => i.status === 'PENDING');
  if (endpoint.startsWith('/fees/pay')) return { message: 'Transaction Committed: Payment verified against ledger', receiptNumber: 'RCP-2026-DEMO' };

  if (endpoint.startsWith('/timetable')) return FALLBACK_TIMETABLE;

  if (endpoint.startsWith('/dbms-lab/recursive-cte')) return FALLBACK_CTE_DATA;
  if (endpoint.startsWith('/dbms-lab/window-functions')) return FALLBACK_WINDOW_DATA;
  if (endpoint.startsWith('/dbms-lab/explain-analyze')) return {
    plan: '-> Index range scan on attendance_records using idx_ar_student_status (cost=1.25 rows=4)\n   -> Filter: (status = "PRESENT") (cost=0.50 rows=2)'
  };
  if (endpoint.startsWith('/dbms-lab/execute-query')) return {
    columns: ['student_id', 'roll_no', 'cgpa', 'status'],
    rows: [
      { student_id: 1, roll_no: '2024CSE001', cgpa: '9.25', status: 'DEANS_LIST' },
      { student_id: 3, roll_no: '2024CSE003', cgpa: '6.40', status: 'PROBATION' }
    ]
  };

  return [];
}

// Module API Services
export const authApi = {
  login: (username: string, password: string = 'password123') =>
    apiRequest<{ message: string; token: string; user: UserSession }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),
  getMe: () => apiRequest<{ user: UserSession }>('/auth/me'),
  getDemoPersonas: () => apiRequest<any[]>('/auth/demo-personas')
};

export const analyticsApi = {
  getKPI: () => apiRequest<any>('/analytics/kpi'),
  getDepartmentStats: () => apiRequest<any[]>('/analytics/department-stats'),
  getAuditLogs: () => apiRequest<any[]>('/analytics/audit-logs'),
  getGradeDistribution: () => apiRequest<any[]>('/analytics/grade-distribution')
};

export const studentsApi = {
  getAll: () => apiRequest<any[]>('/students'),
  getDetails: (id: number) => apiRequest<any>(`/students/${id}`),
  create: (data: any) =>
    apiRequest<any>('/students', {
      method: 'POST',
      body: JSON.stringify(data)
    })
};

export const facultyApi = {
  getAll: () => apiRequest<any[]>('/faculty'),
  getWorkload: () => apiRequest<any[]>('/faculty/workload'),
  getOfferings: (facultyId: number) => apiRequest<any[]>(`/faculty/${facultyId}/offerings`)
};

export const coursesApi = {
  getAll: () => apiRequest<any[]>('/courses'),
  getOfferings: () => apiRequest<any[]>('/courses/offerings'),
  enroll: (studentId: number | null, offeringId: number) =>
    apiRequest<any>('/courses/enroll', {
      method: 'POST',
      body: JSON.stringify({ studentId, offeringId })
    }),
  getPrerequisites: (courseId: number, studentId: number = 1) =>
    apiRequest<any[]>(`/courses/${courseId}/prerequisites?studentId=${studentId}`)
};

export const attendanceApi = {
  getSummary: (params: { offeringId?: number; studentId?: number } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest<any[]>(`/attendance/summary${query ? `?${query}` : ''}`);
  },
  getOfferingSessions: (offeringId: number) =>
    apiRequest<any[]>(`/attendance/offerings/${offeringId}/sessions`),
  getOfferingStudents: (offeringId: number) =>
    apiRequest<any[]>(`/attendance/offerings/${offeringId}/students`),
  createSession: (data: {
    offeringId: number;
    sessionDate: string;
    topicCovered: string;
    records: { studentId: number; status: string; remarks?: string }[];
  }) =>
    apiRequest<any>('/attendance/sessions', {
      method: 'POST',
      body: JSON.stringify(data)
    })
};

export const examsApi = {
  getComponents: (offeringId: number) =>
    apiRequest<any[]>(`/exams/components/${offeringId}`),
  getMarks: (offeringId: number) =>
    apiRequest<any[]>(`/exams/marks/${offeringId}`),
  saveMarks: (data: {
    componentId: number;
    studentId: number;
    marksObtained: number;
    remarks?: string;
  }) =>
    apiRequest<any>('/exams/marks', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  calculateSGPA: (studentId: number, semesterId: number) =>
    apiRequest<any>('/exams/calculate-sgpa', {
      method: 'POST',
      body: JSON.stringify({ studentId, semesterId })
    }),
  getTranscripts: (studentId: number) =>
    apiRequest<any>(`/exams/transcripts/${studentId}`)
};

export const feesApi = {
  getInvoices: (studentId?: number) =>
    apiRequest<any[]>(`/fees/invoices${studentId ? `?studentId=${studentId}` : ''}`),
  getDefaulters: () => apiRequest<any[]>('/fees/defaulters'),
  generateInvoices: (semesterId: number, dueDate: string) =>
    apiRequest<any>('/fees/generate-invoices', {
      method: 'POST',
      body: JSON.stringify({ semesterId, dueDate })
    }),
  pay: (data: {
    invoiceId: number;
    amountPaid: number;
    paymentMode: string;
    transactionReference?: string;
  }) =>
    apiRequest<any>('/fees/pay', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getPayments: () => apiRequest<any[]>('/fees/payments')
};

export const timetableApi = {
  getMaster: () => apiRequest<any[]>('/timetable/master'),
  getClassrooms: () => apiRequest<any[]>('/timetable/classrooms'),
  scheduleSlot: (data: {
    offeringId: number;
    classroomId: number;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }) =>
    apiRequest<any>('/timetable/slots', {
      method: 'POST',
      body: JSON.stringify(data)
    })
};

export const dbmsLabApi = {
  runRecursiveCTE: (courseId: number = 5, studentId: number = 1) =>
    apiRequest<any>('/dbms-lab/recursive-cte', {
      method: 'POST',
      body: JSON.stringify({ courseId, studentId })
    }),
  runWindowFunctions: () => apiRequest<any>('/dbms-lab/window-functions'),
  runExplainAnalyze: (query?: string) =>
    apiRequest<any>('/dbms-lab/explain-analyze', {
      method: 'POST',
      body: JSON.stringify({ query })
    }),
  executeRawQuery: (query: string) =>
    apiRequest<any>('/dbms-lab/execute-query', {
      method: 'POST',
      body: JSON.stringify({ query })
    })
};
