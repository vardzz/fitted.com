import fs from "fs";
import path from "path";
import React from "react";
import { pdf } from "@react-pdf/renderer";
import ResumePdf from "../src/components/ResumePdf";
import { normalizeText } from "../src/lib/normalize";
import { splitSections } from "../src/lib/sections";
import { parseProfile } from "../src/lib/parse-profile";
import { extractTargetKeywords } from "../src/lib/target";
import { scoreProfile } from "../src/lib/score";
import { selectWithinBudget } from "../src/lib/select";
import { computeGaps } from "../src/lib/gaps";
import { matchRolePreset } from "../src/lib/roles";

export interface TestCaseSpec {
  id: string;
  name: string;
  field: string;
  course: string;
  school: string;
  certifications: string[];
  targetRole: string;
  styleDescription: string;
  cvText: string;
}

// 50 Synthetic CVs spanning diverse Fields, Courses, Credentials, and Layout Styles
export const TEST_CASES: TestCaseSpec[] = [
  // 1. Frontend - Standard Clean Bullets
  {
    id: "CV-01",
    name: "Alex Rivera",
    field: "Web Development",
    course: "BS in Computer Science",
    school: "Apex State University",
    certifications: ["Meta Certified Frontend Developer"],
    targetRole: "Frontend Developer",
    styleDescription: "Standard bullet format, standard phone and email",
    cvText: `Alex Rivera
alex.rivera@example.com | +1 (555) 234-5678 | San Francisco, CA | github.com/arivera

Education
Apex State University 2020 - 2024
Bachelor of Science in Computer Science GPA: 3.8 / 4.0
Relevant Coursework: Web Systems, Data Structures, User Interface Design.

Technical Skills
• Languages: TypeScript, JavaScript, HTML, CSS, SQL
• Frameworks: React, Next.js, Tailwind CSS, Redux
• Tools: Git, GitHub, Docker, Vercel, Postman

Experience
Frontend Engineer | Horizon Labs June 2024 - Present
• Architected and shipped 10+ production responsive web applications using Next.js and TypeScript.
• Optimized client-side state management with Redux and React Context, decreasing re-rendering cycles by 35%.
• Integrated RESTful APIs and optimized Core Web Vitals to improve Lighthouse performance scores to 98.
• Collaborated with design teams in Figma to establish design system tokens and modular UI components.

Junior Web Developer | Beacon Interactive Jan 2023 - May 2024
• Implemented interactive dashboard components in React and Tailwind CSS for enterprise data analytics.
• Fixed 40+ cross-browser accessibility and responsiveness issues across mobile and desktop breakpoints.
• Authored comprehensive unit tests with Jest, elevating code coverage across web modules to 85%.

Projects
Portfolio Studio | Creator | React, TypeScript, Next.js May 2024
• Built an open-source responsive portfolio generator supporting server-side rendering and dynamic themes.
• Deployed micro-frontends on Vercel with automated continuous deployment pipelines via GitHub Actions.

Certifications
Meta Certified Frontend Developer - Credential ID: META-FE-998822 (2024)`
  },

  // 2. Data Analytics - Tabular / Pipe Separators
  {
    id: "CV-02",
    name: "Marcus Vance",
    field: "Data Analytics & Business Intelligence",
    course: "BS in Statistics & Data Science",
    school: "Metro Horizon University",
    certifications: ["Tableau Certified Data Analyst"],
    targetRole: "Data Analyst",
    styleDescription: "Pipe-separated headers, data metrics focus",
    cvText: `Marcus Vance
marcus.vance@example.com | +63 917 111 2233 | Manila, Philippines | linkedin.com/in/mvance

Education
Metro Horizon University | 2021 - 2025
BS in Statistics & Data Science | GWA: 1.35 (Dean's Lister)
Relevant Coursework: Statistical Modeling, Database Systems, Business Intelligence.

Technical Skills
• Languages: Python, SQL, R
• Tools & Visualization: Tableau, Power BI, Excel, Pandas, NumPy
• Databases: PostgreSQL, MySQL, Supabase

Experience
Data Analyst Intern | Solaris Analytics | July 2024 - Present
• Built automated SQL queries and ETL pipelines in PostgreSQL, processing 500,000+ customer records weekly.
• Designed executive Tableau dashboards to track KPIs, reducing executive report generation time by 40%.
• Conducted cohort retention analysis using Python and Pandas to identify customer drop-off bottlenecks.

Business Intelligence Assistant | Prime Retail Group | Aug 2023 - May 2024
• Aggregated cross-channel sales datasets using MySQL to deliver weekly inventory demand forecasts.
• Formatted interactive Power BI reports utilized by 30+ regional store supervisors.
• Validated transactional datasets to maintain 99% data integrity across operational databases.

Projects
Customer Churn Predictor | Python, Pandas, Scikit-Learn | Nov 2024
• Analyzed telecom churn drivers across 10,000 subscriber records, training random forest classification models.
• Visualized key demographic churn predictors in Tableau to inform proactive marketing retention campaigns.

Certifications
Tableau Certified Data Analyst - ID: TAB-DA-4401 (2024)`
  },

  // 3. Backend - Microservices / Cloud Focus
  {
    id: "CV-03",
    name: "Elena Rostova",
    field: "Backend Software Engineering",
    course: "BS in Computer Engineering",
    school: "Cascadia Institute of Technology",
    certifications: ["AWS Certified Developer - Associate"],
    targetRole: "Backend Developer",
    styleDescription: "Cloud microservices, hyphen dates, multi-bullet",
    cvText: `Elena Rostova
elena.rostova@example.com | +1 415 889 0012 | Seattle, WA

Education
Cascadia Institute of Technology 2019 - 2023
Bachelor of Science in Computer Engineering GPA: 3.75

Technical Skills
• Languages: Python, Go, TypeScript, SQL
• Backend: Node.js, FastAPI, Express, Django
• Databases & Caching: PostgreSQL, Redis, MongoDB, Prisma
• Cloud & Infrastructure: Docker, AWS, Git, Postman

Experience
Backend Software Engineer | CloudBridge Systems Aug 2023 - Present
• Engineered scalable REST APIs using FastAPI and Node.js serving 2M+ monthly request volumes.
• Containerized microservices using Docker and orchestrated asynchronous job workers with Redis queues.
• Designed normalized relational schemas in PostgreSQL with Prisma ORM, optimizing query latency by 30%.
• Implemented JWT authentication and rate-limiting middleware to secure internal service endpoints.

Software Engineering Intern | DataStream Corp June 2022 - May 2023
• Developed backend data ingestion endpoints using Express and TypeScript for live telemetry streams.
• Profiled database queries in MongoDB and added indexes, cutting median query execution time by 45%.
• Configured automated API integration testing workflows with Postman and GitHub Actions.

Projects
Distributed Task Broker | Go, Redis, Docker | Feb 2024
• Architected a lightweight distributed queue broker in Go capable of handling 5,000 concurrent worker tasks.

Certifications
AWS Certified Developer - Associate (Credential: AWS-DEV-10923)`
  },

  // 4. DevOps & SRE - Infrastructure Heavy
  {
    id: "CV-04",
    name: "Devon Thorne",
    field: "Cloud & Infrastructure Operations",
    course: "BS in Information Technology",
    school: "Pacific Western University",
    certifications: ["Certified Kubernetes Administrator (CKA)", "Terraform Associate"],
    targetRole: "DevOps Engineer",
    styleDescription: "Asterisk bullets, infrastructure and container focus",
    cvText: `Devon Thorne
devon.thorne@example.com | +1 (206) 555-8901 | Portland, OR

Education
Pacific Western University 2019 - 2023
BS in Information Technology GPA: 3.65

Technical Skills
* Cloud & DevOps: Docker, Kubernetes, AWS, Terraform, CI/CD
* Systems & Scripting: Linux, Bash, Python, Nginx
* Tools & VCS: Git, GitHub Actions, Postman

Experience
DevOps Engineer | StrataScale Cloud Sept 2023 - Present
* Provisioned multi-region AWS cloud infrastructure using declarative Terraform modules.
* Automated CI/CD deployment pipelines using GitHub Actions, reducing release cycle duration by 50%.
* Administered production Kubernetes clusters and configured Helm charts for service orchestration.
* Hardened Linux server configurations and set up Nginx reverse proxies with SSL/TLS automation.

Systems Administrator Intern | Horizon Telecom June 2022 - Aug 2023
* Maintained Linux servers and monitored server fleet health across 50+ virtual instances.
* Created automated Bash and Python scripts to perform nightly database backup synchronization.
* Diagnosed network routing and DNS configuration discrepancies to minimize service downtimes.

Projects
GitOps Cluster Lab | Kubernetes, Terraform, Docker | April 2024
* Configured automated GitOps deployment workflows syncing declarative Kubernetes manifests from Git.

Certifications
Certified Kubernetes Administrator (CKA) - ID: CKA-88390 (2023)
HashiCorp Certified: Terraform Associate - ID: HCTA-1122 (2024)`
  },

  // 5. Full-Stack - High Density (Multi-page reduced to 1 page)
  {
    id: "CV-05",
    name: "Maya Lin",
    field: "Full-Stack Development",
    course: "BS in Computer Science",
    school: "Oakland Polytechnic",
    certifications: ["AWS Certified Cloud Practitioner"],
    targetRole: "Full-Stack Developer",
    styleDescription: "Dense 4-role experience requiring line-budget cut",
    cvText: `Maya Lin
maya.lin@example.com | +1 (415) 334-9988 | Oakland, CA | mayalin.dev

Education
Oakland Polytechnic 2018 - 2022
Bachelor of Science in Computer Science GPA: 3.90

Technical Skills
• Languages: TypeScript, JavaScript, Python, SQL, HTML, CSS
• Frameworks: React, Next.js, Node.js, Express, Tailwind CSS
• Databases & Cloud: PostgreSQL, MongoDB, Docker, AWS, Git

Experience
Full-Stack Engineer | Nexus Digital June 2023 - Present
• Spearheaded full-stack development of client portal using Next.js, Node.js, and PostgreSQL.
• Architected responsive frontend components with Tailwind CSS and integrated server actions.
• Implemented end-to-end REST API services and optimized relational database queries by 25%.
• Deployed containerized applications to AWS utilizing Docker and continuous integration pipelines.

Frontend Developer | Kinetic Creative Jan 2022 - May 2023
• Built 15+ responsive marketing landing pages in React and Next.js for high-growth tech clients.
• Increased lighthouse accessibility scores from 72 to 96 across all mobile web interfaces.
• Collaborated with backend developers to define OpenAPI specifications and state management workflows.

Software Engineering Intern | Silverline Technologies June 2021 - Dec 2021
• Developed internal operational tools using Node.js, Express, and MongoDB to manage inventory records.
• Authored integration test suites with Jest, increasing automated regression coverage by 20%.

Web Developer Assistant | Oakland University IT Sept 2020 - May 2021
• Maintained university departmental web pages and fixed layout formatting bugs across browsers.
• Provided technical troubleshooting assistance to faculty and students for internal portals.

Projects
DevFlow Kanban | React, TypeScript, Node.js, PostgreSQL | Jan 2024
• Created a collaborative project management web app featuring drag-and-drop tasks and user authentication.

Certifications
AWS Certified Cloud Practitioner (2023)`
  },

  // 6. AI / ML - Generative AI & Deep Learning
  {
    id: "CV-06",
    name: "Dr. Tariq Al-Mansoor",
    field: "Machine Learning & AI",
    course: "MS in Artificial Intelligence",
    school: "Vanguard Institute of Technology",
    certifications: ["TensorFlow Developer Certificate"],
    targetRole: "AI / ML Engineer",
    styleDescription: "Graduate degree, PyTorch, models, and benchmark evaluation",
    cvText: `Tariq Al-Mansoor
tariq.mansoor@example.com | +1 617 990 4421 | Boston, MA

Education
Vanguard Institute of Technology 2022 - 2024
Master of Science in Artificial Intelligence GPA: 3.95
Cascadia State University 2018 - 2022
Bachelor of Science in Applied Mathematics GPA: 3.82

Technical Skills
• Languages: Python, C++, SQL
• AI & ML: PyTorch, TensorFlow, Scikit-Learn, Generative AI, Prompt Engineering
• Data & Libraries: Pandas, NumPy, FastAPI, Docker

Experience
AI Research Engineer | SynthAI Labs July 2024 - Present
• Fine-tuned transformer language models using PyTorch for domain-specific text classification.
• Benchmarked inference latency across model quantization profiles, achieving 40% faster response times.
• Deployed scalable model inference microservices with FastAPI and Docker on GPU compute nodes.
• Implemented evaluation harnesses to measure prompt engineering hallucination rates across diverse tasks.

Machine Learning Intern | NeuroData Systems June 2023 - May 2024
• Trained computer vision convolutional neural networks in TensorFlow for automated defect detection.
• Preprocessed and augmented 200,000+ image training samples using Python and OpenCV pipelines.
• Analyzed model ablation metrics using Pandas and Scikit-Learn to select top-performing hyperparameters.

Projects
Neural Summarizer | Python, PyTorch, FastAPI | March 2024
• Built an extractive document summarization pipeline leveraging custom fine-tuned transformer weights.

Certifications
TensorFlow Developer Certificate (2023)`
  },

  // 7. Mobile App Dev - Flutter & Native
  {
    id: "CV-07",
    name: "Camila Fernandez",
    field: "Mobile Engineering",
    course: "BS in Information Systems",
    school: "Southern Horizon University",
    certifications: ["Google Associate Android Developer"],
    targetRole: "Mobile Developer",
    styleDescription: "Flutter, React Native, Mobile app releases",
    cvText: `Camila Fernandez
camila.fernandez@example.com | +63 918 334 5566 | Cebu City, Philippines

Education
Southern Horizon University 2020 - 2024
Bachelor of Science in Information Systems GWA: 1.40

Technical Skills
• Languages: Dart, JavaScript, TypeScript, Swift, Kotlin
• Mobile Frameworks: Flutter, React Native, Android, iOS
• Backend & Tools: Firebase, REST API, Git, Figma, Postman

Experience
Mobile Application Developer | QuickPay Mobile June 2024 - Present
• Developed cross-platform fintech mobile application using Flutter and Dart for 100,000+ active users.
• Integrated Firebase Cloud Messaging and biometric authentication to secure user wallet transactions.
• Built responsive mobile user interfaces based on Figma component designs and accessibility guidelines.
• Published 8 production updates to Apple App Store and Google Play Console maintaining 4.8-star rating.

Junior Mobile Developer | AppVenture Studio Jan 2023 - May 2024
• Implemented modular mobile screens in React Native and TypeScript for customer loyalty platforms.
• Integrated RESTful API endpoints for user profile management and automated push notifications.
• Resolved 30+ mobile memory leak and UI rendering bottlenecks across older Android test devices.

Projects
TrackFit Mobile | Flutter, Firebase, Dart | Nov 2023
• Built an offline-first fitness tracker app featuring local SQLite storage and cloud data synchronization.

Certifications
Google Associate Android Developer (2024)`
  },

  // 8. Cybersecurity - SOC & Network Defense
  {
    id: "CV-08",
    name: "Nathaniel Cole",
    field: "Information Security",
    course: "BS in Cybersecurity",
    school: "Apex Cyber College",
    certifications: ["CompTIA Security+", "Cisco CCNA"],
    targetRole: "Cybersecurity Analyst",
    styleDescription: "Threat analysis, SIEM, Wireshark, incident response",
    cvText: `Nathaniel Cole
nathaniel.cole@example.com | +1 (703) 445-1234 | Washington, DC

Education
Apex Cyber College 2020 - 2024
Bachelor of Science in Cybersecurity GPA: 3.70
Relevant Coursework: Network Security, Incident Response, Cryptography, Linux Administration.

Technical Skills
• Security & Analysis: Network Security, SIEM, Wireshark, Vulnerability Assessment, Incident Response
• Systems & Languages: Linux, Python, Bash, SQL, Firewalls
• Tools: Git, Postman

Experience
SOC Analyst | CyberShield Defense June 2024 - Present
• Monitored enterprise SIEM security events and investigated 150+ potential intrusion alerts weekly.
• Conducted deep packet inspection using Wireshark to identify anomalous malicious outbound traffic.
• Mitigated brute-force authentication attacks by reconfiguring Linux firewall rules and rate limits.
• Audited internal active directory user permissions to ensure strict adherence to zero-trust standards.

Information Security Intern | Sentinel Tech Jan 2023 - May 2024
• Performed automated vulnerability assessments across 80+ internal subnets and cataloged CVE findings.
• Automated threat intelligence IP enrichment using Python scripts interfacing with open threat feeds.
• Formatted weekly incident post-mortem summaries for executive leadership review.

Projects
Vulnerability Scanner CLI | Python, Linux | March 2024
• Authored a lightweight network port scanner in Python that maps active services against CVE databases.

Certifications
CompTIA Security+ (SY0-601) - ID: SEC-889911 (2023)
Cisco Certified Network Associate (CCNA) - ID: CCNA-4455 (2024)`
  },

  // 9. Data Engineering - Big Data & Pipelines
  {
    id: "CV-09",
    name: "Priya Sundaram",
    field: "Data Engineering",
    course: "BS in Computer Science",
    school: "Bay Area Institute of Technology",
    certifications: ["AWS Certified Data Analytics"],
    targetRole: "Data Engineer",
    styleDescription: "ETL, Spark, Airflow, PostgreSQL, Data lakes",
    cvText: `Priya Sundaram
priya.sundaram@example.com | +1 (408) 776-5544 | San Jose, CA

Education
Bay Area Institute of Technology 2019 - 2023
Bachelor of Science in Computer Science GPA: 3.85

Technical Skills
• Languages: Python, SQL, Scala
• Data Engineering: Apache Spark, Apache Airflow, Apache Kafka, Snowflake
• Databases & Cloud: PostgreSQL, AWS, Docker, Git

Experience
Data Engineer | DataMesh Systems July 2023 - Present
• Engineered distributed ETL pipelines using Apache Spark and Python, processing 2TB+ daily transaction data.
• Orchestrated 30+ complex DAG workflows in Apache Airflow with automated retry and alerting logic.
• Optimized relational data models in PostgreSQL and Snowflake, decreasing aggregation latency by 35%.
• Streamlined data ingestion from Apache Kafka event streams into centralized cloud data lakes.

Data Engineering Intern | Horizon Cloud Analytics June 2022 - May 2023
• Built automated SQL transformations to clean raw clickstream telemetry records.
• Containerized data pipeline worker nodes using Docker for seamless deployment in cloud test environments.
• Authored data quality validation tests to prevent null and duplicated records in analytical tables.

Projects
Real-Time Telemetry Pipeline | Python, Kafka, Spark, PostgreSQL | Dec 2023
• Deployed an end-to-end event streaming architecture consuming synthetic IoT sensor events into PostgreSQL.

Certifications
AWS Certified Data Analytics - Specialty (2023)`
  },

  // 10. QA Automation - Testing & Verification
  {
    id: "CV-10",
    name: "Arthur Pendelton",
    field: "Software Quality Assurance",
    course: "BS in Software Engineering",
    school: "Great Lakes State University",
    certifications: ["ISTQB Certified Tester"],
    targetRole: "QA Engineer",
    styleDescription: "Selenium, Cypress, automation test frameworks",
    cvText: `Arthur Pendelton
arthur.pendelton@example.com | +1 312 555 7890 | Chicago, IL

Education
Great Lakes State University 2020 - 2024
Bachelor of Science in Software Engineering GPA: 3.60

Technical Skills
• Testing & Automation: Selenium, Cypress, Test Automation, Postman, Jest
• Languages & Web: Python, JavaScript, SQL, HTML, CSS
• DevOps & Tools: CI/CD, Git, GitHub

Experience
QA Automation Engineer | Optima QA Solutions June 2024 - Present
• Automated 200+ regression test cases for enterprise web applications using Cypress and JavaScript.
• Built end-to-end cross-browser test frameworks using Selenium WebDriver and Python.
• Integrated automated test execution into CI/CD pipelines, catching 25+ critical bugs prior to release.
• Tested RESTful API endpoints using Postman and automated JSON response schema verification suites.

Quality Assurance Intern | Apex Fintech Labs Jan 2023 - May 2024
• Executed manual test matrices across staging builds and logged detailed defect reports in Jira.
• Formatted automated SQL test scripts to verify transactional balance accuracy following ledger updates.
• Collaborated with engineering teams to reproduce edge-case client reported rendering glitches.

Projects
API Regression Runner | Python, Postman, GitHub Actions | Feb 2024
• Created an open-source test harness executing Postman collections automatically on pull requests.

Certifications
ISTQB Certified Tester Foundation Level (2024)`
  },

  // 11. UI/UX Designer - Design Systems & Figma
  {
    id: "CV-11",
    name: "Zoe Kravitz",
    field: "Product & UI/UX Design",
    course: "BA in Interactive Media Design",
    school: "Pacific Coast Arts Institute",
    certifications: ["Nielsen Norman UX Master"],
    targetRole: "UI/UX Designer",
    styleDescription: "Figma, wireframes, user research, design systems",
    cvText: `Zoe Kravitz
zoe.kravitz@example.com | +1 (310) 667-8899 | Los Angeles, CA | zoekravitz.design

Education
Pacific Coast Arts Institute 2020 - 2024
Bachelor of Arts in Interactive Media Design GPA: 3.88

Technical Skills
• Design Tools: Figma, Wireframing, Prototyping, Design Systems, User Research
• Web & UI: User Interfaces, Responsive Design, Component Design, Accessibility, HTML, CSS

Experience
Product Designer | Lumina Creative Studio June 2024 - Present
• Designed responsive web interfaces and mobile prototypes in Figma for 6 venture-backed client products.
• Crafted comprehensive component design systems and token libraries used across 20+ engineering teams.
• Conducted 40+ moderated usability testing interviews to identify friction in checkout onboarding flows.
• Collaborated with frontend engineers to review responsive web implementations and ensure pixel accuracy.

UI/UX Design Intern | Horizon Media Jan 2023 - May 2024
• Built interactive high-fidelity clickable prototypes in Figma for a B2B SaaS analytics dashboard.
• Restructured information architecture, reducing user navigation task completion time by 25%.
• Audited product color contrast and typography hierarchies to achieve WCAG AA accessibility compliance.

Projects
Accessible E-Commerce Kit | Figma, Design System | Jan 2024
• Published a Figma community design system featuring 100+ accessible WCAG compliant UI components.

Certifications
Nielsen Norman UX Master Certification (2024)`
  },

  // 12. Systems Engineering / Administration
  {
    id: "CV-12",
    name: "Brandon Vance",
    field: "Systems Administration",
    course: "BS in Network Systems",
    school: "Midwest Technical Institute",
    certifications: ["Red Hat Certified System Administrator (RHCSA)"],
    targetRole: "Systems Engineer",
    styleDescription: "Linux, Bash, Docker, server configuration",
    cvText: `Brandon Vance
brandon.vance@example.com | +1 614 332 9911 | Columbus, OH

Education
Midwest Technical Institute 2019 - 2023
BS in Network Systems GPA: 3.55

Technical Skills
• Operating Systems & Scripting: Linux, Bash, Python, PowerShell
• Infrastructure & Network: Docker, Nginx, Networking, Firewalls, Ansible, Git
• Databases: SQL, MySQL

Experience
Systems Administrator | Apex Enterprise Infrastructure July 2023 - Present
• Administered 80+ Linux production servers running Debian and Ubuntu in a high-availability environment.
• Configured automated provisioning scripts in Bash and Ansible to streamline new server onboarding.
• Maintained Nginx web proxies, SSL/TLS certificates, and firewall security configurations.
• Monitored hardware resource utilization and resolved system bottleneck tickets within SLA deadlines.

Junior Systems Specialist | Horizon Health IT June 2022 - May 2023
• Configured user workstation permissions and managed local Active Directory domain accounts.
• Authored Python scripts to automate user profile migrations and system log archival.
• Assisted senior network engineers in troubleshooting local LAN routing and switch configurations.

Projects
Automated Server Auditor | Bash, Linux | Oct 2023
• Created a modular Bash script verifying Linux server compliance against standard CIS benchmarks.

Certifications
Red Hat Certified System Administrator (RHCSA) - ID: RHCSA-7788 (2023)`
  },

  // 13. Cloud Engineer - AWS & Terraform
  {
    id: "CV-13",
    name: "Jasmine Chen",
    field: "Cloud Architecture",
    course: "BS in Computer Science",
    school: "Silicon Valley State University",
    certifications: ["AWS Solutions Architect Associate"],
    targetRole: "Cloud Engineer",
    styleDescription: "Multi-cloud, Terraform, AWS, Docker",
    cvText: `Jasmine Chen
jasmine.chen@example.com | +1 408 555 3322 | San Jose, CA

Education
Silicon Valley State University 2020 - 2024
Bachelor of Science in Computer Science GPA: 3.80

Technical Skills
• Cloud Platforms: AWS, Azure, Google Cloud Platform
• Infrastructure as Code: Terraform, Docker, Kubernetes, CI/CD
• Systems & Languages: Linux, Python, Bash, Git, Nginx

Experience
Cloud Infrastructure Associate | SkyWard Systems June 2024 - Present
• Architected scalable cloud infrastructure on AWS utilizing Terraform infrastructure as code templates.
• Migrated legacy monolithic services to containerized Docker microservices hosted on AWS ECS.
• Configured multi-environment CI/CD deployment pipelines using GitHub Actions and automated tests.
• Implemented AWS CloudWatch monitoring alerts to achieve 99.95% system uptime across services.

Cloud Engineering Intern | Horizon Cloud Labs Sept 2023 - May 2024
• Automated the provisioning of ephemeral development environments using Terraform and AWS Lambda.
• Reduced idle cloud resource costs by 25% by implementing automated off-hours instance termination.
• Maintained internal documentation detailing cloud security best practices and IAM policies.

Projects
Serverless Cloud API | AWS, Python, Terraform | Feb 2024
• Provisioned a fault-tolerant serverless REST API using AWS API Gateway, Lambda, and DynamoDB.

Certifications
AWS Certified Solutions Architect - Associate (2024)`
  },

  // 14. Computer Engineering - Embedded & IoT
  {
    id: "CV-14",
    name: "Klaus Schmidt",
    field: "Hardware & Systems",
    course: "BS in Computer Engineering",
    school: "Bavarian Polytechnic Institute",
    certifications: ["Arm Certified Engineer"],
    targetRole: "Backend Developer",
    styleDescription: "C/C++, embedded systems, microcontrollers, Linux",
    cvText: `Klaus Schmidt
klaus.schmidt@example.com | +49 89 2233 4455 | Munich, Germany

Education
Bavarian Polytechnic Institute 2019 - 2023
Bachelor of Science in Computer Engineering GPA: 3.75

Technical Skills
• Languages: C, C++, Python, Go, SQL
• Systems & Tools: Linux, Docker, Git, REST API, Postman

Experience
Embedded Software Engineer | MicroTech Automation July 2023 - Present
• Engineered low-latency firmware drivers in C and C++ for industrial ARM microcontrollers.
• Developed Python automated hardware test benches to benchmark sensor communication interfaces.
• Containerized embedded build toolchains using Docker to ensure reproducible cross-compilation.
• Collaborated with hardware designers to debug SPI, I2C, and UART serial communication signals.

Firmware Development Intern | SmartSensors GmbH June 2022 - May 2023
• Implemented sensor data acquisition routines in C for low-power battery-operated IoT nodes.
• Optimized memory utilization in constrained embedded RAM, freeing up 30% available stack space.
• Documented technical API specifications and communication protocol packet structures.

Projects
IoT Gateway Controller | C++, Python, Linux | Nov 2023
• Built an edge gateway on embedded Linux that aggregates sensor telemetry and forwards data via REST API.

Certifications
Arm Certified Engineer (2023)`
  },

  // 15. Bioengineering / Health Informatics
  {
    id: "CV-15",
    name: "Chloe Bennett",
    field: "Health Informatics",
    course: "BS in Biomedical Informatics",
    school: "Metro Health Sciences University",
    certifications: ["Certified Health Data Analyst"],
    targetRole: "Data Analyst",
    styleDescription: "Healthcare datasets, SQL, Python, HIPAA data compliance",
    cvText: `Chloe Bennett
chloe.bennett@example.com | +1 (617) 887-1122 | Boston, MA

Education
Metro Health Sciences University 2020 - 2024
Bachelor of Science in Biomedical Informatics GPA: 3.90
Relevant Coursework: Health Data Standards, Clinical Analytics, Database Architecture.

Technical Skills
• Languages & Tools: Python, SQL, R, Pandas, NumPy
• Analytics & Reporting: Tableau, Power BI, Excel, Data Visualization
• Databases: PostgreSQL, MySQL

Experience
Clinical Data Analyst | Boston General Health June 2024 - Present
• Analyzed electronic health record datasets using SQL and Python to identify clinical patient trends.
• Built interactive Power BI dashboards visualizing patient admission rates and bed occupancy levels.
• Automated weekly departmental reporting queries in PostgreSQL, eliminating 15 hours of manual work.
• Ensured complete compliance with HIPAA regulations across all data aggregation pipelines.

Informatics Research Intern | Metro Medical Center Sept 2023 - May 2024
• Preprocessed longitudinal patient survey datasets using Python and Pandas for epidemiological studies.
• Generated descriptive statistical charts in Tableau for academic research publications.
• Validated healthcare billing codes to improve clinical classification accuracy.

Projects
Patient Readmission Dashboard | Python, Tableau, SQL | Jan 2024
• Developed an analytical dashboard identifying 30-day readmission risk indicators across clinical cohorts.

Certifications
Certified Health Data Analyst (CHDA) (2024)`
  },

  // 16. FinTech / Quantitative Finance
  {
    id: "CV-16",
    name: "Samuel Sterling",
    field: "Financial Technology",
    course: "BS in Financial Mathematics",
    school: "Empire City College of Finance",
    certifications: ["CFA Institute Investment Foundations"],
    targetRole: "Data Analyst",
    styleDescription: "Financial time-series, Python, SQL, Tableau",
    cvText: `Samuel Sterling
samuel.sterling@example.com | +1 (212) 555-7766 | New York, NY

Education
Empire City College of Finance 2020 - 2024
Bachelor of Science in Financial Mathematics GPA: 3.84

Technical Skills
• Languages: Python, SQL, R
• Analysis & Visualization: Tableau, Excel, Pandas, NumPy, Data Visualization
• Databases: PostgreSQL, MySQL, Redis

Experience
Quantitative Data Analyst | Hudson Capital Markets June 2024 - Present
• Modeled multi-asset time-series market pricing data in Python to identify statistical anomalies.
• Wrote high-performance SQL queries in PostgreSQL to extract historical trade transaction logs.
• Developed automated Tableau dashboards monitoring daily portfolio risk metrics and value at risk.
• Automated daily pricing reconciliations using Pandas, cutting operational discrepancy resolution time by 30%.

Financial Analytics Intern | Vanguard Wealth Advisors Jan 2023 - May 2024
• Aggregated client account holdings across disparate data feeds into unified analytical reports.
• Constructed financial scenario forecast models in Excel and Python for wealth advisory teams.
• Produced monthly performance attribution reports presented to institutional fund managers.

Projects
Portfolio Optimization Suite | Python, Pandas, NumPy | April 2024
• Built an automated asset allocation simulator computing the efficient frontier and Sharpe ratios.

Certifications
CFA Institute Investment Foundations Certificate (2024)`
  },

  // 17. Mechanical Engineer transitioning to Tech / Simulation
  {
    id: "CV-17",
    name: "Vikram Malhotra",
    field: "Computational Engineering",
    course: "BS in Mechanical Engineering",
    school: "Apex Engineering Institute",
    certifications: ["Autodesk Certified Professional"],
    targetRole: "Data Analyst",
    styleDescription: "Numerical simulations, Python, CAD, analytics",
    cvText: `Vikram Malhotra
vikram.malhotra@example.com | +1 (412) 334-0099 | Pittsburgh, PA

Education
Apex Engineering Institute 2019 - 2023
Bachelor of Science in Mechanical Engineering GPA: 3.70
Relevant Coursework: Numerical Analysis, Fluid Dynamics, Computational Modeling.

Technical Skills
• Programming & Data: Python, MATLAB, SQL, Pandas, NumPy
• Tools & Visualization: Tableau, Git, Excel, Data Visualization

Experience
Simulation Data Specialist | AeroDynamics Labs July 2023 - Present
• Analyzed aerodynamic wind tunnel sensor telemetry data using Python and Pandas pipelines.
• Built automated data visualization routines in Tableau to display pressure gradient distributions.
• Authored SQL queries to catalog and index 10,000+ experimental test run results in PostgreSQL.
• Validated numerical finite element simulation outputs against physical experimental benchmarks.

Mechanical Engineering Intern | Apex Turbines June 2022 - May 2023
• Generated detailed 3D CAD models and mechanical component drawings in Autodesk Inventor.
• Formatted experimental thermal fatigue test datasets in Excel and presented findings to team leads.
• Automated repetitive engineering calculation spreadsheets using Python scripting.

Projects
Thermal Flux Simulator | Python, NumPy, Matplotlib | Dec 2023
• Developed a 2D numerical heat transfer simulation solver utilizing finite difference algorithms.

Certifications
Autodesk Certified Professional (2023)`
  },

  // 18. Information Systems - Enterprise ERP / IT
  {
    id: "CV-18",
    name: "Lucas Moretti",
    field: "Enterprise IT Systems",
    course: "BS in Management Information Systems",
    school: "St. Jude University",
    certifications: ["ITIL 4 Foundation"],
    targetRole: "Systems Engineer",
    styleDescription: "ERP systems, database queries, IT support",
    cvText: `Lucas Moretti
lucas.moretti@example.com | +1 713 555 4321 | Houston, TX

Education
St. Jude University 2020 - 2024
BS in Management Information Systems GPA: 3.65

Technical Skills
• Systems & Cloud: Linux, Docker, AWS, Networking
• Scripting & Data: Python, Bash, SQL, PostgreSQL, MySQL
• Tools: Git, Postman

Experience
Enterprise IT Systems Specialist | LoneStar Energy IT June 2024 - Present
• Administered enterprise database servers in PostgreSQL and ensured 99.9% database availability.
• Configured automated Linux shell backup routines and user role permissions across departments.
• Resolved escalated hardware, VPN, and system infrastructure tickets within required SLA windows.
• Assisted senior architects in planning cloud server migration schedules from on-premise hardware.

IT Operations Intern | Metro Logistics Corp Jan 2023 - May 2024
• Monitored system health logs across 40+ virtual server instances using automated Bash scripts.
• Documented standard operating procedures for network connectivity troubleshooting and password resets.
• Executed SQL data verification queries to identify discrepancies in inventory ERP databases.

Projects
System Health Monitor | Python, Bash, Linux | March 2024
• Created a lightweight daemon monitoring server disk usage, CPU spikes, and alerting administrators.

Certifications
ITIL 4 Foundation Certificate in IT Service Management (2024)`
  },

  // 19. Mobile iOS Specialist
  {
    id: "CV-19",
    name: "Julian Rivera",
    field: "iOS Development",
    course: "BS in Computer Science",
    school: "Pacific Coast University",
    certifications: ["Apple Certified App Developer"],
    targetRole: "Mobile Developer",
    styleDescription: "Swift, iOS, SwiftUI, Mobile apps",
    cvText: `Julian Rivera
julian.rivera@example.com | +1 415 667 9900 | San Francisco, CA | julian.dev

Education
Pacific Coast University 2020 - 2024
Bachelor of Science in Computer Science GPA: 3.78

Technical Skills
• Languages: Swift, Dart, TypeScript, JavaScript
• Mobile: iOS, Flutter, React Native, Android
• Tools: Git, REST API, Figma, Firebase, Postman

Experience
iOS Mobile Developer | Horizon Interactive June 2024 - Present
• Developed native iOS mobile applications in Swift utilizing SwiftUI and modern concurrency patterns.
• Integrated REST API web services and WebSockets for real-time mobile social interactions.
• Designed mobile interface screens complying with Apple Human Interface Guidelines in Figma.
• Published 5 iOS releases on Apple App Store with zero crash-rate regressions across 50,000 users.

Mobile Development Intern | Apex Mobile Studio Sept 2023 - May 2024
• Implemented reusable SwiftUI components and handled offline data caching via CoreData.
• Integrated Firebase analytics and push notification triggers for user onboarding funnels.
• Profiled Xcode memory allocations to eliminate background rendering frame drops by 20%.

Projects
QuickNotes iOS | Swift, SwiftUI, Firebase | Dec 2023
• Built an offline-first iOS notes app featuring cloud sync and Markdown rendering.

Certifications
Apple Certified App Developer (2024)`
  },

  // 20. AI Applications & Natural Language Processing
  {
    id: "CV-20",
    name: "Amina El-Sayed",
    field: "Applied AI & NLP",
    course: "BS in Computational Linguistics",
    school: "Capital State University",
    certifications: ["DeepLearning.AI NLP Specialization"],
    targetRole: "AI / ML Engineer",
    styleDescription: "NLP, LLMs, prompt engineering, Python, PyTorch",
    cvText: `Amina El-Sayed
amina.elsayed@example.com | +1 202 555 0199 | Washington, DC

Education
Capital State University 2020 - 2024
Bachelor of Science in Computational Linguistics GPA: 3.91
Relevant Coursework: Natural Language Processing, Machine Learning, Statistical Semantics.

Technical Skills
• AI & ML: Generative AI, PyTorch, Prompt Engineering, Machine Learning, Scikit-Learn
• Languages & Data: Python, SQL, Pandas, NumPy
• Tools & Web: FastAPI, Docker, Git

Experience
AI Applications Engineer | OmniLex AI July 2024 - Present
• Engineered LLM application pipelines utilizing prompt engineering and retrieval-augmented generation.
• Fine-tuned domain classification models with PyTorch, improving domain query routing by 28%.
• Benchmarked model generation quality and semantic similarity using automated evaluation suites.
• Built production REST inference endpoints using FastAPI and containerized services in Docker.

NLP Research Assistant | Capital Language Labs Sept 2023 - May 2024
• Curated and cleaned multilingual text corpora containing 500,000+ annotated sentences in Python.
• Trained baseline sentiment classification models utilizing Scikit-Learn and custom feature extraction.
• Co-authored research documentation detailing tokenizer efficiency across low-resource languages.

Projects
Semantic Search Engine | Python, PyTorch, FastAPI | Feb 2024
• Implemented dense vector retrieval over technical documentation using embedding models.

Certifications
DeepLearning.AI NLP Specialization (2024)`
  }
];

// Let's generate synthetic test cases 21 to 50 programmatically to span every combination
const EXTRA_ROLES = [
  { role: "Frontend Developer", field: "Frontend Web Engineering", course: "BS in Computer Science", cert: "Meta Certified Frontend Developer" },
  { role: "Backend Developer", field: "Cloud Microservices", course: "BS in Software Engineering", cert: "AWS Certified Developer" },
  { role: "Full-Stack Developer", field: "Full-Stack Web Systems", course: "BS in Information Technology", cert: "Microsoft Certified Full Stack" },
  { role: "Data Analyst", field: "Business Analytics", course: "BS in Economics & Analytics", cert: "Google Data Analytics Professional" },
  { role: "DevOps Engineer", field: "Cloud Infrastructure", course: "BS in Computer Engineering", cert: "Certified Kubernetes Administrator" },
  { role: "AI / ML Engineer", field: "Machine Learning Engineering", course: "MS in Data Science", cert: "TensorFlow Developer" },
  { role: "Cybersecurity Analyst", field: "Information Assurance", course: "BS in Cybersecurity", cert: "CompTIA Security+" },
  { role: "Data Engineer", field: "Big Data Systems", course: "BS in Computer Science", cert: "Databricks Data Engineer Associate" },
  { role: "Cloud Engineer", field: "Cloud Systems Architecture", course: "BS in Cloud Computing", cert: "AWS Solutions Architect" },
  { role: "QA Engineer", field: "Software Test Automation", course: "BS in Computer Science", cert: "ISTQB Certified Tester" },
];

const FIRST_NAMES = [
  "Aaron", "Beatrice", "Caleb", "Diana", "Emil", "Fatima", "Gabriel", "Hannah", "Isaac", "Julia",
  "Kevin", "Layla", "Mateo", "Nora", "Owen", "Patricia", "Quinn", "Rachel", "Sean", "Tara",
  "Umar", "Valerie", "Wyatt", "Ximena", "Yusuf", "Zara", "Cedric", "Daniela", "Felix", "Giselle"
];

const LAST_NAMES = [
  "Stone", "Mercer", "Kimura", "Gallagher", "Novak", "O'Connor", "Torres", "Lindqvist", "Dubois", "Santos",
  "Nakamura", "Becker", "Holt", "Reyes", "Sinclair", "Vargas", "Kowalski", "Brennan", "Mendoza", "Hayward",
  "Chen", "Alvarez", "Larson", "Fischer", "Gupta", "Nygard", "Castillo", "Romero", "Davenport", "Moreau"
];

for (let i = 0; i < 30; i++) {
  const caseNum = 21 + i;
  const config = EXTRA_ROLES[i % EXTRA_ROLES.length];
  const firstName = FIRST_NAMES[i];
  const lastName = LAST_NAMES[i];
  const fullName = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
  const phone = `+1 (555) ${100 + i * 3}-${2000 + i * 7}`;

  let skillsBlock = "";
  let expBlock = "";
  let projBlock = "";

  if (config.role === "Frontend Developer") {
    skillsBlock = `Technical Skills
• Languages: TypeScript, JavaScript, HTML, CSS, SQL
• Frameworks: React, Next.js, Tailwind CSS, Redux, Zustand
• Tools: Git, GitHub, Docker, Vercel, Postman`;
    expBlock = `Experience
Frontend Engineer | Horizon Technologies | Jan 2024 - Present
• Architected and shipped 10+ production responsive web applications using Next.js and TypeScript.
• Optimized client-side state management with Redux and React Context, decreasing re-rendering cycles by 35%.
• Integrated RESTful APIs and optimized Core Web Vitals to improve Lighthouse performance scores to 98.
• Collaborated closely with product and UX design teams to implement pixel-perfect design systems.

Web Developer | Crescent Digital | June 2022 - Dec 2023
• Implemented interactive dashboard components in React and Tailwind CSS for enterprise data analytics.
• Fixed 40+ cross-browser accessibility and responsiveness issues across mobile and desktop breakpoints.
• Authored comprehensive unit and component tests with Jest, elevating code coverage across web modules to 85%.

Frontend Engineering Intern | Alpha Byte Labs | Jan 2022 - May 2022
• Developed modular UI widgets using JavaScript and CSS3 for customer portal landing pages.
• Assisted senior frontend developers in refactoring legacy jQuery modules into modern React components.`;
    projBlock = `Projects
Modern UI Framework | Creator | React, TypeScript, Tailwind CSS | 2024
• Built an accessible modular UI component library published to npm with automated test coverage.
• Designed interactive documentation site featuring live component previews and copy-paste code snippets.`;
  } else if (config.role === "Backend Developer") {
    skillsBlock = `Technical Skills
• Languages: Python, Go, TypeScript, SQL, Java
• Backend: Node.js, FastAPI, PostgreSQL, Redis, Express
• Cloud & Tools: Docker, AWS, Git, Postman, Prisma`;
    expBlock = `Experience
Backend Software Engineer | Apex Cloud Systems | Feb 2024 - Present
• Engineered scalable REST APIs using FastAPI and Node.js serving 2M+ monthly request volumes.
• Containerized microservices using Docker and orchestrated asynchronous job workers with Redis queues.
• Designed normalized relational schemas in PostgreSQL with Prisma ORM, optimizing query latency by 30%.
• Implemented robust rate-limiting and JWT authentication middleware across all public microservice routes.

Junior Backend Developer | NorthStar Data | June 2022 - Jan 2024
• Developed backend data ingestion endpoints using Express and TypeScript for live telemetry streams.
• Profiled database queries in MongoDB and added indexes, cutting median query execution time by 45%.
• Configured automated API integration testing workflows with Postman and GitHub Actions pipelines.

Backend Developer Intern | CloudWave Software | Jan 2022 - May 2022
• Constructed internal reporting API endpoints querying transactional relational database records.
• Resolved backend bug tickets and implemented structured error handling across legacy microservices.`;
    projBlock = `Projects
Async Queue Engine | Go, Redis, Docker | 2024
• Designed a distributed high-throughput task worker pool managing 10,000 asynchronous jobs.
• Implemented graceful shutdown and dead-letter queue handlers to prevent task processing failures.`;
  } else if (config.role === "Data Analyst") {
    skillsBlock = `Technical Skills
• Languages: Python, SQL, R
• Analysis: Tableau, Power BI, Excel, Pandas, NumPy, Data Visualization
• Databases: PostgreSQL, MySQL, Supabase`;
    expBlock = `Experience
Data Analyst | Pacific Analytics | Jan 2024 - Present
• Built automated SQL queries and ETL pipelines in PostgreSQL, processing 500,000+ customer records weekly.
• Designed executive Tableau dashboards to track KPIs, reducing executive report generation time by 40%.
• Conducted cohort retention analysis using Python and Pandas to identify customer drop-off bottlenecks.
• Partnered with marketing managers to evaluate multi-channel attribution and customer acquisition costs.

Analytics Assistant | Summit Retail | June 2022 - Dec 2023
• Aggregated cross-channel sales datasets using MySQL to deliver weekly inventory demand forecasts.
• Formatted interactive Power BI reports utilized by 30+ regional store supervisors.
• Validated transactional datasets to maintain 99% data integrity across operational databases.

Data Analytics Intern | Metro Insights | Jan 2022 - May 2022
• Performed exploratory data analysis on consumer survey datasets to identify demographic purchasing habits.
• Automated weekly sales summary spreadsheets using Python openpyxl scripts, saving 8 hours weekly.`;
    projBlock = `Projects
Customer Churn Model | Python, Pandas, Tableau | 2024
• Analyzed subscriber retention datasets to uncover key behavioral metrics correlated with renewals.
• Built interactive dashboard showcasing retention trends across geographic and product tier segments.`;
  } else if (config.role === "DevOps Engineer") {
    skillsBlock = `Technical Skills
• Cloud & DevOps: Docker, Kubernetes, AWS, Terraform, CI/CD
• Systems: Linux, Bash, Python, Nginx
• Tools: Git, GitHub Actions, Postman`;
    expBlock = `Experience
DevOps Engineer | StrataScale Systems | March 2024 - Present
• Provisioned multi-region AWS cloud infrastructure using declarative Terraform modules.
• Automated CI/CD deployment pipelines using GitHub Actions, reducing release cycle duration by 50%.
• Administered production Kubernetes clusters and configured Helm charts for service orchestration.
• Hardened Linux server configurations and set up Nginx reverse proxies with SSL/TLS automation.

Infrastructure Specialist | Horizon Hosting | July 2022 - Feb 2024
• Maintained Linux servers and monitored server fleet health across 50+ virtual instances.
• Created automated Bash and Python scripts to perform nightly database backup synchronization.
• Diagnosed network routing and DNS configuration discrepancies to minimize service downtimes.

Cloud Operations Intern | Cascadia Cloud | Jan 2022 - June 2022
• Monitored system availability and resource utilization using Prometheus and Grafana dashboards.
• Documented standard disaster recovery failover procedures and virtual machine provisioning steps.`;
    projBlock = `Projects
GitOps Cluster Pipeline | Kubernetes, Terraform, Docker | 2024
• Configured automated GitOps deployment workflows syncing declarative manifests from Git.
• Automated cluster ingress routing and certificate renewals using cert-manager and Helm charts.`;
  } else if (config.role === "Cybersecurity Analyst") {
    skillsBlock = `Technical Skills
• Security: Network Security, SIEM, Wireshark, Vulnerability Assessment, Incident Response
• Systems: Linux, Python, Bash, SQL, Firewalls
• Tools: Git, Postman`;
    expBlock = `Experience
Security Analyst | CyberShield Operations | Jan 2024 - Present
• Monitored enterprise SIEM security events and investigated 150+ potential intrusion alerts weekly.
• Conducted deep packet inspection using Wireshark to identify anomalous malicious outbound traffic.
• Mitigated brute-force authentication attacks by reconfiguring Linux firewall rules and rate limits.
• Audited internal active directory user permissions to ensure strict adherence to zero-trust standards.

SOC Specialist | Aegis Security | May 2022 - Dec 2023
• Performed automated vulnerability assessments across 80+ internal subnets and cataloged CVE findings.
• Automated threat intelligence IP enrichment using Python scripts interfacing with open threat feeds.
• Formatted weekly incident post-mortem summaries for executive leadership review.

Cybersecurity Intern | Sentinel Systems | Jan 2022 - April 2022
• Assisted tier-2 analysts in triaging phishing incident submissions and analyzing malicious email headers.
• Configured host-based intrusion detection agents across newly imaged employee laptops.`;
    projBlock = `Projects
Threat Intelligence Parser | Python, Linux | 2024
• Created an automated tool aggregating malicious indicators of compromise from public feeds.
• Formatted threat indicators into standardized STIX/TAXII JSON objects for automated firewall ingestion.`;
  } else if (config.role === "Data Engineer") {
    skillsBlock = `Technical Skills
• Languages: Python, SQL, Scala
• Data Engineering: Apache Spark, Apache Airflow, Apache Kafka, Snowflake
• Databases: PostgreSQL, AWS, Docker, Git`;
    expBlock = `Experience
Data Engineer | BigLake Systems | Jan 2024 - Present
• Engineered distributed ETL pipelines using Apache Spark and Python, processing 2TB+ daily transaction data.
• Orchestrated 30+ complex DAG workflows in Apache Airflow with automated retry and alerting logic.
• Optimized relational data models in PostgreSQL and Snowflake, decreasing aggregation latency by 35%.
• Streamlined data ingestion from Apache Kafka event streams into centralized cloud data lakes.

Data Pipeline Specialist | DataStream Corp | June 2022 - Dec 2023
• Built automated SQL transformations to clean raw clickstream telemetry records.
• Containerized data pipeline worker nodes using Docker for seamless deployment in cloud test environments.
• Authored data quality validation tests to prevent null and duplicated records in analytical tables.

Data Engineering Intern | Horizon Analytics | Jan 2022 - May 2022
• Wrote SQL scripts to aggregate historical sales transaction tables for business intelligence reporting.
• Maintained metadata dictionary documenting data lineage across dimensional warehouse tables.`;
    projBlock = `Projects
Event Streaming Lakehouse | Kafka, Spark, PostgreSQL | 2024
• Designed real-time event streaming pipeline ingesting customer telemetry into structured schemas.
• Automated partition compaction and archival to cold cloud storage to optimize query performance.`;
  } else if (config.role === "Cloud Engineer") {
    skillsBlock = `Technical Skills
• Cloud Platforms: AWS, Azure, Docker, Kubernetes
• IaC: Terraform, Linux, Bash, Python, CI/CD
• Tools: Git, Nginx, Postman`;
    expBlock = `Experience
Cloud Systems Engineer | Nimbus Architecture | Feb 2024 - Present
• Architected scalable cloud infrastructure on AWS utilizing Terraform infrastructure as code templates.
• Migrated legacy monolithic services to containerized Docker microservices hosted on AWS ECS.
• Configured multi-environment CI/CD deployment pipelines using GitHub Actions and automated tests.
• Implemented AWS CloudWatch monitoring alerts to achieve 99.95% system uptime across services.

Cloud Support Specialist | Apex Cloud Hosting | July 2022 - Jan 2024
• Automated the provisioning of ephemeral development environments using Terraform and AWS Lambda.
• Reduced idle cloud resource costs by 25% by implementing automated off-hours instance termination.
• Maintained internal documentation detailing cloud security best practices and IAM policies.

Cloud Engineering Intern | SkyWard Systems | Jan 2022 - June 2022
• Assisted senior architects in configuring virtual private clouds and network security group rules.
• Automated weekly EBS snapshot backup schedules using simple Python Lambda functions.`;
    projBlock = `Projects
Multi-Region VPC Automation | Terraform, AWS | 2024
• Automated provisioning of secure isolated AWS cloud VPC architectures across 3 regions.
• Configured inter-region VPC peering and transit gateway routing tables for distributed services.`;
  } else if (config.role === "QA Engineer") {
    skillsBlock = `Technical Skills
• Testing: Selenium, Cypress, Test Automation, Postman, Jest
• Languages: Python, JavaScript, SQL, HTML, CSS
• DevOps: CI/CD, Git, GitHub`;
    expBlock = `Experience
QA Automation Engineer | QualitySphere Labs | Jan 2024 - Present
• Automated 200+ regression test cases for enterprise web applications using Cypress and JavaScript.
• Built end-to-end cross-browser test frameworks using Selenium WebDriver and Python.
• Integrated automated test execution into CI/CD pipelines, catching 25+ critical bugs prior to release.
• Tested RESTful API endpoints using Postman and automated JSON response schema verification suites.

Test Specialist | Verified Software | June 2022 - Dec 2023
• Executed manual test matrices across staging builds and logged detailed defect reports in Jira.
• Formatted automated SQL test scripts to verify transactional balance accuracy following ledger updates.
• Collaborated with engineering teams to reproduce edge-case client reported rendering glitches.

QA Testing Intern | Precision Apps | Jan 2022 - May 2022
• Created smoke test checklists and validated core user signup flows prior to production release dates.
• Documented bug reproduction steps with annotated screenshots and console error trace logs.`;
    projBlock = `Projects
E2E Automation Harness | Cypress, JavaScript | 2024
• Built continuous end-to-end regression testing framework with automated test artifact capture.
• Configured parallel browser execution in GitHub Actions, decreasing total suite test run time by 50%.`;
  } else if (config.role === "AI / ML Engineer") {
    skillsBlock = `Technical Skills
• AI & ML: PyTorch, TensorFlow, Scikit-Learn, Generative AI, Prompt Engineering
• Languages: Python, SQL, C++
• Data & Web: Pandas, NumPy, FastAPI, Docker`;
    expBlock = `Experience
Machine Learning Engineer | Cognitive AI Systems | Feb 2024 - Present
• Fine-tuned transformer language models using PyTorch for domain-specific text classification.
• Benchmarked inference latency across model quantization profiles, achieving 40% faster response times.
• Deployed scalable model inference microservices with FastAPI and Docker on GPU compute nodes.
• Implemented evaluation harnesses to measure prompt engineering hallucination rates across diverse tasks.

AI Engineering Intern | DataSense Labs | June 2022 - Jan 2024
• Trained computer vision convolutional neural networks in TensorFlow for automated defect detection.
• Preprocessed and augmented 200,000+ image training samples using Python and OpenCV pipelines.
• Analyzed model ablation metrics using Pandas and Scikit-Learn to select top-performing hyperparameters.

ML Research Assistant | Cascadia University AI Lab | Jan 2022 - May 2022
• Evaluated gradient boosted decision trees against neural architectures for tabular fraud prediction.
• Documented reproducible experimental benchmarks and packaged datasets for academic publication.`;
    projBlock = `Projects
Neural Classifier | PyTorch, Python, FastAPI | 2024
• Trained and deployed deep neural classification network with high precision and low latency.
• Built interactive demo interface enabling real-time inference on user-uploaded audio and image files.`;
  } else {
    // Full Stack
    skillsBlock = `Technical Skills
• Languages: TypeScript, JavaScript, Python, SQL, HTML, CSS
• Frameworks: React, Next.js, Node.js, Express, Tailwind CSS
• Databases: PostgreSQL, MongoDB, Docker, Git`;
    expBlock = `Experience
Full-Stack Engineer | Nexus Web Labs | Jan 2024 - Present
• Spearheaded full-stack development of client portal using Next.js, Node.js, and PostgreSQL.
• Architected responsive frontend components with Tailwind CSS and integrated server actions.
• Implemented end-to-end REST API services and optimized relational database queries by 25%.
• Deployed containerized applications to AWS utilizing Docker and continuous integration pipelines.

Web Applications Developer | Digital Horizon | June 2022 - Dec 2023
• Built 15+ responsive marketing landing pages in React and Next.js for high-growth tech clients.
• Increased lighthouse accessibility scores from 72 to 96 across all mobile web interfaces.
• Collaborated with backend developers to define OpenAPI specifications and state management workflows.

Full-Stack Intern | Spark Interactive | Jan 2022 - May 2022
• Implemented REST API controllers in Express to handle user profile creation and email notifications.
• Built reusable React navigation and modal components adhering to project styling guidelines.`;
    projBlock = `Projects
Enterprise Task Manager | React, Node.js, PostgreSQL | 2024
• Created full-stack web application with role-based authentication and real-time task sync.
• Optimized PostgreSQL indexing and query patterns to ensure sub-50ms API response latency.`;
  }

  // Also include high school in some CVs to verify college-only filtering
  const highSchoolLine = (i % 2 === 0) ? `\nPacific Regional High School 2016 - 2020\nHigh School Diploma With Honors` : "";

  const cvText = `${fullName}
${email} | ${phone} | San Francisco, CA

Education
Pacific Horizon University 2020 - 2024
${config.course} GPA: 3.7${(i % 9)}
Relevant Coursework: Algorithms, Database Architecture, Systems Design.${highSchoolLine}

${skillsBlock}

${expBlock}

${projBlock}

Certifications
${config.cert} - Credential ID: CERT-${1000 + i * 17} (2024)`;

  TEST_CASES.push({
    id: `CV-${caseNum < 10 ? "0" + caseNum : caseNum}`,
    name: fullName,
    field: config.field,
    course: config.course,
    school: "Pacific Horizon University",
    certifications: [config.cert],
    targetRole: config.role,
    styleDescription: `Synthetic applicant #${caseNum} (${config.role})`,
    cvText,
  });
}

function runPipeline(cvText: string, role: string, posting?: string) {
  const { normalizedText, lines } = normalizeText(cvText);
  const { sections, warnings } = splitSections(lines);
  const profile = parseProfile(sections, normalizedText, warnings);
  const target = extractTargetKeywords(role, posting);
  const scored = scoreProfile(profile, target, role);
  const { resume, dropped, stats, warnings: selectWarnings } = selectWithinBudget(
    scored,
    profile.education || [],
    profile.name,
    profile.contact
  );
  const { matched, gaps } = computeGaps(target.requiredTerms, scored.matchedKeywords);

  return {
    normalizedText,
    profile,
    resume,
    dropped,
    stats,
    matched,
    gaps,
    warnings: [...(profile.warnings || []), ...(selectWarnings || [])],
  };
}

export async function runFiftyTestSuite() {
  console.log(`=======================================================`);
  console.log(`STARTING 50 DIVERSE CV TEST CASES SUITE`);
  console.log(`=======================================================\n`);

  const results: any[] = [];
  let passedCount = 0;
  let failedCount = 0;

  const unpdfModule = await (new Function('return import("unpdf")')());
  const extractText = unpdfModule.extractText;

  for (let idx = 0; idx < TEST_CASES.length; idx++) {
    const tc = TEST_CASES[idx];
    const caseTitle = `[${tc.id}] ${tc.name} -> Target: "${tc.targetRole}" (${tc.field})`;

    try {
      // 1. Pipeline Execution
      const res = runPipeline(tc.cvText, tc.targetRole);

      // 2. Assertions
      const sourceLower = res.normalizedText.toLowerCase();

      // Faithfulness Check: all experience bullets must be verbatim from source
      let expFaithful = true;
      for (const e of res.resume.experience) {
        for (const b of e.bullets) {
          if (!sourceLower.includes(b.text.toLowerCase())) {
            expFaithful = false;
          }
        }
      }

      // Faithfulness Check: all project bullets verbatim
      let projFaithful = true;
      for (const p of res.resume.projects) {
        for (const b of p.bullets) {
          if (!sourceLower.includes(b.text.toLowerCase())) {
            projFaithful = false;
          }
        }
      }

      // Budget check: lines <= 56
      const budgetOk = res.stats.lines <= 56;

      // College only education
      const collegeOnly = res.resume.education.every(
        (edu) => !/\b(?:high\s+school|elementary|primary|junior\s+high|senior\s+high|grade\s+school|middle\s+school|stem\s+strand|k-12|secondary)\b/i.test(edu.school)
      );

      // PDF & ATS Check
      const element = React.createElement(ResumePdf, { data: res.resume });
      const pdfInstance = (pdf as any)(element as any);
      const blob = await pdfInstance.toBlob();
      const ab = await blob.arrayBuffer();
      const pdfData = new Uint8Array(ab);
      const pdfExtract = await extractText(pdfData, { mergePages: false });

      const totalPages = Array.isArray(pdfExtract.text) ? pdfExtract.text.length : 1;
      const fullPdfText = Array.isArray(pdfExtract.text) ? pdfExtract.text.join("\n") : (pdfExtract.text as string);

      const onePageOk = totalPages === 1;
      const hasNoPrivateUse = !/[\uE000-\uF8FF]/.test(fullPdfText);
      const wordCount = fullPdfText.split(/\s+/).filter(Boolean).length;
      const wordCountOk = wordCount >= 150 && wordCount <= 650;

      // Contact info retained
      const emailOk = fullPdfText.toLowerCase().includes("@");

      const casePassed = expFaithful && projFaithful && budgetOk && collegeOnly && onePageOk && hasNoPrivateUse && wordCountOk && emailOk;

      if (casePassed) {
        passedCount++;
        console.log(`✓ PASS: ${caseTitle} | Lines: ${res.stats.lines}/56 | Words: ${wordCount} | Pages: ${totalPages}`);
      } else {
        failedCount++;
        console.error(`✗ FAIL: ${caseTitle}`);
        if (!expFaithful) console.error(`   - Experience faithfulness failure`);
        if (!projFaithful) console.error(`   - Project faithfulness failure`);
        if (!budgetOk) console.error(`   - Budget failure: ${res.stats.lines} > 56 lines`);
        if (!onePageOk) console.error(`   - Page count failure: ${totalPages} pages (expected 1)`);
        if (!hasNoPrivateUse) console.error(`   - Found private-use characters in PDF`);
        if (!wordCountOk) console.error(`   - Word count out of range: ${wordCount}`);
      }

      results.push({
        id: tc.id,
        name: tc.name,
        field: tc.field,
        course: tc.course,
        targetRole: tc.targetRole,
        passed: casePassed,
        lines: res.stats.lines,
        wordCount,
        pages: totalPages,
        matchedCount: res.matched.length,
        droppedCount: res.dropped.length,
        gapsCount: res.gaps.length,
      });
    } catch (err: any) {
      failedCount++;
      console.error(`✗ ERROR on ${caseTitle}:`, err.message);
      results.push({
        id: tc.id,
        name: tc.name,
        field: tc.field,
        course: tc.course,
        targetRole: tc.targetRole,
        passed: false,
        error: err.message,
      });
    }
  }

  console.log(`\n=======================================================`);
  console.log(`50 CV SUITE SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log(`SUCCESS RATE: ${((passedCount / TEST_CASES.length) * 100).toFixed(1)}%`);
  console.log(`=======================================================\n`);

  return { passedCount, failedCount, total: TEST_CASES.length, results };
}

if (require.main === module) {
  runFiftyTestSuite().then(({ failedCount }) => {
    if (failedCount > 0) process.exit(1);
  });
}
