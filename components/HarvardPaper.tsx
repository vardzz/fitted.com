"use client";

import React from "react";
import type { TailoredResume } from "@/lib/types";

interface HarvardPaperProps {
  data: NonNullable<TailoredResume["resume"]>;
}

export default function HarvardPaper({ data }: HarvardPaperProps) {
  const {
    name,
    contact,
    skills,
    experience,
    projects,
    education,
    certifications,
  } = data;

  type ContactElement = {
    type: "github" | "linkedin" | "globe" | "email" | "phone" | "text";
    text: string;
    href?: string;
  };

  const contactElements: ContactElement[] = [];

  if (contact?.links && contact.links.length > 0) {
    contact.links.forEach((l) => {
      const urlLower = (l.url || "").toLowerCase();
      const labelLower = (l.label || "").toLowerCase();
      const text = l.label || l.url;
      const href = l.url.startsWith("http") ? l.url : `https://${l.url}`;

      if (urlLower.includes("github.com") || labelLower.includes("github")) {
        contactElements.push({ type: "github", text, href });
      } else if (
        urlLower.includes("linkedin.com") ||
        labelLower.includes("linkedin")
      ) {
        contactElements.push({ type: "linkedin", text, href });
      } else {
        contactElements.push({ type: "globe", text, href });
      }
    });
  }

  if (contact?.email) {
    contactElements.push({
      type: "email",
      text: contact.email,
      href: `mailto:${contact.email}`,
    });
  }
  if (contact?.phone) {
    contactElements.push({
      type: "phone",
      text: contact.phone,
      href: `tel:${contact.phone}`,
    });
  }
  if (contact?.location) {
    contactElements.push({ type: "text", text: contact.location });
  }

  return (
    <div className="harvard-paper-sheet">
      {/* Header Block */}
      <header className="harvard-header">
        <h1 className="harvard-name">{name}</h1>
        {contactElements.length > 0 && (
          <div className="harvard-contact-line">
            {contactElements.map((item, idx) => (
              <React.Fragment key={idx}>
                <span className="harvard-contact-item">
                  {item.type === "github" && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="harvard-icon">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  )}
                  {item.type === "linkedin" && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="harvard-icon">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  )}
                  {item.type === "globe" && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="harvard-icon">
                      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm7.93 9h-3.95a15.42 15.42 0 00-1.34-5.38A8.01 8.01 0 0119.93 11zM12 4.07c.92 1.3 1.67 3.32 1.94 6.93H10.06C10.33 7.39 11.08 5.37 12 4.07zM4.07 13h3.95c.13 1.94.6 3.82 1.34 5.38A8.01 8.01 0 014.07 13zm3.95-2H4.07a8.01 8.01 0 014.59-5.38C7.92 7.18 7.45 9.06 8.02 11zm1.94 2h4.08c-.27 3.61-1.02 5.63-1.94 6.93-.92-1.3-1.67-3.32-2.14-6.93zm5.42 5.38c.74-1.56 1.21-3.44 1.34-5.38h3.95a8.01 8.01 0 01-5.29 5.38z" />
                    </svg>
                  )}
                  {item.type === "email" && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="harvard-icon">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                  )}
                  {item.type === "phone" && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="harvard-icon">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                    </svg>
                  )}
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className="harvard-link">
                      {item.text}
                    </a>
                  ) : (
                    <span>{item.text}</span>
                  )}
                </span>
                {idx < contactElements.length - 1 && (
                  <span className="harvard-separator">|</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </header>

      {/* 1. Technical Skills */}
      {skills && skills.length > 0 && (
        <section className="harvard-section">
          <h2 className="harvard-section-title">Technical Skills</h2>
          {skills.map((skillGroup, idx) => (
            <div key={idx} className="harvard-bullet-row">
              <span className="harvard-bullet-dot">•</span>
              <span className="harvard-bullet-text">
                <strong>{skillGroup.category.replace(/^[•\-*–—◦▪▫‣⁃➢·\u2022\u25E6\u25AA\u2043\u2219\u2013\u2014\s]+/, "")}: </strong>
                <span>{skillGroup.items?.join(", ")}</span>
              </span>
            </div>
          ))}
        </section>
      )}

      {/* 2. Experience */}
      {experience && experience.length > 0 && (
        <section className="harvard-section">
          <h2 className="harvard-section-title">Experience</h2>
          {experience.map((exp, idx) => (
            <div key={idx} className="harvard-entry">
              <div className="harvard-row-between">
                <div className="harvard-entry-title">
                  <strong>{exp.role}</strong>
                  <span> | </span>
                  <span className="harvard-italic">{exp.org}</span>
                </div>
                <div className="harvard-entry-date">
                  {exp.start && exp.end
                    ? `${exp.start} – ${exp.end}`
                    : exp.start || exp.end || ""}
                </div>
              </div>
              {exp.bullets?.map((bullet, bIdx) => (
                <div key={bIdx} className="harvard-bullet-row">
                  <span className="harvard-bullet-dot">•</span>
                  <span className="harvard-bullet-text">{bullet}</span>
                </div>
              ))}
            </div>
          ))}
        </section>
      )}

      {/* 3. Projects */}
      {projects && projects.length > 0 && (
        <section className="harvard-section">
          <h2 className="harvard-section-title">Projects</h2>
          {projects.map((proj, idx) => (
            <div key={idx} className="harvard-entry">
              <div className="harvard-row-between">
                <div className="harvard-entry-title">
                  <strong>{proj.name}</strong>
                  {proj.role ? (
                    <>
                      <span> | </span>
                      <span className="harvard-italic">{proj.role}</span>
                    </>
                  ) : null}
                  {proj.tech && proj.tech.length > 0 ? (
                    <>
                      <span> | </span>
                      <span className="harvard-italic">{proj.tech.join(", ")}</span>
                    </>
                  ) : null}
                </div>
                <div className="harvard-entry-date">
                  {proj.start && proj.end
                    ? `${proj.start} – ${proj.end}`
                    : proj.start || proj.end || ""}
                </div>
              </div>
              {proj.bullets?.map((bullet, bIdx) => (
                <div key={bIdx} className="harvard-bullet-row">
                  <span className="harvard-bullet-dot">•</span>
                  <span className="harvard-bullet-text">{bullet}</span>
                </div>
              ))}
            </div>
          ))}
        </section>
      )}

      {/* 4. Education */}
      {education && education.length > 0 && (
        <section className="harvard-section">
          <h2 className="harvard-section-title">Education</h2>
          {education.map((edu, idx) => (
            <div key={idx} className="harvard-entry">
              <div className="harvard-row-between">
                <div className="harvard-entry-title">
                  <strong>{edu.school}</strong>
                </div>
                <div className="harvard-entry-date">
                  {edu.start && edu.end
                    ? `${edu.start} – ${edu.end}`
                    : edu.start || edu.end || ""}
                </div>
              </div>
              <div className="harvard-row-between">
                <div className="harvard-italic">{edu.degree || ""}</div>
                {edu.gpa ? <strong>{edu.gpa}</strong> : null}
              </div>
              {edu.coursework && edu.coursework.length > 0 && (
                <div style={{ marginTop: 2, fontSize: "11px" }}>
                  <strong>Relevant Coursework: </strong>
                  <span>{edu.coursework.join(", ")}</span>
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* 5. Certifications & Achievements */}
      {certifications && certifications.length > 0 && (
        <section className="harvard-section">
          <h2 className="harvard-section-title">Certifications & Achievements</h2>
          {certifications.map((cert, idx) => (
            <div key={idx} className="harvard-entry">
              <div className="harvard-row-between">
                <div className="harvard-bullet-row" style={{ marginTop: 0, paddingLeft: 0 }}>
                  <span className="harvard-bullet-dot">•</span>
                  <span className="harvard-bullet-text">
                    <strong>{cert.name}</strong>
                    {cert.issuer ? (
                      <>
                        <span> | </span>
                        <span className="harvard-italic">{cert.issuer}</span>
                      </>
                    ) : null}
                  </span>
                </div>
                {cert.date ? (
                  <div className="harvard-entry-date">{cert.date}</div>
                ) : null}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
