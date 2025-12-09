import { Base44Client, Person, User, AuditLog, Target } from '../types';

// Initial Data Setup
const STORAGE_KEYS = {
  USERS: 'bud35_users',
  PERSONS: 'bud35_persons',
  TARGETS: 'bud35_targets',
  AUDIT: 'bud35_audit',
  SESSION: 'bud35_session_email'
};

const INITIAL_USERS: User[] = [
  {
    id: 'u_admin_master',
    full_name: 'Campinas Mais Segura',
    display_name: 'Admin Master',
    role: 'admin',
    email: 'campinasmaissegura@gmail.com',
    cad: 'MASTER-001',
    approved: true,
    is_master: true
  }
];

const INITIAL_PERSONS: Person[] = [
  {
    id: 'p1',
    full_name: 'Ricardo Mendes',
    nickname: 'Rick',
    status: 'procurado',
    photos: ['https://picsum.photos/200/200?random=1'],
    createdAt: '2023-10-01T10:00:00Z',
    cad: 'CAD-00001',
    observations: 'Indivíduo perigoso, visto pela última vez na zona norte.',
    danger_level: 'alta',
    faccionado: true,
    criminal_articles: 'Art. 157, Art. 33',
    birth_date: '1990-05-15',
    mother_name: 'Maria Mendes',
    city: 'Campinas',
    state: 'SP'
  },
  {
    id: 'p2',
    full_name: 'João Souza',
    nickname: 'Jota',
    status: 'preso',
    photos: ['https://picsum.photos/200/200?random=2'],
    createdAt: '2023-09-15T14:30:00Z',
    cad: 'CAD-00002',
    danger_level: 'media',
    mother_name: 'Ana Souza'
  }
];

// Helper to simulate DB persistence in localStorage
const db = {
  getUsers: (): User[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(stored);
  },
  saveUsers: (users: User[]) => localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)),
  
  getPersons: (): Person[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.PERSONS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.PERSONS, JSON.stringify(INITIAL_PERSONS));
      return INITIAL_PERSONS;
    }
    return JSON.parse(stored);
  },
  savePersons: (persons: Person[]) => localStorage.setItem(STORAGE_KEYS.PERSONS, JSON.stringify(persons)),

  getTargets: (): Target[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.TARGETS);
    return stored ? JSON.parse(stored) : [];
  },
  saveTargets: (targets: Target[]) => localStorage.setItem(STORAGE_KEYS.TARGETS, JSON.stringify(targets)),

  getLogs: (): AuditLog[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.AUDIT);
    return stored ? JSON.parse(stored) : [];
  },
  saveLogs: (logs: AuditLog[]) => localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(logs)),
};

// Mock Client Implementation
export const base44: Base44Client = {
  auth: {
    me: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const email = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!email) throw new Error("Unauthorized");

      const users = db.getUsers();
      const user = users.find(u => u.email === email);
      
      if (!user) {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
        throw new Error("User not found");
      }

      return user;
    },
    loginGoogle: async (email: string) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      let users = db.getUsers();
      let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        // Create new pending user
        user = {
          id: `u_${Date.now()}`,
          full_name: email.split('@')[0],
          email: email,
          role: 'user', // Default role
          approved: false, // Pending approval
          cad: '',
          is_master: false
        };
        users.push(user);
        db.saveUsers(users);
      }

      localStorage.setItem(STORAGE_KEYS.SESSION, user.email);
      return user;
    },
    logout: () => {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      window.location.hash = '/login';
    },
    redirectToLogin: () => {
      window.location.hash = '/login';
    }
  },
  entities: {
    Person: {
      list: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return db.getPersons();
      },
      filter: async (criteria: any) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const persons = db.getPersons();
        return persons.filter(p => {
          return Object.entries(criteria).every(([key, value]) => p[key as keyof Person] === value);
        });
      },
      create: async (data: any) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const persons = db.getPersons();
        const newPerson: Person = {
          ...data,
          id: `p${Date.now()}`,
          createdAt: new Date().toISOString(),
          photos: data.photos || []
        };
        persons.unshift(newPerson);
        db.savePersons(persons);
        return newPerson;
      },
      update: async (id: string, data: any) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const persons = db.getPersons();
        const index = persons.findIndex(p => p.id === id);
        if (index === -1) throw new Error("Person not found");
        
        const updatedPerson = {
          ...persons[index],
          ...data,
          updatedAt: new Date().toISOString()
        };
        
        persons[index] = updatedPerson;
        db.savePersons(persons);
        return updatedPerson;
      }
    },
    User: {
      list: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return db.getUsers();
      },
      update: async (id: string, data: any) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const users = db.getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index === -1) throw new Error("User not found");
        
        const updatedUser = { ...users[index], ...data };
        users[index] = updatedUser;
        db.saveUsers(users);
        return updatedUser;
      },
      delete: async (id: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        let users = db.getUsers();
        users = users.filter(u => u.id !== id);
        db.saveUsers(users);
      }
    },
    Target: {
      list: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return db.getTargets();
      },
      create: async (data: any) => {
        await new Promise(resolve => setTimeout(resolve, 600));
        const targets = db.getTargets();
        const newTarget: Target = {
          ...data,
          id: `t${Date.now()}`,
          created_date: new Date().toISOString()
        };
        targets.unshift(newTarget);
        db.saveTargets(targets);
        return newTarget;
      },
      delete: async (id: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        let targets = db.getTargets();
        targets = targets.filter(t => t.id !== id);
        db.saveTargets(targets);
      }
    },
    AuditLog: {
      create: async (data: any) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const logs = db.getLogs();
        const newLog: AuditLog = {
          ...data,
          id: `log${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        logs.unshift(newLog);
        db.saveLogs(logs);
        return newLog;
      },
      list: async (sort: string, limit: number) => {
        await new Promise(resolve => setTimeout(resolve, 400));
        const logs = db.getLogs();
        return logs.slice(0, limit || 50);
      }
    }
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }: { file: File }) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { file_url: URL.createObjectURL(file) };
      }
    }
  }
};