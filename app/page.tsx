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
};

const BUILD_STEPS: BuildStep[] = [
  { id: "harvard", label: "Loading Harvard PDF layout engine" },
  { id: "verify", label: "Calibrating zero-fabrication guardrails" },
  { id: "parser", label: "Preparing CV parser & role matcher" },
  { id: "ready", label: "Fitted environment ready" },
];

const CV_PARSE_STEPS = [
  { id: "read", label: "Reading CV document & extracting text" },
  { id: "parse", label: "Extracting experience, projects & skills" },
  { id: "guardrails", label: "Verifying zero-fabrication factual boundaries" },
  { id: "ready", label: "Calibrating Harvard-standard profile format" },
];

const TAILOR_STEPS = [
  { id: "analyze", label: "Analyzing job description & core competency matrix" },
  { id: "select", label: "Selecting high-yield experiences from verified history" },
  { id: "xyz", label: "Drafting Harvard action-verb bullets (XYZ framework)" },
  { id: "verify", label: "Auditing against zero-fabrication strict guidelines" },
  { id: "pdf", label: "Rendering pixel-perfect Harvard one-page PDF" },
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

  // Live AI processing stepper state
  const [processingPhase, setProcessingPhase] = useState<"parsing" | "tailoring" | null>(null);
  const [processingStep, setProcessingStep] = useState<number>(0);
  const [processingElapsed, setProcessingElapsed] = useState<number>(0);

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
  const promptInputRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isTextareaMultiLine, setIsTextareaMultiLine] = useState<boolean>(false);

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

    const stepDelays = [420, 880, 1340, 1800];
    const timeouts: NodeJS.Timeout[] = [];

    stepDelays.forEach((delay, idx) => {
      const t = setTimeout(() => {
        setBuildStep(idx + 1);
        if (idx === stepDelays.length - 1) {
          clearInterval(timerInterval);
          setBuildElapsed(1.8);
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

  const startProcessingAnimation = (phase: "parsing" | "tailoring") => {
    setProcessingPhase(phase);
    setProcessingStep(0);
    setProcessingElapsed(0);

    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Math.round(((Date.now() - startTime) / 100)) / 10;
      setProcessingElapsed(elapsed);
    }, 100);

    const delays = phase === "parsing" ? [400, 1100, 1900] : [500, 1200, 2000, 2800];
    const timeouts: NodeJS.Timeout[] = delays.map((delay, idx) =>
      setTimeout(() => setProcessingStep(idx + 1), delay)
    );

    return () => {
      clearInterval(timer);
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

  const isExpanded = Boolean(attachedFile) || inputText.includes("\n") || isTextareaMultiLine;

  const adjustHeight = (text: string, file: File | null) => {
    const el = promptInputRef.current;
    if (!el) return;
    el.style.height = "auto";
    const scrollHeight = el.scrollHeight;
    const isTall = scrollHeight > 36;
    const shouldExpand = Boolean(file) || text.includes("\n") || isTall;
    setIsTextareaMultiLine(shouldExpand);

    if (shouldExpand) {
      el.style.height = `${Math.min(Math.max(scrollHeight, 38), 200)}px`;
    } else {
      el.style.height = "24px";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);
    adjustHeight(val, attachedFile);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if ((e.nativeEvent as any).isComposing) return;
      e.preventDefault();
      const canSubmit = !isProcessing && (step === 1 ? Boolean(attachedFile || inputText.trim()) : Boolean(inputText.trim()));
      if (canSubmit) {
        handleChatboxSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  useEffect(() => {
    adjustHeight(inputText, attachedFile);
  }, [inputText, attachedFile]);

  const processCvText = async (text: string, originalFileName?: string) => {
    setStatusText("Extracting profile");
    setIsProcessing(true);
    setErrorMsg(null);
    const stopAnim = startProcessingAnimation("parsing");

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
      stopAnim();
      setIsProcessing(false);
      setProcessingPhase(null);
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
    const stopAnim = startProcessingAnimation("parsing");

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

      stopAnim();
      await processCvText(parseData.text, file.name);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process PDF.");
      setStatusText("Error");
      setIsProcessing(false);
      setProcessingPhase(null);
      stopAnim();
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
    const stopAnim = startProcessingAnimation("tailoring");

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
      stopAnim();
      setIsProcessing(false);
      setProcessingPhase(null);
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
        const file = attachedFile;
        // Clear chatbox immediately
        setAttachedFile(null);
        setInputText("");
        setIsTextareaMultiLine(false);
        if (promptInputRef.current) {
          promptInputRef.current.style.height = "24px";
        }
        handleFileUpload(file);
        return;
      }

      // If user typed / pasted CV text
      const trimmed = inputText.trim();
      if (trimmed) {
        // Clear chatbox immediately
        setInputText("");
        setIsTextareaMultiLine(false);
        if (promptInputRef.current) {
          promptInputRef.current.style.height = "24px";
        }
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

      // Clear chatbox immediately
      setInputText("");
      setIsTextareaMultiLine(false);
      if (promptInputRef.current) {
        promptInputRef.current.style.height = "24px";
      }

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
      setAttachedFile(file);
      promptInputRef.current?.focus();
    }
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && step === 1) {
      setAttachedFile(file);
      promptInputRef.current?.focus();
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
    setProcessingPhase(null);
    setProcessingStep(0);
    setProcessingElapsed(0);
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
          </div>

          <div className={`eduardo-build-collapsible ${buildExpanded ? "expanded" : "collapsed"}`}>
            <div className="eduardo-build-collapsible-inner">
              <div className="eduardo-build-list">
                <div className="eduardo-build-line" />
                <div
                  className="eduardo-build-progress-line"
                  style={{
                    height: `${Math.min(
                      100,
                      Math.max(0, (buildStep / Math.max(1, BUILD_STEPS.length - 1)) * 100)
                    )}%`,
                  }}
                />
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
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Start Interface Header (Revealed once build finishes) */}
      {step === 1 && messages.length === 0 && isBuildComplete && (
        <div className="claude-onboarding eduardo-content-reveal">
          <div className="claude-hero-title-row stagger-1">
            <h1 className="claude-hero-title">Let&apos;s fit your CV</h1>
          </div>
          <p className="claude-hero-subtitle stagger-2">
            Attach your CV as a PDF or type your background to craft an academic Harvard-style one-page resume.
          </p>

          <div className="claude-suggestion-chips stagger-3">
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

              {m.fileName ? (
                <div className="chat-file-bubble">
                  <div className="chat-file-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div className="chat-file-info">
                    <span className="chat-file-name">{m.fileName}</span>
                    {m.fileSize && (
                      <span className="chat-file-size">({m.fileSize})</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className={`chat-bubble ${m.sender === "user" ? "user" : ""}`}>
                  <p style={{ fontSize: 15, lineHeight: 1.5, margin: 0, whiteSpace: "pre-wrap" }}>
                    {m.text}
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Active AI Processing Stepper when AI is calculating/extracting */}
          {isProcessing && (
            <div className="chat-message-row">
              <div className="chat-avatar">AI</div>
              <div className="ai-processing-card">
                <div className="ai-processing-header">
                  <div className="ai-processing-title-row">
                    <div className="ai-typing-dots">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                    <span className="ai-processing-title">
                      {processingPhase === "parsing"
                        ? "Analyzing CV & Extracting Profile"
                        : "Tailoring Harvard One-Page CV"}
                    </span>
                  </div>
                  <span className="ai-processing-timer">
                    {processingElapsed.toFixed(1)}s
                  </span>
                </div>

                <div className="eduardo-build-list">
                  <div className="eduardo-build-line" />
                  <div
                    className="eduardo-build-progress-line"
                    style={{
                      height: `${Math.min(
                        100,
                        Math.max(
                          0,
                          (processingStep /
                            Math.max(
                              1,
                              (processingPhase === "parsing"
                                ? CV_PARSE_STEPS.length
                                : TAILOR_STEPS.length) - 1
                            )) *
                            100
                        )
                      )}%`,
                    }}
                  />
                  {(processingPhase === "parsing" ? CV_PARSE_STEPS : TAILOR_STEPS).map(
                    (s, idx) => {
                      const isDone = processingStep > idx;
                      const isActive = processingStep === idx;
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
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Extracted Profile Details Card (Shown directly in chat thread like Image 2) */}
          {profile && (
            <div className="chat-message-row">
              <div className="chat-avatar">AI</div>
              <div className="ai-result-summary-card">
                <div className="timeline-header">
                  <span className="timeline-title">
                    <span style={{ fontWeight: 600 }}>✓</span> Processed CV in seconds
                  </span>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="timeline-restart-btn"
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
                </div>
              </div>
            </div>
          )}

          {/* Anchor for auto-scroll */}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Chatbox: inline below hero at start (only when build completes), fixed at bottom once message is sent */}
      {step !== 3 && (messages.length > 0 || isBuildComplete) && (
        <div
          className={
            messages.length > 0
              ? "chatbox-fixed-bottom"
              : "prompt-bar-container eduardo-content-reveal stagger-4"
          }
        >
          <div className={messages.length > 0 ? "chatbox-fixed-inner" : ""}>
            <form
              onSubmit={handleChatboxSubmit}
              className={`prompt-bar ${isExpanded ? "expanded" : ""} ${isDragOver ? "drag-over" : ""}`}
            >
              {/* Attached File Preview Card at the top (if attached) */}
              {step === 1 && attachedFile && (
                <div className="prompt-attached-card">
                  <div className="prompt-attached-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div className="prompt-attached-info">
                    <span className="prompt-attached-name">{attachedFile.name}</span>
                    <span className="prompt-attached-size">{formatFileSize(attachedFile.size)}</span>
                  </div>
                  <button
                    type="button"
                    className="prompt-attached-remove"
                    onClick={() => setAttachedFile(null)}
                    title="Remove attached file"
                    aria-label="Remove attached file"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Main Input Row */}
              <div className="prompt-input-row">
                {!isExpanded && step === 1 && (
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

                <textarea
                  ref={promptInputRef}
                  rows={1}
                  className="prompt-textarea"
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={isProcessing}
                  placeholder={
                    step === 1
                      ? attachedFile
                        ? "Add notes or press ↵ to process CV..."
                        : "Attach CV PDF or type/paste your CV text here..."
                      : clarifyingQuestion
                      ? "Type your clarification..."
                      : "e.g. Senior Frontend Engineer, Full Stack Developer..."
                  }
                />

                {!isExpanded && (
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
                )}
              </div>

              {/* Bottom Toolbar Row when Expanded */}
              {isExpanded && (
                <div className="prompt-bottom-toolbar">
                  <div className="prompt-toolbar-left">
                    {step === 1 && (
                      <button
                        type="button"
                        className="prompt-attach-btn expanded-btn"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                        title="Attach CV PDF file"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="prompt-toolbar-right">
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
                  </div>
                </div>
              )}
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
