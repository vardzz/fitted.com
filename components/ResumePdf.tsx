import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
} from "@react-pdf/renderer";
import { TailoredResume } from "@/lib/types";

// Mini SVG Icons (8x8pt)
const GithubIcon = () => (
  <Svg width={8} height={8} viewBox="0 0 24 24" style={{ marginRight: 3 }}>
    <Path
      fill="#000000"
      d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
    />
  </Svg>
);

const LinkedinIcon = () => (
  <Svg width={8} height={8} viewBox="0 0 24 24" style={{ marginRight: 3 }}>
    <Path
      fill="#000000"
      d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
    />
  </Svg>
);

const GlobeIcon = () => (
  <Svg width={8} height={8} viewBox="0 0 24 24" style={{ marginRight: 3 }}>
    <Path
      fill="#000000"
      d="M12 2a10 10 0 100 20 10 10 0 000-20zm7.93 9h-3.95a15.42 15.42 0 00-1.34-5.38A8.01 8.01 0 0119.93 11zM12 4.07c.92 1.3 1.67 3.32 1.94 6.93H10.06C10.33 7.39 11.08 5.37 12 4.07zM4.07 13h3.95c.13 1.94.6 3.82 1.34 5.38A8.01 8.01 0 014.07 13zm3.95-2H4.07a8.01 8.01 0 014.59-5.38C7.92 7.18 7.45 9.06 8.02 11zm1.94 2h4.08c-.27 3.61-1.02 5.63-1.94 6.93-.92-1.3-1.67-3.32-2.14-6.93zm5.42 5.38c.74-1.56 1.21-3.44 1.34-5.38h3.95a8.01 8.01 0 01-5.29 5.38z"
    />
  </Svg>
);

const MailIcon = () => (
  <Svg width={8} height={8} viewBox="0 0 24 24" style={{ marginRight: 3 }}>
    <Path
      fill="#000000"
      d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
    />
  </Svg>
);

const PhoneIcon = () => (
  <Svg width={8} height={8} viewBox="0 0 24 24" style={{ marginRight: 3 }}>
    <Path
      fill="#000000"
      d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
    />
  </Svg>
);

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingLeft: 36,
    paddingRight: 36,
    fontFamily: "Times-Roman",
    fontSize: 9,
    lineHeight: 1.16,
    color: "#000000",
  },
  header: {
    alignItems: "center",
    marginBottom: 5,
  },
  name: {
    fontFamily: "Times-Bold",
    fontSize: 21,
    letterSpacing: -0.2,
    marginBottom: 2.5,
  },
  contactLine: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 8.5,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactSeparator: {
    marginHorizontal: 4,
    fontSize: 8.5,
  },
  section: {
    marginTop: 5,
    marginBottom: 2,
  },
  sectionHeader: {
    fontFamily: "Times-Bold",
    fontSize: 10.5,
    paddingBottom: 1.5,
    borderBottomWidth: 0.75,
    borderBottomColor: "#000000",
    marginBottom: 3.5,
  },
  entry: {
    marginBottom: 3.5,
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
    fontSize: 8.5,
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
    paddingLeft: 2,
  },
  bulletDot: {
    width: 9,
    fontSize: 8,
  },
  bulletContent: {
    flex: 1,
    fontSize: 8.8,
    lineHeight: 1.14,
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

  // Build structured contact items with icon types
  type ContactElement = {
    type: "github" | "linkedin" | "globe" | "email" | "phone" | "text";
    text: string;
  };

  const contactElements: ContactElement[] = [];

  if (contact?.links && contact.links.length > 0) {
    contact.links.forEach((l) => {
      const urlLower = (l.url || "").toLowerCase();
      const labelLower = (l.label || "").toLowerCase();
      const text = l.label || l.url;

      if (urlLower.includes("github.com") || labelLower.includes("github")) {
        contactElements.push({ type: "github", text });
      } else if (
        urlLower.includes("linkedin.com") ||
        labelLower.includes("linkedin")
      ) {
        contactElements.push({ type: "linkedin", text });
      } else {
        contactElements.push({ type: "globe", text });
      }
    });
  }

  if (contact?.email) {
    contactElements.push({ type: "email", text: contact.email });
  }
  if (contact?.phone) {
    contactElements.push({ type: "phone", text: contact.phone });
  }
  if (contact?.location) {
    contactElements.push({ type: "text", text: contact.location });
  }

  const renderIcon = (type: ContactElement["type"]) => {
    switch (type) {
      case "github":
        return <GithubIcon />;
      case "linkedin":
        return <LinkedinIcon />;
      case "globe":
        return <GlobeIcon />;
      case "email":
        return <MailIcon />;
      case "phone":
        return <PhoneIcon />;
      default:
        return null;
    }
  };

  return (
    <Document title={name || "Resume"} author={name || "Fitted"}>
      <Page size="A4" style={styles.page}>
        {/* Header Block */}
        <View style={styles.header}>
          <Text style={styles.name}>{name}</Text>
          {contactElements.length > 0 && (
            <View style={styles.contactLine}>
              {contactElements.map((item, idx) => (
                <React.Fragment key={idx}>
                  <View style={styles.contactItem}>
                    {renderIcon(item.type)}
                    <Text>{item.text}</Text>
                  </View>
                  {idx < contactElements.length - 1 && (
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
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionHeader}>Education</Text>
            {education.map((edu, idx) => (
              <View key={idx} style={styles.entry}>
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
                  <Text style={{ marginTop: 1, fontSize: 8.6 }}>
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
