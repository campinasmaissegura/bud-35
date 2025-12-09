export type PersonStatus = 'procurado' | 'preso' | 'morto' | 'em_liberdade';
export type DangerLevel = 'baixa' | 'media' | 'alta';

export interface Person {
  id: string;
  full_name: string;
  nickname?: string;
  status: PersonStatus;
  photos?: string[];
  createdAt: string;
  updatedAt?: string;
  cad?: string;
  last_edited_by?: string;
  last_edited_by_cad?: string;
  
  // Personal Documents & Info
  cpf?: string;
  rg?: string;
  birth_date?: string;
  mother_name?: string;
  father_name?: string;
  sex?: 'masculino' | 'feminino';
  skin_color?: string;
  height?: string;
  hair?: string;
  registration_number?: string;
  natural_city?: string;
  natural_state?: string;

  // Profile
  danger_level?: DangerLevel;
  faccionado?: boolean;
  criminal_articles?: string;
  observations?: string;

  // Address
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  last_known_location?: string;

  documents?: string[];
  associates?: string[]; // List of CAD numbers
}

export interface User {
  id: string;
  full_name: string;
  role: 'admin' | 'officer' | 'user';
  email: string;
  cad?: string;
  // User Management fields
  approved?: boolean;
  approved_by?: string;
  approved_date?: string;
  display_name?: string;
  is_master?: boolean;
}

export interface Target {
  id: string;
  person_cad: string; // Foreign key to Person.cad
  priority: 'baixa' | 'media' | 'alta' | 'critica';
  reason?: string;
  observations?: string;
  added_by?: string;
  added_by_name?: string;
  created_date: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_name?: string;
  user_email?: string;
  user_name?: string;
  details?: string;
  createdAt: string;
}

export interface Base44Client {
  auth: {
    me: () => Promise<User>;
    loginGoogle: (email: string) => Promise<User>;
    logout: () => void;
    redirectToLogin: () => void;
  };
  entities: {
    Person: {
      list: () => Promise<Person[]>;
      filter: (criteria: Partial<Person>) => Promise<Person[]>;
      create: (data: Omit<Person, 'id' | 'createdAt'>) => Promise<Person>;
      update: (id: string, data: Partial<Person>) => Promise<Person>;
    };
    User: {
      list: () => Promise<User[]>;
      update: (id: string, data: Partial<User>) => Promise<User>;
      delete: (id: string) => Promise<void>;
    };
    Target: {
      list: (sort?: string) => Promise<Target[]>;
      create: (data: Omit<Target, 'id' | 'created_date'>) => Promise<Target>;
      delete: (id: string) => Promise<void>;
    };
    AuditLog: {
      create: (data: Omit<AuditLog, 'id' | 'createdAt'>) => Promise<AuditLog>;
      list: (sort?: string, limit?: number) => Promise<AuditLog[]>;
    };
  };
  integrations: {
    Core: {
      UploadFile: (params: { file: File }) => Promise<{ file_url: string }>;
    };
  };
}