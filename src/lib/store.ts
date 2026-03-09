
export type Scholarship = {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  deadline: string;
  amount: string;
  category: string;
};

export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected';

export type Application = {
  id: string;
  scholarshipId: string;
  scholarshipName: string;
  studentId: string;
  studentName: string;
  academicMarks: string;
  incomeProofUrl: string;
  category: string;
  sop: string;
  status: ApplicationStatus;
  appliedDate: string;
};

export type Student = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  collegeName: string;
  course: string;
  familyIncome: string;
};

// Initial Sample Data
export let scholarships: Scholarship[] = [
  {
    id: '1',
    name: 'STEM Excellence Scholarship',
    description: 'A scholarship for high-achieving students in Science, Technology, Engineering, and Mathematics.',
    eligibility: 'GPA 3.8+, STEM Major',
    deadline: '2024-12-31',
    amount: '$5,000',
    category: 'Merit-Based'
  },
  {
    id: '2',
    name: 'Community Leaders Fund',
    description: 'Supporting students who demonstrate exceptional leadership in community service.',
    eligibility: '100+ hours of community service',
    deadline: '2024-10-15',
    amount: '$2,500',
    category: 'Service-Based'
  },
  {
    id: '3',
    name: 'Global Visionary Award',
    description: 'For students pursuing international relations or global sustainability projects.',
    eligibility: 'Open to all majors with a global focus',
    deadline: '2024-11-20',
    amount: '$4,000',
    category: 'Need-Based'
  }
];

export let applications: Application[] = [];

export let students: Student[] = [
  {
    id: 'student-1',
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phone: '123-456-7890',
    collegeName: 'Tech University',
    course: 'Computer Science',
    familyIncome: '$45,000'
  }
];

// Helper functions for "Database" operations (simulating backend)
export const db = {
  scholarships: {
    getAll: () => scholarships,
    getById: (id: string) => scholarships.find(s => s.id === id),
    add: (s: Omit<Scholarship, 'id'>) => {
      const newScholarship = { ...s, id: Math.random().toString(36).substr(2, 9) };
      scholarships = [...scholarships, newScholarship];
      return newScholarship;
    },
    update: (id: string, s: Partial<Scholarship>) => {
      scholarships = scholarships.map(item => item.id === id ? { ...item, ...s } : item);
    },
    delete: (id: string) => {
      scholarships = scholarships.filter(s => s.id !== id);
    }
  },
  applications: {
    getAll: () => applications,
    getByStudentId: (studentId: string) => applications.filter(a => a.studentId === studentId),
    add: (a: Omit<Application, 'id' | 'status' | 'appliedDate'>) => {
      const newApp: Application = {
        ...a,
        id: Math.random().toString(36).substr(2, 9),
        status: 'Pending',
        appliedDate: new Date().toISOString()
      };
      applications = [...applications, newApp];
      return newApp;
    },
    updateStatus: (id: string, status: ApplicationStatus) => {
      applications = applications.map(item => item.id === id ? { ...item, status } : item);
    }
  },
  students: {
    getAll: () => students,
    getById: (id: string) => students.find(s => s.id === id),
    add: (s: Omit<Student, 'id'>) => {
      const newStudent = { ...s, id: Math.random().toString(36).substr(2, 9) };
      students = [...students, newStudent];
      return newStudent;
    }
  }
};
