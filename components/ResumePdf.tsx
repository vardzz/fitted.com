import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";
import { TailoredResume } from "@/lib/types";

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 32,
    paddingLeft: 36,
    paddingRight: 36,
    fontFamily: "Times-Roman",
    fontSize: 9.2,
    lineHeight: 1.18,
    color: "#000000",
  },
  header: {
    alignItems: "center",
    marginBottom: 6,
  },
  name: {
    fontFamily: "Times-Bold",
    fontSize: 22,
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  contactLine: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 8.8,
    color: "#111111",
  },
  contactSeparator: {
    marginHorizontal: 4,
  },
  section: {
    marginTop: 6,
    marginBottom: 2,
  },
  sectionHeader: {
    fontFamily: "Times-Bold",
    fontSize: 10.8,
    paddingBottom: 1.5,
    borderBottomWidth: 0.6,
    borderBottomColor: "#000000",
    marginBottom: 4,
  },
  entry: {
    marginBottom: 4,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  leftTitle: {
    flex: 1,
    paddingRight: 8,
  },
  rightDate: {
    fontFamily: "Times-Italic",
    fontSize: 8.8,
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
    marginTop: 1.5,
    paddingLeft: 4,
  },
  bulletDot: {
    width: 10,
    fontSize: 8.5,
  },
  bulletContent: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.16,
  },
});

export default function ResumePdf({
  data,
}: {
  data: TailoredResume["resume"];
}) {
  if (!data) {
    return (
      <Document>
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

  // Build contact items array
  const contactItems: string[] = [];
  if (contact?.links && contact.links.length > 0) {
    contact.links.forEach((l) => {
      contactItems.push(l.label || l.url);
    });
  }
  if (contact?.email) contactItems.push(contact.email);
  if (contact?.phone) contactItems.push(contact.phone);
  if (contact?.location) contactItems.push(contact.location);

  return (
    <Document title={`${name || "Resume"}`} author={name || "Fitted"}>
      <Page size="A4" style={styles.page}>
        {/* Header Block */}
        <View style={styles.header}>
          <Text style={styles.name}>{name}</Text>
          {contactItems.length > 0 && (
            <View style={styles.contactLine}>
              {contactItems.map((item, idx) => (
                <React.Fragment key={idx}>
                  <Text>{item}</Text>
                  {idx < contactItems.length - 1 && (
                    <Text style={styles.contactSeparator}>|</Text>
                  )}
                </React.Fragment>
              ))}
            </View>
          )}
        </View>

        {/* 1. Technical Skills */}
        {skills && skills.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionHeader}>Technical Skills</Text>
            {skills.map((skillGroup, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletContent}>
                  <Text style={styles.bold}>{skillGroup.category}: </Text>
                  <Text>{skillGroup.items?.join(", ")}</Text>
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* 2. Experience */}
        {experience && experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Experience</Text>
            {experience.map((exp, idx) => (
              <View key={idx} style={styles.entry} wrap={false}>
                <View style={styles.rowBetween}>
                  <Text style={styles.leftTitle}>
                    <Text style={styles.bold}>{exp.role}</Text>
                    <Text> | </Text>
                    <Text style={styles.italic}>{exp.org}</Text>
                  </Text>
                  <Text style={styles.rightDate}>
                    {exp.start && exp.end
                      ? `${exp.start} – ${exp.end}`
                      : exp.start || exp.end || ""}
                  </Text>
                </View>
                {exp.bullets?.map((bullet, bIdx) => (
                  <View key={bIdx} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletContent}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* 3. Projects */}
        {projects && projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Projects</Text>
            {projects.map((proj, idx) => (
              <View key={idx} style={styles.entry} wrap={false}>
                <View style={styles.rowBetween}>
                  <Text style={styles.leftTitle}>
                    <Text style={styles.bold}>{proj.name}</Text>
                    {proj.role ? (
                      <>
                        <Text> | </Text>
                        <Text style={styles.italic}>{proj.role}</Text>
                      </>
                    ) : null}
                    {proj.tech && proj.tech.length > 0 ? (
                      <>
                        <Text> | </Text>
                        <Text style={styles.italic}>{proj.tech.join(", ")}</Text>
                      </>
                    ) : null}
                  </Text>
                  <Text style={styles.rightDate}>
                    {proj.start && proj.end
                      ? `${proj.start} – ${proj.end}`
                      : proj.start || proj.end || ""}
                  </Text>
                </View>
                {proj.bullets?.map((bullet, bIdx) => (
                  <View key={bIdx} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletContent}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* 4. Education */}
        {education && education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Education</Text>
            {education.map((edu, idx) => (
              <View key={idx} style={styles.entry} wrap={false}>
                <View style={styles.rowBetween}>
                  <Text style={[styles.leftTitle, styles.bold]}>{edu.school}</Text>
                  <Text style={styles.rightDate}>
                    {edu.start && edu.end
                      ? `${edu.start} – ${edu.end}`
                      : edu.start || edu.end || ""}
                  </Text>
                </View>
                <View style={styles.rowBetween}>
                  <Text style={[styles.leftTitle, styles.italic]}>
                    {edu.degree || ""}
                  </Text>
                  {edu.gpa ? (
                    <Text style={[styles.rightDate, styles.bold]}>{edu.gpa}</Text>
                  ) : null}
                </View>
                {edu.coursework && edu.coursework.length > 0 && (
                  <Text style={{ marginTop: 1, fontSize: 8.8 }}>
                    <Text style={styles.bold}>Relevant Coursework: </Text>
                    <Text>{edu.coursework.join(", ")}</Text>
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* 5. Certifications & Achievements */}
        {certifications && certifications.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionHeader}>Certifications & Achievements</Text>
            {certifications.map((cert, idx) => (
              <View key={idx} style={styles.entry}>
                <View style={styles.rowBetween}>
                  <View style={[styles.leftTitle, { flexDirection: "row" }]}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletContent}>
                      <Text style={styles.bold}>{cert.name}</Text>
                      {cert.issuer ? (
                        <>
                          <Text> | </Text>
                          <Text style={styles.italic}>{cert.issuer}</Text>
                        </>
                      ) : null}
                    </Text>
                  </View>
                  {cert.date ? (
                    <Text style={styles.rightDate}>{cert.date}</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
