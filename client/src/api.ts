// UniSphere Academic ERP - API Client Layer

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

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data;
}

// Module API Services
export const authApi = {
  login: (username: string, password: string) =>
    apiRequest<{ token: string; user: UserSession }>('/auth/login', {
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

