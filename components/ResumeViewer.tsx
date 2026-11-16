"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { TailoredResume } from "@/lib/types";
import ResumePdf from "./ResumePdf";

// Dynamic import with ssr: false to prevent canvas/node errors in SSR
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--muted)",
          fontSize: 14,
        }}
      >
        Rendering preview...
      </div>
    ),
  }
);

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

interface ResumeViewerProps {
  tailored: TailoredResume;
  role: string;
}

export default function ResumeViewer({ tailored, role }: ResumeViewerProps) {
  const [isClient, setIsClient] = useState(false);
  const [downloadSaved, setDownloadSaved] = useState(false);

  useEffect(() => {
    setIsClient(true);
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

  return (
    <div>
      {/* Top action row on mobile / result toolbar */}
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
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>One-Page Resume</h2>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>
            Harvard style • Selectable text PDF
          </p>
        </div>

        {isClient && (
          <PDFDownloadLink
            document={<ResumePdf data={tailored.resume} />}
            fileName={fileName}
          >
            {({ loading }) => (
              <button
                type="button"
                className="btn-primary"
                onClick={handleDownloadClick}
                disabled={loading}
              >
                {downloadSaved ? "Saved ✓" : loading ? "Preparing PDF..." : "Download PDF"}
              </button>
            )}
          </PDFDownloadLink>
        )}
      </div>

      {/* PDF Viewer Sheet */}
      <div className="pdf-preview-sheet">
        {isClient && (
          <PDFViewer
            width="100%"
            height="100%"
            showToolbar={false}
            style={{ border: "none" }}
          >
            <ResumePdf data={tailored.resume} />
          </PDFViewer>
        )}
      </div>
    </div>
  );
}
