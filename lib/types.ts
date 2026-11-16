export type Profile = {
  name: string;
  contact: {
    email?: string;
    phone?: string;
    location?: string;
    links?: { label: string; url: string }[];
  };
  skills: { category: string; items: string[] }[];
  experience: {
    role: string;
    org: string;
    start?: string;
    end?: string;
    bullets: string[];
  }[];
  projects: {
    name: string;
    tech?: string[];
    role?: string;
    start?: string;
    end?: string;
    bullets: string[];
  }[];
  education: {
    school: string;
    degree?: string;
    gpa?: string;
    start?: string;
    end?: string;
    coursework?: string[];
  }[];
  certifications: { name: string; issuer?: string; date?: string }[];
  other: string[];
};

export type TailoredResume = {
  needs_clarification: boolean;
  clarifying_question?: string;
  resume?: {
    name: string;
    contact: Profile["contact"];
    skills: Profile["skills"];
    experience: Profile["experience"];
    projects: Profile["projects"];
    education: Profile["education"];
    certifications: Profile["certifications"];
  };
  dropped: { item: string; reason: string }[];
  gaps: string[];
};
