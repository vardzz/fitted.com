import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { TailoredResume } from "../lib/types";
import { stripBulletPrefix } from "../lib/regex";

// ATS-First Harvard Resume Styles per resume-style.md section 0
// Strict rules:
// - Times-Roman family only
// - Body text, bullets, dates >= 10pt (minimum size anywhere is 10pt)
// - Name 18pt bold
// - Section headings 11.5pt bold
// - Entry titles 10.5pt bold
// - Margins 12.5mm (~35.4pt) on all sides
// - Standard headings: Skills, Experience, Projects, Education, Certifications
// - Plain visible text contact line (no icons)
// - Plain hyphen '-' in dates
const styles = StyleSheet.create({
  page: {
    size: "A4",
    paddingTop: 34,
    paddingBottom: 34,
    paddingLeft: 35.4,
    paddingRight: 35.4,
    fontFamily: "Times-Roman",
    fontSize: 10,
    lineHeight: 1.15,
    color: "#000000",
  },
  header: {
    marginBottom: 8,
    textAlign: "center",
  },
  name: {
    fontSize: 18,
    fontFamily: "Times-Bold",
    textAlign: "center",
    lineHeight: 1.2,
    marginBottom: 6,
    paddingBottom: 2,
  },
  contactLine: {
    fontSize: 10,
    fontFamily: "Times-Roman",
    textAlign: "center",
    lineHeight: 1.3,
  },
  section: {
    marginTop: 6,
    marginBottom: 2,
  },
  sectionHeaderContainer: {
    borderBottomWidth: 0.6,
    borderBottomColor: "#000000",
    paddingBottom: 1.5,
    marginBottom: 3,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontFamily: "Times-Bold",
    textTransform: "none",
  },
  entry: {
    marginBottom: 3,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  entryTitleLeft: {
    flex: 1,
    paddingRight: 8,
    fontSize: 10.5,
  },
  entryDateRight: {
    fontSize: 10,
    fontFamily: "Times-Italic",
    textAlign: "right",
  },
  bold: {
    fontFamily: "Times-Bold",
  },
  italic: {
    fontFamily: "Times-Italic",
  },
  bulletRow: {
    flexDirection: "row",
    marginTop: 1.2,
    paddingLeft: 4,
  },
  bulletDot: {
    width: 10,
    fontSize: 10,
    fontFamily: "Times-Roman",
  },
  bulletContent: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.15,
  },
});

function normalizeDateHyphen(dateStr?: string): string {
  if (!dateStr) return "";
  return dateStr
    .replace(/[–—−]/g, "-")
    .replace(/\s+to\s+/gi, " - ")
    .replace(/\s*-\s*/g, " - ")
    .trim();
}

export default function ResumePdf({
  data,
}: {
  data: TailoredResume["resume"];
}) {
  if (!data) {
    return (
      <Document title="Resume" author="Candidate">
        <Page size="A4" style={styles.page}>
          <Text>No resume data available.</Text>
        </Page>
      </Document>
    );
  }

  const {
    name,
    contact,
    skills,
    experience,
    projects,
    education,
    certifications,
  } = data;

  // Build ATS-friendly visible contact line: email | phone | links
  const contactParts: string[] = [];
  if (contact?.email) contactParts.push(contact.email);
  if (contact?.phone) contactParts.push(contact.phone);
  if (contact?.links && contact.links.length > 0) {
    for (const link of contact.links) {
      // Show full URL or domain/path, never just a generic label like "GitHub"
      const urlText = link.url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
      contactParts.push(urlText);
    }
  }

  const contactText = contactParts.join(" | ");

  return (
    <Document
      title={`${name} - Resume`}
      author={name}
      subject="Tailored Resume"
      language="en"
    >
      <Page size="A4" style={styles.page}>
        {/* Name and Plain-Text Contact Line */}
        <View style={styles.header}>
          <Text style={styles.name}>{name}</Text>
          {contactText.length > 0 && (
            <Text style={styles.contactLine}>{contactText}</Text>
          )}
        </View>

        {/* 1. Skills (Standard ATS Heading: 'Skills') */}
        {skills && skills.length > 0 && (
          <View style={styles.section} wrap={false}>
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionTitle}>Skills</Text>
            </View>
            {skills.map((skillGroup, idx) => (
              <View key={skillGroup.id || idx} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletContent}>
                  <Text style={styles.bold}>
                    {stripBulletPrefix(skillGroup.category)}:{" "}
                  </Text>
                  <Text>
                    {skillGroup.items.map((i) => i.text).join(", ")}
                  </Text>
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* 2. Experience (Standard ATS Heading: 'Experience') */}
        {experience && experience.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionTitle}>Experience</Text>
            </View>
            {experience.map((exp, idx) => {
              const dateText = exp.start && exp.end
                ? `${normalizeDateHyphen(exp.start)} - ${normalizeDateHyphen(exp.end)}`
                : normalizeDateHyphen(exp.start || exp.end || "");

              return (
                <View key={exp.id || idx} style={styles.entry} wrap={false}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.entryTitleLeft}>
                      <Text style={styles.bold}>{exp.role}</Text>
                      <Text> | </Text>
                      <Text style={styles.italic}>{exp.org}</Text>
                    </Text>
                    <Text style={styles.entryDateRight}>{dateText}</Text>
                  </View>
                  {exp.bullets?.map((bullet, bIdx) => (
                    <View key={bullet.id || bIdx} style={styles.bulletRow}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletContent}>{bullet.text}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        )}

        {/* 3. Projects (Standard ATS Heading: 'Projects') */}
        {projects && projects.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionTitle}>Projects</Text>
            </View>
            {projects.map((proj, idx) => (
              <View key={proj.id || idx} style={styles.entry} wrap={false}>
                <View style={styles.rowBetween}>
                  <Text style={styles.entryTitleLeft}>
                    <Text style={styles.bold}>{proj.name}</Text>
                    {proj.role && (
                      <>
                        <Text> | </Text>
                        <Text style={styles.italic}>{proj.role}</Text>
                      </>
                    )}
                    {proj.tech && proj.tech.length > 0 && (
                      <>
                        <Text> | </Text>
                        <Text style={styles.italic}>{proj.tech.join(", ")}</Text>
                      </>
                    )}
                  </Text>
                  {proj.date && (
                    <Text style={styles.entryDateRight}>
                      {normalizeDateHyphen(proj.date)}
                    </Text>
                  )}
                </View>
                {proj.bullets?.map((bullet, bIdx) => (
                  <View key={bullet.id || bIdx} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletContent}>{bullet.text}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* 4. Education (Standard ATS Heading: 'Education') */}
        {education && education.length > 0 && (
          <View style={styles.section} wrap={false}>
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionTitle}>Education</Text>
            </View>
            {education.map((edu, idx) => {
              const dateText = edu.start && edu.end
                ? `${normalizeDateHyphen(edu.start)} - ${normalizeDateHyphen(edu.end)}`
                : normalizeDateHyphen(edu.start || edu.end || "");

              return (
                <View key={edu.id || idx} style={styles.entry}>
                  <View style={styles.rowBetween}>
                    <Text style={[styles.entryTitleLeft, styles.bold]}>
                      {edu.school}
                    </Text>
                    <Text style={styles.entryDateRight}>{dateText}</Text>
                  </View>
                  {(edu.degree || edu.gpa) && (
                    <View style={styles.rowBetween}>
                      <Text style={styles.italic}>{edu.degree || ""}</Text>
                      {edu.gpa && (
                        <Text style={[styles.entryDateRight, styles.bold]}>
                          {edu.gpa}
                        </Text>
                      )}
                    </View>
                  )}
                  {edu.coursework && edu.coursework.length > 0 && (
                    <Text style={{ marginTop: 1, fontSize: 10 }}>
                      <Text style={styles.bold}>Relevant Coursework: </Text>
                      <Text>{edu.coursework.join(", ")}</Text>
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* 5. Certifications (Standard ATS Heading: 'Certifications') */}
        {certifications && certifications.length > 0 && (
          <View style={styles.section} wrap={false}>
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionTitle}>Certifications</Text>
            </View>
            {certifications.map((cert, idx) => (
              <View key={cert.id || idx} style={styles.entry}>
                <View style={styles.rowBetween}>
                  <Text style={styles.entryTitleLeft}>
                    <Text style={styles.bold}>{cert.name}</Text>
                    {cert.issuer && (
                      <>
                        <Text> | </Text>
                        <Text style={styles.italic}>{cert.issuer}</Text>
                      </>
                    )}
                  </Text>
                  {cert.date && (
                    <Text style={styles.entryDateRight}>
                      {normalizeDateHyphen(cert.date)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
