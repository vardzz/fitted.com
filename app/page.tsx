"use client";

import React, { useState, useRef } from "react";
import { Profile } from "@/lib/types";

export default function Home() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [statusText, setStatusText] = useState<string>("Ready");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Raw CV text and extracted profile
  const [cvText, setCvText] = useState<string>("");
  const [profile, setProfile] = useState<Profile | null>(null);

  // Paste text toggle
  const [showPasteFallback, setShowPasteFallback] = useState<boolean>(false);
  const [pastedText, setPastedText] = useState<string>("");

  // Drag & drop state
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processCvText = async (text: string) => {
    setStatusText("Extracting profile");
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv: text }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to extract profile.");
      }

      setProfile(data.profile);
      setCvText(text);
      setStatusText("Profile extracted");
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while extracting profile.");
      setStatusText("Error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setErrorMsg("Only PDF files are supported.");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setErrorMsg("File exceeds 4 MB limit. Please upload a smaller PDF.");
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);
    setStatusText("Reading your CV");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const parseRes = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      const parseData = await parseRes.json();
      if (!parseRes.ok) {
        throw new Error(
          parseData.error || "Failed to extract text from PDF."
        );
      }

      await processCvText(parseData.text);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process PDF.");
      setStatusText("Error");
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim()) {
      setErrorMsg("Please paste your CV text.");
      return;
    }
    processCvText(pastedText);
  };

  return (
    <div className={step === 3 ? "container-wide" : "container-narrow"}>
      {/* Header bar */}
      <header className="header-bar">
        <span className="wordmark">Fitted</span>
        <div className="status-chip" aria-live="polite">
          <span
            className={`status-dot ${
              isProcessing ? "active" : profile ? "ok" : ""
            }`}
          />
          <span>{statusText}</span>
        </div>
      </header>

      {/* Step 1: Upload or Paste CV */}
      {step === 1 && (
        <section>
          <h1 className="page-title">Tailor your resume in seconds</h1>
          <p className="page-tagline">Your CV, cut to fit the role.</p>

          <div
            className={`dropzone ${isDragOver ? "drag-active" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf,.pdf"
              style={{ display: "none" }}
              onChange={handleFileChange}
              disabled={isProcessing}
            />

            <p style={{ fontSize: 16, marginBottom: 16, color: "var(--ink)" }}>
              Drag and drop your CV as a PDF, or
            </p>

            <button
              type="button"
              className="btn-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Choose PDF"}
            </button>

            <div style={{ marginTop: 20 }}>
              <button
                type="button"
                className="link-btn"
                onClick={() => setShowPasteFallback(!showPasteFallback)}
              >
                {showPasteFallback
                  ? "Hide paste text box"
                  : "or paste your CV text"}
              </button>
            </div>
          </div>

          {/* Paste Text Fallback */}
          {showPasteFallback && (
            <form onSubmit={handlePasteSubmit} style={{ marginTop: 24 }}>
              <textarea
                rows={8}
                style={{ width: "100%", resize: "vertical" }}
                placeholder="Paste the plain text of your CV here..."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                disabled={isProcessing}
              />
              <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isProcessing || !pastedText.trim()}
                >
                  {isProcessing ? "Processing..." : "Submit text"}
                </button>
              </div>
            </form>
          )}

          {/* Inline Error Message */}
          {errorMsg && (
            <div style={{ marginTop: 16 }}>
              <p className="error-text">{errorMsg}</p>
              {errorMsg.includes("scan") && !showPasteFallback && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ marginTop: 10 }}
                  onClick={() => setShowPasteFallback(true)}
                >
                  Paste text instead
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {/* Step 2 Placeholder - will be expanded in Phase 3 */}
      {step === 2 && profile && (
        <section>
          <div className="card" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600 }}>{profile.name}</h2>
            <div className="summary-chips">
              <span className="count-chip">
                {profile.experience?.length || 0} Roles
              </span>
              <span className="count-chip">
                {profile.projects?.length || 0} Projects
              </span>
              <span className="count-chip">
                {profile.skills?.reduce((acc, cat) => acc + (cat.items?.length || 0), 0) || 0} Skills
              </span>
              <span className="count-chip">
                {profile.education?.length || 0} Education
              </span>
            </div>
          </div>
          <p style={{ color: "var(--muted)" }}>Proceeding to role question...</p>
        </section>
      )}
    </div>
  );
}
