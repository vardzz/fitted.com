export type Item<T> = T & { id: string };

export type Profile = {
  name: string;
  contact: {
    email?: string;
    phone?: string;
    location?: string;
    links: { label: string; url: string }[];
  };
  skills: {
    id: string;
    category: string;
    items: { id: string; text: string }[];
  }[];
  experience: {
    id: string;
    role: string;
    org: string;
    start?: string;
    end?: string;
    bullets: { id: string; text: string }[];
  }[];
  projects: {
    id: string;
    name: string;
    role?: string;
    tech: string[];
    date?: string;
    bullets: { id: string; text: string }[];
  }[];
  education: {
    id: string;
    school: string;
    degree?: string;
    gpa?: string;
    start?: string;
    end?: string;
    coursework?: string[];
  }[];
  certifications: {
    id: string;
    name: string;
    issuer?: string;
    date?: string;
  }[];
  warnings: string[];
};

export type TailorResult = {
  resume: Omit<Profile, "warnings">;
  matched: string[];
  gaps: string[];
  dropped: { text: string; reason: string }[];
  stats: { lines: number; budget: number };
};

export type TailoredResume = {
  needs_clarification: boolean;
  clarifying_question?: string;
  resume?: Omit<Profile, "warnings">;
  dropped: { item: string; reason: string }[];
  gaps: string[];
  matched?: string[];
  warnings?: string[];
  stats?: { lines: number; budget: number };
};
