"use client";

import React, { useState, useRef, useEffect } from "react";
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

type ChatMessage = {
  id: string;
  sender: "ai" | "user";
  text?: string;
  fileName?: string;
  fileSize?: string;
};

type BuildStep = {
  id: string;
  label: string;
  badges?: Array<{
    id: string;
    dotColor: string;
    flag: string;
    name: string;
    tag?: string;
  }>;
  moreText?: string;
};

const BUILD_STEPS: BuildStep[] = [
  { id: "read", label: "Reading profile" },
  { id: "photo", label: "Loading Harvard PDF layout" },
  { id: "intro", label: "Calibrating zero-fabrication rules" },
  {
    id: "connected",
    label: "Connected · 4 here",
    badges: [
      { id: "b1", dotColor: "#f97316", flag: "🇵🇭", name: "Tangerine Bison", tag: "you" },
      { id: "b2", dotColor: "#a855f7", flag: "🇨🇦", name: "Plum Lemur" },
      { id: "b3", dotColor: "#3b82f6", flag: "🇵🇭", name: "Azure Crane" },
    ],
    moreText: "+1 more",
  },
  { id: "details", label: "Drawing details" },
];

export default function Home() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [statusText, setStatusText] = useState<string>("Ready");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Eduardo Alba Onboarding Build Animation state
  const [buildStep, setBuildStep] = useState<number>(0);
  const [isBuildComplete, setIsBuildComplete] = useState<boolean>(false);
  const [buildElapsed, setBuildElapsed] = useState<number>(0);
  const [buildExpanded, setBuildExpanded] = useState<boolean>(true);

  // Raw CV text and extracted profile
  const [cvText, setCvText] = useState<string>("");
  const [profile, setProfile] = useState<Profile | null>(null);

  // Chat message thread
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Current chatbox inputs
  const [inputText, setInputText] = useState<string>("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  // Target Role
  const [roleInput, setRoleInput] = useState<string>("");

  // Clarification
  const [clarifyingQuestion, setClarifyingQuestion] = useState<string | null>(null);

  // Tailored Result
  const [tailoredData, setTailoredData] = useState<TailoredResume | null>(null);

  // Drag & drop
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const promptInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const startBuildAnimation = () => {
    setBuildStep(0);
    setIsBuildComplete(false);
    setBuildElapsed(0);
    setBuildExpanded(true);

    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      const elapsed = Math.min(3, Math.round(((Date.now() - startTime) / 1000) * 10) / 10);
      setBuildElapsed(elapsed);
    }, 100);

    const stepDelays = [350, 750, 1150, 1650, 2100];
    const timeouts: NodeJS.Timeout[] = [];

    stepDelays.forEach((delay, idx) => {
      const t = setTimeout(() => {
        setBuildStep(idx + 1);
        if (idx === stepDelays.length - 1) {
          clearInterval(timerInterval);
          setBuildElapsed(2.1);
          setIsBuildComplete(true);
        }
      }, delay);
      timeouts.push(t);
    });

    return () => {
      clearInterval(timerInterval);
      timeouts.forEach(clearTimeout);
    };
  };

  useEffect(() => {
    const cleanup = startBuildAnimation();
    return cleanup;
  }, []);

  useEffect(() => {
    if (isBuildComplete && promptInputRef.current) {
      promptInputRef.current.focus();
    }
  }, [isBuildComplete]);

  useEffect(() => {
    if (promptInputRef.current && isBuildComplete) {
      promptInputRef.current.focus();
    }
  }, [step, clarifyingQuestion, messages.length, isBuildComplete]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isProcessing, profile]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processCvText = async (text: string, originalFileName?: string) => {
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

      const extractedProfile: Profile = data.profile;
      setProfile(extractedProfile);
      setCvText(text);
      setStatusText("Profile extracted");
      setStep(2);

      const firstName = extractedProfile.name
        ? extractedProfile.name.split(" ")[0]
        : "there";

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-ask-role-${Date.now()}`,
          sender: "ai",
          text: `Hey ${firstName}, I've loaded your verified background. What role are you applying for?`,
        },
      ]);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while extracting profile.");
      setStatusText("Error");
    } finally {
      setIsProcessing(false);
      setAttachedFile(null);
      setInputText("");
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

    // Add user message to chat thread
    setMessages((prev) => [
      ...prev,
      {
        id: `user-file-${Date.now()}`,
        sender: "user",
        fileName: file.name,
        fileSize: formatFileSize(file.size),
      },
    ]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const parseRes = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      const parseData = await parseRes.json();
      if (!parseRes.ok) {
        throw new Error(parseData.error || "Failed to extract text from PDF.");
      }

      await processCvText(parseData.text, file.name);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process PDF.");
      setStatusText("Error");
      setIsProcessing(false);
      setAttachedFile(null);
      setInputText("");
    }
  };

  const handleTailorSubmit = async (activeRole: string, clarificationValue?: string) => {
    if (!activeRole.trim()) {
      setErrorMsg("Please enter the role you are applying for.");
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);
    setStatusText(`Tailoring for ${activeRole.trim()}`);

    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          role: activeRole.trim(),
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

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-clarify-${Date.now()}`,
            sender: "ai",
            text: `Got it! One quick question to tailor the bullets effectively: "${tailored.clarifying_question}"`,
          },
        ]);
      } else {
        setTailoredData(tailored);
        setClarifyingQuestion(null);
        setStatusText("Ready");
        setStep(3);

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-ready-${Date.now()}`,
            sender: "ai",
            text: `Your tailored one-page Harvard-style resume for ${activeRole.trim()} is ready!`,
          },
        ]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to tailor resume.");
      setStatusText("Error");
    } finally {
      setIsProcessing(false);
      setInputText("");
    }
  };

  // Main chatbox submit handler
  const handleChatboxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    if (step === 1) {
      // If user attached a file, send the file
      if (attachedFile) {
        handleFileUpload(attachedFile);
        return;
      }

      // If user typed / pasted CV text
      const trimmed = inputText.trim();
      if (trimmed) {
        setMessages((prev) => [
          ...prev,
          {
            id: `user-text-${Date.now()}`,
            sender: "user",
            text: trimmed.length > 180 ? `${trimmed.substring(0, 180)}...` : trimmed,
          },
        ]);
        processCvText(trimmed);
      }
    } else if (step === 2) {
      const trimmed = inputText.trim();
      if (!trimmed) return;

      if (clarifyingQuestion) {
        setMessages((prev) => [
          ...prev,
          {
            id: `user-clarify-${Date.now()}`,
            sender: "user",
            text: trimmed,
          },
        ]);
        handleTailorSubmit(roleInput, trimmed);
      } else {
        setRoleInput(trimmed);
        setMessages((prev) => [
          ...prev,
          {
            id: `user-role-${Date.now()}`,
            sender: "user",
            text: `Target Role: ${trimmed}`,
          },
        ]);
        handleTailorSubmit(trimmed);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && step === 1) {
      handleFileUpload(file);
    }
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && step === 1) {
      handleFileUpload(file);
    }
  };

  const handleReset = () => {
    setStep(1);
    setProfile(null);
    setCvText("");
    setTailoredData(null);
    setRoleInput("");
    setClarifyingQuestion(null);
    setInputText("");
    setAttachedFile(null);
    setStatusText("Ready");
    setErrorMsg(null);
    setMessages([]);
    startBuildAnimation();
  };

  return (
    <div
      className={
        step === 3
          ? "container-wide"
          : messages.length === 0
          ? "container-centered"
          : "container-narrow has-chat"
      }
      onDragOver={(e) => {
        e.preventDefault();
        if (step === 1) setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Hidden file input for uploading CV PDF */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,application/pdf"
        style={{ display: "none" }}
        onChange={handleFileSelect}
        disabled={isProcessing}
      />

      {/* Eduardo Alba Build Animation on initial load */}
      {step === 1 && messages.length === 0 && (
        <div className="eduardo-build-container">
          <div className="eduardo-build-header">
            <button
              type="button"
              className="eduardo-build-toggle"
              onClick={() => setBuildExpanded((prev) => !prev)}
              aria-label="Toggle build details"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`eduardo-chevron ${buildExpanded ? "" : "collapsed"}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <span>
                {isBuildComplete
                  ? `Built in ${Math.round(buildElapsed || 2)}s`
                  : `Building in ${buildElapsed.toFixed(1)}s`}
              </span>
            </button>
            <button
              type="button"
              className="eduardo-replay-btn"
              onClick={startBuildAnimation}
            >
              REPLAY
            </button>
          </div>

          {buildExpanded && (
            <div className="eduardo-build-list">
              <div className="eduardo-build-line" />
              {BUILD_STEPS.map((s, idx) => {
                const isDone = buildStep > idx;
                const isActive = buildStep === idx && !isBuildComplete;
                return (
                  <div key={s.id} className="eduardo-build-item">
                    <div
                      className={`eduardo-build-dot ${
                        isActive ? "active" : isDone ? "done" : ""
                      }`}
                    />
                    <span
                      className={`eduardo-build-label ${
                        isActive ? "active" : isDone ? "done" : "pending"
                      }`}
                    >
                      {s.label}
                    </span>
                    {s.badges && (isDone || isActive) && (
                      <div className="eduardo-badges-row">
                        {s.badges.map((b) => (
                          <span key={b.id} className="eduardo-badge">
                            <span
                              className="live-dot"
                              style={{ backgroundColor: b.dotColor }}
                            />
                            <span style={{ fontSize: 13 }}>{b.flag}</span>
                            <span>{b.name}</span>
                            {b.tag && <span className="badge-tag">{b.tag}</span>}
                          </span>
                        ))}
                        {s.moreText && (
                          <span className="eduardo-more-text">{s.moreText}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Start Interface Header (Revealed once build finishes) */}
      {step === 1 && messages.length === 0 && isBuildComplete && (
        <div className="claude-onboarding eduardo-content-reveal">
          <div className="claude-hero-title-row">
            <h1 className="claude-hero-title">Let&apos;s fit your CV</h1>
          </div>
          <p className="claude-hero-subtitle">
            Attach your CV as a PDF or type your background to craft an academic Harvard-style one-page resume.
          </p>

          <div className="claude-suggestion-chips">
            <button
              type="button"
              className="claude-chip"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span>Attach CV PDF</span>
            </button>
            <button
              type="button"
              className="claude-chip"
              onClick={() => promptInputRef.current?.focus()}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <span>Type / paste experience</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Conversation Stream */}
      {messages.length > 0 && (
        <div className="chat-thread">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`chat-message-row ${m.sender === "user" ? "user" : ""}`}
            >
              {m.sender === "ai" && <div className="chat-avatar">AI</div>}

              <div className={`chat-bubble ${m.sender === "user" ? "user" : ""}`}>
                {m.fileName ? (
                  <div className="chat-file-pill">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span>{m.fileName}</span>
                    {m.fileSize && (
                      <span style={{ opacity: 0.7, fontSize: 11 }}>({m.fileSize})</span>
                    )}
                  </div>
                ) : (
                  <p style={{ fontSize: 15, lineHeight: 1.5, margin: 0, whiteSpace: "pre-wrap" }}>
                    {m.text}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Typing / Thinking Ellipsis Indicator when AI is preparing an answer */}
          {isProcessing && (
            <div className="chat-message-row">
              <div className="chat-avatar">AI</div>
              <div className="chat-bubble typing-bubble" title="AI is thinking...">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}

          {/* Anchor for auto-scroll */}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Step Timeline Tree (Eduardo Alba Inspo) */}
      {profile && (
        <div className="timeline-tree">
          <div className="timeline-header">
            <span className="timeline-title">
              <span>✓</span> Processed CV in seconds
            </span>
            <button
              type="button"
              onClick={handleReset}
              style={{
                background: "none",
                border: "none",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--color-fg-muted)",
                letterSpacing: "0.05em",
                cursor: "pointer",
              }}
            >
              RESTART
            </button>
          </div>

          <div className="timeline-list">
            <div className="timeline-line" />

            <div className="timeline-item">
              <span className="timeline-dot done" />
              <span>Reading profile text</span>
            </div>

            <div className="timeline-item">
              <span className="timeline-dot done" />
              <span>
                Extracted {profile.experience?.length || 0} roles • {profile.projects?.length || 0} projects • {profile.skills?.reduce((a, c) => a + (c.items?.length || 0), 0) || 0} skills
              </span>
            </div>

            <div className="timeline-item">
              <span className="timeline-dot done" />
              <span className="timeline-badge">
                <span style={{ color: "var(--color-live)", fontSize: 10 }}>●</span>
                <span>{profile.name}</span>
                <span style={{ color: "var(--color-fg-muted)" }}>candidate</span>
              </span>
            </div>

            {isProcessing ? (
              <div className="timeline-item">
                <span className="timeline-dot active" />
                <span style={{ color: "var(--color-accent-orange)", fontWeight: 500 }}>
                  Tailoring bullets and verifying zero fabrication...
                </span>
              </div>
            ) : step === 3 ? (
              <div className="timeline-item">
                <span className="timeline-dot done" />
                <span style={{ color: "var(--color-live)", fontWeight: 500 }}>
                  One-page Harvard PDF generated
                </span>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Chatbox: inline below hero at start (only when build completes), fixed at bottom once message is sent */}
      {step !== 3 && (messages.length > 0 || isBuildComplete) && (
        <div
          className={
            messages.length > 0
              ? "chatbox-fixed-bottom"
              : "prompt-bar-container eduardo-content-reveal"
          }
        >
          <div className={messages.length > 0 ? "chatbox-fixed-inner" : ""}>
            <form
              onSubmit={handleChatboxSubmit}
              className={`prompt-bar ${isDragOver ? "drag-over" : ""}`}
            >
              {/* Attachment Button for Step 1 */}
              {step === 1 && (
                <button
                  type="button"
                  className="prompt-attach-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  title="Attach CV PDF file"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </button>
              )}

              {/* Attached File Pill Badge inside the chatbox */}
              {step === 1 && attachedFile && (
                <div className="attached-file-badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span>{attachedFile.name}</span>
                  <button
                    type="button"
                    className="attached-file-remove"
                    onClick={() => setAttachedFile(null)}
                    title="Remove file"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Text Input */}
              <input
                ref={promptInputRef}
                type="text"
                className="prompt-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isProcessing}
                placeholder={
                  step === 1
                    ? attachedFile
                      ? "Press ↵ or send to parse your CV..."
                      : "Attach CV PDF or type/paste your CV text here..."
                    : clarifyingQuestion
                    ? "Type your clarification..."
                    : "e.g. Senior Frontend Engineer, Full Stack Developer..."
                }
              />

              {/* Orange Circle Submit Button with Upward Arrow */}
              <button
                type="submit"
                className="prompt-submit-btn"
                disabled={
                  isProcessing ||
                  (step === 1 ? !attachedFile && !inputText.trim() : !inputText.trim())
                }
                title="Send"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </button>
            </form>

            {errorMsg && (
              <p className="error-text" style={{ textAlign: "center", marginTop: 12 }}>
                {errorMsg}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Result View */}
      {step === 3 && tailoredData && (
        <section style={{ marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setStep(2);
                setInputText("");
              }}
            >
              ← Edit Target Role
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
                  Condensed or omitted to ensure a single-page Harvard layout.
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
