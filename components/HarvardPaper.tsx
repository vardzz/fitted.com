"use client";

import React from "react";
import { TailoredResume } from "../lib/types";

function normalizeDateHyphen(dateStr?: string): string {
  if (!dateStr) return "";
  return dateStr
    .replace(/[–—−]/g, "-")
    .replace(/\s+to\s+/gi, " - ")
    .replace(/\s*-\s*/g, " - ")
    .trim();
}

export default function HarvardPaper({
  data,
}: {
  data: TailoredResume["resume"];
}) {
  if (!data) return null;

  const {
    name,
    contact,
    skills,
    experience,
    projects,
    education,
    certifications,
  } = data;

  const contactParts: string[] = [];
  if (contact?.email) contactParts.push(contact.email);
  if (contact?.phone) contactParts.push(contact.phone);
  if (contact?.links && contact.links.length > 0) {
    for (const link of contact.links) {
      const urlText = link.url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
      contactParts.push(urlText);
    }
  }
  const contactText = contactParts.join(" | ");

  return (
    <article
      className="harvard-paper-sheet select-text"
      aria-label="Harvard academic 1-page resume preview"
    >
      {/* Centered Name and Plain Contact Line */}
      <header className="harvard-header">
        <h1 className="harvard-name">{name}</h1>
        {contactText.length > 0 && (
          <div className="harvard-contact-line">
            <span>{contactText}</span>
          </div>
        )}
      </header>

      {/* 1. Skills (Standard ATS Heading: 'Skills') */}
      {skills && skills.length > 0 && (
        <section className="harvard-section">
          <h2 className="harvard-section-title">Skills</h2>
          {skills.map((skillGroup, idx) => (
            <div key={skillGroup.id || idx} className="harvard-bullet-row">
              <span className="harvard-bullet-dot">•</span>
              <span className="harvard-bullet-text">
                <strong>
                  {skillGroup.category.replace(/^[\s•*-–—◦▪▫‣⁃➢·\u2022\u25CF\u25A0\u25E6\u25AA\u2043\u2219\u2013\u2014\uF000-\uF8FF\u00A7\u00B7\u2218\uFEFF]+/, "").trim()}:{" "}
                </strong>
                <span>{skillGroup.items?.map((i) => i.text).join(", ")}</span>
              </span>
            </div>
          ))}
        </section>
      )}

      {/* 2. Experience (Standard ATS Heading: 'Experience') */}
      {experience && experience.length > 0 && (
        <section className="harvard-section">
          <h2 className="harvard-section-title">Experience</h2>
          {experience.map((exp, idx) => {
            const dateText = exp.start && exp.end
              ? `${normalizeDateHyphen(exp.start)} - ${normalizeDateHyphen(exp.end)}`
              : normalizeDateHyphen(exp.start || exp.end || "");

            return (
              <div key={exp.id || idx} className="harvard-entry">
                <div className="harvard-row-between">
                  <div className="harvard-entry-title">
                    <strong>{exp.role}</strong>
                    <span> | </span>
                    <span className="harvard-italic">{exp.org}</span>
                  </div>
                  <div className="harvard-entry-date">{dateText}</div>
                </div>
                {exp.bullets?.map((bullet, bIdx) => (
                  <div key={bullet.id || bIdx} className="harvard-bullet-row">
                    <span className="harvard-bullet-dot">•</span>
                    <span className="harvard-bullet-text">{bullet.text}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </section>
      )}

      {/* 3. Projects (Standard ATS Heading: 'Projects') */}
      {projects && projects.length > 0 && (
        <section className="harvard-section">
          <h2 className="harvard-section-title">Projects</h2>
          {projects.map((proj, idx) => (
            <div key={proj.id || idx} className="harvard-entry">
              <div className="harvard-row-between">
                <div className="harvard-entry-title">
                  <strong>{proj.name}</strong>
                  {proj.role && (
                    <>
                      <span> | </span>
                      <span className="harvard-italic">{proj.role}</span>
                    </>
                  )}
                  {proj.tech && proj.tech.length > 0 && (
                    <>
                      <span> | </span>
                      <span className="harvard-italic">
                        {proj.tech.join(", ")}
                      </span>
                    </>
                  )}
                </div>
                {proj.date && (
                  <div className="harvard-entry-date">
                    {normalizeDateHyphen(proj.date)}
                  </div>
                )}
              </div>
              {proj.bullets?.map((bullet, bIdx) => (
                <div key={bullet.id || bIdx} className="harvard-bullet-row">
                  <span className="harvard-bullet-dot">•</span>
                  <span className="harvard-bullet-text">{bullet.text}</span>
                </div>
              ))}
            </div>
          ))}
        </section>
      )}

      {/* 4. Education (Standard ATS Heading: 'Education') */}
      {education && education.length > 0 && (
        <section className="harvard-section">
          <h2 className="harvard-section-title">Education</h2>
          {education.map((edu, idx) => {
            const dateText = edu.start && edu.end
              ? `${normalizeDateHyphen(edu.start)} - ${normalizeDateHyphen(edu.end)}`
              : normalizeDateHyphen(edu.start || edu.end || "");

            return (
              <div key={edu.id || idx} className="harvard-entry">
                <div className="harvard-row-between">
                  <div className="harvard-entry-title">
                    <strong>{edu.school}</strong>
                  </div>
                  <div className="harvard-entry-date">{dateText}</div>
                </div>
                {(edu.degree || edu.gpa) && (
                  <div className="harvard-row-between">
                    <span className="harvard-italic">{edu.degree || ""}</span>
                    {edu.gpa && (
                      <strong className="harvard-gpa">{edu.gpa}</strong>
                    )}
                  </div>
                )}
                {edu.coursework && edu.coursework.length > 0 && (
                  <div className="harvard-coursework">
                    <strong>Relevant Coursework: </strong>
                    <span>{edu.coursework.join(", ")}</span>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* 5. Certifications (Standard ATS Heading: 'Certifications') */}
      {certifications && certifications.length > 0 && (
        <section className="harvard-section">
          <h2 className="harvard-section-title">Certifications</h2>
          {certifications.map((cert, idx) => (
            <div key={cert.id || idx} className="harvard-entry">
              <div className="harvard-row-between">
                <div className="harvard-entry-title">
                  <strong>{cert.name}</strong>
                  {cert.issuer && (
                    <>
                      <span> | </span>
                      <span className="harvard-italic">{cert.issuer}</span>
                    </>
                  )}
                </div>
                {cert.date && (
                  <div className="harvard-entry-date">
                    {normalizeDateHyphen(cert.date)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      )}
    </article>
  );
}
