"use client";

import React, { useState, useEffect } from "react";
import type { TailoredResume } from "@/lib/types";
import HarvardPaper from "./HarvardPaper";

interface ResumeViewerProps {
  tailored: TailoredResume;
  role: string;
}

export default function ResumeViewer({ tailored, role }: ResumeViewerProps) {
  const [isClient, setIsClient] = useState(false);
  const [downloadSaved, setDownloadSaved] = useState(false);
  const [pdfModules, setPdfModules] = useState<{
    PDFViewer: any;
    PDFDownloadLink: any;
    ResumePdf: any;
  } | null>(null);

  useEffect(() => {
    setIsClient(true);
    // Pure client-side load to prevent any Next.js server webpack chunk collisions
    Promise.all([
      import("@react-pdf/renderer"),
      import("./ResumePdf"),
    ])
      .then(([rpdf, resumePdfMod]) => {
        setPdfModules({
          PDFViewer: rpdf.PDFViewer,
          PDFDownloadLink: rpdf.PDFDownloadLink,
          ResumePdf: resumePdfMod.default,
        });
      })
      .catch((err) => {
        console.error("Failed to load PDF renderer:", err);
      });
  }, []);

  if (!tailored.resume) {
    return <div>No resume generated.</div>;
  }

  const safeName = (tailored.resume.name || "Candidate").replace(/[^a-zA-Z0-9]/g, "_");
  const safeRole = (role || "Role").replace(/[^a-zA-Z0-9]/g, "_");
  const fileName = `${safeName}-${safeRole}-Resume.pdf`;

  const handleDownloadClick = () => {
    setDownloadSaved(true);
    setTimeout(() => setDownloadSaved(false), 2000);
  };

  const PDFViewer = pdfModules?.PDFViewer;
  const PDFDownloadLink = pdfModules?.PDFDownloadLink;
  const ResumePdf = pdfModules?.ResumePdf;

  return (
    <div>
      {/* Top action bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>
            Tailored Harvard Resume
          </h2>
          <p style={{ fontSize: 13, color: "var(--color-fg-muted)" }}>
            A4 • One-page • Selectable text
          </p>
        </div>

        {isClient && PDFDownloadLink && ResumePdf && (
          <PDFDownloadLink
            document={<ResumePdf data={tailored.resume} />}
            fileName={fileName}
          >
            {({ loading }: { loading: boolean }) => (
              <button
                type="button"
                className="btn-primary"
                onClick={handleDownloadClick}
                disabled={loading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 18px",
                  fontSize: 13.5,
                  fontWeight: 500,
                  borderRadius: "var(--radius-full)",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>{downloadSaved ? "Saved ✓" : loading ? "Preparing PDF..." : "Download PDF"}</span>
              </button>
            )}
          </PDFDownloadLink>
        )}
      </div>

      {/* Full-Length Harvard Resume Sheet (Zero Inner Scroll) */}
      <HarvardPaper data={tailored.resume} />
    </div>
  );
}
