const fs = require('fs');
const path = require('path');

// We can compile rule-extractor.ts using ts-node or esbuild or test the built bundle
// Or test directly with a quick node transpile
const cvText = `
Jericho F. Varde
§ vardzz | ï vardz | € vardz.dev | # vardejericho@gmail.com | H +639154636051
Education
Pamantasan ng Cabuyao 2023 – Expected 2027
Bachelor of Science in Computer Science GWA: 1.479 (Dean’s Lister)
Relevant Coursework: Data Structures & Algorithms, Software Engineering, Database Systems, Cloud Computing.
Pamantasan ng Cabuyao | STEM Strand 2021 – 2023
Senior High School With Honors
Focused on Science, Technology, Engineering, and Mathematics foundational coursework.
Bigaa Integrated National High School 2017 – 2021
Junior High School With Honors
Bigaa Elementary School 2011 – 2017
Elementary Education With Honors
Technical Skills
• Languages: JavaScript, TypeScript, Python, Java, Dart, PHP, HTML/CSS, SQL
• Frameworks & Libraries: React, Next.js, Tailwind CSS, Flutter, Framer Motion, GSAP, Shadcn UI, Prisma
• Tools & Infrastructure: Git, GitHub, Docker, AWS, Supabase, Firebase, PostgreSQL, MySQL, DynamoDB, Vercel,
Postman
• Generative AI & Media: Veo 3, ElevenLabs, CapCut, Clipchamp, Prompt Engineering, SEO Optimization
Experience
IT Intern | STEQ Technological Solutions and Services Inc. Aug 2026 – Present
• Manage social media web content and apply targeted SEO strategies to expand digital engagement under the UandWorld
Academy training program.
• Leverage generative AI suites (Veo 3, ElevenLabs, Nano Banana) alongside CapCut to script, produce, and schedule
multimedia assets and content calendars.
• Scripted and produced promotional video collateral for the UandAI “Ads Pilot” agent while benchmarking emerging
AI tools to streamline operational workflows.
• Conduct technical research on emerging software deployment pipelines, assisting senior engineers with system documentation and maintenance tasks.
Membership Data Analyst | DEVCON Laguna July 2026 – Present
• Aggregate and analyze demographic and attendance datasets across 3 major tech event cycles serving 500+ active
members.
• Build data visualization pipelines in Python and SQL, delivering actionable community growth reports to executive
leadership with 98% reporting accuracy.
• Assist in community events coordination, helping bridge technical tracks with student developers and volunteers across
local chapters.
Frontend AI Engineer Intern | FlyRank AI June 2026 – October 2026
• Architect and deploy 15+ production-grade responsive user interfaces using Next.js, TypeScript, and Tailwind CSS for
an AI-powered SEO automation platform.
• Implement AI-assisted pair-programming pipelines to reduce component scaffolding and refactoring cycles by 30
• Enhance core page load performance and rendering latency by 25
• Collaborate closely with product and backend teams to integrate complex API endpoints and optimize state management.
Projects
Gridworks | Creator & Full-Stack Developer | Next.js, TypeScript, Tailwind CSS, PDF.js 2026
• Designed and developed a student-focused web application to parse and extract class schedules directly from PDF
registration forms.
• Replaced flat, unreadable registration texts with an intuitive interactive canvas where students can easily view courses
by day, room, and hours.
• Received great community validation and feedback from classmates, earning 9 upvotes on AppBuilders PH and recognition from more experienced developers.
GhostNet AI | Technical Lead & Fullstack Engineer | Python, Gemini API, Bright Data, Supabase May 2026
• Led a 5-member engineering team to build an automated brand-impersonation monitoring system during LABLAB.AI
2026 competing against 2,500+ global developers.
• Engineered a distributed scraping pipeline with Bright Data and integrated Gemini API to automate takedown reports,
cutting analysis turnaround time by 60
Lunas | Frontend Lead Developer | Next.js, PostgreSQL May 2026
• Led frontend development for a critical QR-code emergency health retrieval system, achieving Top 8 Finalist standing
at SIKAPTala 2026 among national competitors.
Dentara | Full-Stack Developer | Next.js, TypeScript, Supabase, Tailwind CSS Feb 2026 – Apr 2026
• Built an end-to-end PWA connecting dentistry students with clinical patients under the Wadhwani Ignite entrepreneurship track.
• Designed relational schemas and secure Row-Level Security (RLS) policies in Supabase to handle patient records and
match scheduling.
Horizon AI | Frontend Lead Developer | Next.js, Framer Motion, Tailwind CSS Feb 2026 – Present
• Developed intuitive orchestration interfaces and execution monitoring dashboards for a role-driven Small Language
Model (SLM) multi-agent system.
Certifications & Achievements
• AI Engineer for Developers Associate | DataCamp (Credential ID: AIEDA0019019720935) 2026 – 2028
• Data Analyst Associate | DataCamp (Credential ID: DAA0015766640456) 2026 – 2028
• Top 8 Finalist | SIKAPTala National Computer Science and IT Competition (Lunas Project) 2026
`;

module.exports = { cvText };
