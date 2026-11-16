"use client";

import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Profile, TailoredResume } from "@/lib/types";

const ResumeViewer = dynamic(() => import("@/components/ResumeViewer"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        padding: 64,
        textAlign: "center",
        color: "var(--color-fg-muted)",
        fontSize: 14,
        fontFamily: "var(--font-mono)",
      }}
    >
      Rendering PDF document...
    </div>
  ),
});

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

  // Step 2: Role and Job Posting
  const [roleInput, setRoleInput] = useState<string>("");
  const [showJobPosting, setShowJobPosting] = useState<boolean>(false);
  const [jobPostingInput, setJobPostingInput] = useState<string>("");

  // Clarification state
  const [clarifyingQuestion, setClarifyingQuestion] = useState<string | null>(null);
  const [clarificationAnswer, setClarificationAnswer] = useState<string>("");

  // Step 3: Tailored result
  const [tailoredData, setTailoredData] = useState<TailoredResume | null>(null);

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

  const handleTailorSubmit = async (clarificationValue?: string) => {
    if (!roleInput.trim()) {
      setErrorMsg("Please enter the role you are applying for.");
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);
    setStatusText(`Tailoring for ${roleInput.trim()}`);

    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          role: roleInput.trim(),
          posting: jobPostingInput.trim() || undefined,
          clarification: clarificationValue || undefined,
          cvText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to tailor resume.");
      }

      const tailored: TailoredResume = data.tailored;

      if (tailored.needs_clarification && tailored.clarifying_question) {
        setClarifyingQuestion(tailored.clarifying_question);
        setStatusText("Clarification needed");
      } else {
        setTailoredData(tailored);
        setClarifyingQuestion(null);
        setStatusText("Ready");
        setStep(3);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to tailor resume.");
      setStatusText("Error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setProfile(null);
    setCvText("");
    setTailoredData(null);
    setRoleInput("");
    setJobPostingInput("");
    setClarifyingQuestion(null);
    setClarificationAnswer("");
    setStatusText("Ready");
    setErrorMsg(null);
  };

  return (
    <div className={step === 3 ? "container-wide" : "container-narrow"}>
      {/* Header bar */}
      <header className="header-bar">
        <div className="brand-wrapper">
          <span
            className="wordmark"
            onClick={handleReset}
            style={{ cursor: "pointer" }}
          >
            Fitted
          </span>
          <span className="brand-tag">one-page</span>
        </div>

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
          <h1 className="page-title">Your CV, cut to fit the role.</h1>
          <p className="page-tagline">
            Upload your CV. We extract facts, tailor bullets to your target role, and render an academic Harvard-style one-page PDF.
          </p>

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

            {/* Subtle Document Icon */}
            <div style={{ marginBottom: 14, color: "var(--color-fg-muted)" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto" }}>
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
            </div>

            <p style={{ fontSize: 15, marginBottom: 16, color: "var(--color-fg)", fontWeight: 500 }}>
              Drop your CV PDF here, or
            </p>

            <button
              type="button"
              className="btn-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Choose PDF file"}
            </button>

            <div style={{ marginTop: 20 }}>
              <button
                type="button"
                className="link-btn"
                onClick={() => setShowPasteFallback(!showPasteFallback)}
              >
                {showPasteFallback
                  ? "Hide paste textarea"
                  : "or paste your CV plain text"}
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

      {/* Step 2: Profile Summary & Target Role */}
      {step === 2 && profile && (
        <section>
          {/* Profile Summary Card */}
          <div className="card" style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>{profile.name}</h2>
              <span style={{ fontSize: 13, color: "var(--color-fg-muted)", fontFamily: "var(--font-mono)" }}>
                {profile.contact?.location || profile.contact?.email || ""}
              </span>
            </div>

            <div className="summary-chips">
              <span className="count-chip">
                {profile.experience?.length || 0} Roles
              </span>
              <span className="count-chip">
                {profile.projects?.length || 0} Projects
              </span>
              <span className="count-chip">
                {profile.skills?.reduce(
                  (acc, cat) => acc + (cat.items?.length || 0),
                  0
                ) || 0}{" "}
                Skills
              </span>
              <span className="count-chip">
                {profile.education?.length || 0} Education
              </span>
              {profile.certifications && profile.certifications.length > 0 && (
                <span className="count-chip">
                  {profile.certifications.length} Certifications
                </span>
              )}
            </div>
          </div>

          {/* Clarifying Question Modal/Card */}
          {clarifyingQuestion ? (
            <div className="card" style={{ borderLeft: "4px solid var(--color-accent)" }}>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8, letterSpacing: "-0.01em" }}>
                One quick clarification
              </h3>
              <p style={{ color: "var(--color-fg)", marginBottom: 16, fontSize: 15 }}>
                {clarifyingQuestion}
              </p>
              <input
                type="text"
                style={{ width: "100%", marginBottom: 16 }}
                placeholder="Your answer (e.g. Frontend focused on React and performance)..."
                value={clarificationAnswer}
                onChange={(e) => setClarificationAnswer(e.target.value)}
                disabled={isProcessing}
                autoFocus
              />
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleTailorSubmit(clarificationAnswer)}
                  disabled={isProcessing || !clarificationAnswer.trim()}
                >
                  {isProcessing ? "Tailoring..." : "Continue"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16, letterSpacing: "-0.02em" }}>
                What role are you applying for?
              </h2>

              <input
                type="text"
                style={{ width: "100%", marginBottom: 16 }}
                placeholder="e.g. Staff Frontend Engineer, Product Designer..."
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                disabled={isProcessing}
                autoFocus
              />

              <div style={{ marginBottom: 16 }}>
                <button
                  type="button"
                  className="link-btn"
                  style={{ marginTop: 0 }}
                  onClick={() => setShowJobPosting(!showJobPosting)}
                >
                  {showJobPosting
                    ? "Hide job description"
                    : "+ Paste a job description (optional)"}
                </button>
              </div>

              {showJobPosting && (
                <div style={{ marginBottom: 20 }}>
                  <textarea
                    rows={6}
                    style={{ width: "100%", resize: "vertical" }}
                    placeholder="Paste the job description or requirements here to tailor specifically against them..."
                    value={jobPostingInput}
                    onChange={(e) => setJobPostingInput(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setStep(1)}
                  disabled={isProcessing}
                >
                  Back
                </button>

                <button
                  type="button"
                  className="btn-primary btn-accent"
                  onClick={() => handleTailorSubmit()}
                  disabled={isProcessing || !roleInput.trim()}
                >
                  {isProcessing ? "Tailoring..." : "Tailor my resume"}
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <p className="error-text" style={{ marginTop: 16 }}>
              {errorMsg}
            </p>
          )}
        </section>
      )}

      {/* Step 3: Result View */}
      {step === 3 && tailoredData && (
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setStep(2)}
            >
              ← Edit Role
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleReset}
            >
              Upload New CV
            </button>
          </div>

          <div className="result-grid">
            {/* Left Column: PDF Preview */}
            <div>
              <ResumeViewer tailored={tailoredData} role={roleInput} />
            </div>

            {/* Right Column: Dropped items & Gaps panels */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* What I cut and why */}
              <div className="card">
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, letterSpacing: "-0.01em" }}>
                  What I cut and why
                </h3>
                <p style={{ fontSize: 13, color: "var(--color-fg-muted)", marginBottom: 16 }}>
                  Condensed or omitted to ensure an academic one-page layout.
                </p>

                {tailoredData.dropped && tailoredData.dropped.length > 0 ? (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {tailoredData.dropped.map((cut, idx) => (
                      <li
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          fontSize: 13.5,
                          lineHeight: 1.5,
                          marginBottom: 10,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            backgroundColor: "var(--color-fg-muted)",
                            marginTop: 7,
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <strong>{cut.item}:</strong>{" "}
                          <span style={{ color: "var(--color-fg-muted)" }}>
                            {cut.reason}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: 13.5, color: "var(--color-fg-muted)" }}>
                    All profile items were fitted into the one-page resume.
                  </p>
                )}
              </div>

              {/* Not shown in your CV (Gaps) */}
              <div className="card">
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, letterSpacing: "-0.01em" }}>
                  Not shown in your CV
                </h3>
                <p style={{ fontSize: 13, color: "var(--color-fg-muted)", marginBottom: 16 }}>
                  Role requirements not found in your CV. We never fabricate facts.
                </p>

                {tailoredData.gaps && tailoredData.gaps.length > 0 ? (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {tailoredData.gaps.map((gap, idx) => (
                      <li
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          fontSize: 13.5,
                          lineHeight: 1.5,
                          marginBottom: 8,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            backgroundColor: "var(--color-warn)",
                            marginTop: 7,
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ color: "var(--color-fg)" }}>{gap}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: 13.5, color: "var(--color-live)", fontWeight: 500 }}>
                    No missing requirements identified for this role!
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
