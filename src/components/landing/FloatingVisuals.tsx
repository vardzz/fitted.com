import React from "react";

export default function FloatingVisuals() {
  return (
    <div className="hero-visuals-container" aria-hidden="true">
      {/* 1. Elegant Orbit Arc Swoop */}
      <svg
        className="hero-orbit-svg"
        viewBox="0 0 1200 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 80 480 C 380 120, 820 60, 1140 380"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="6 6"
          opacity="0.35"
        />
        <path
          d="M 140 440 C 440 180, 780 120, 1060 320"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.25"
        />
      </svg>

      {/* Floating 4-Point Sparkle 1 (Near Title / Upper Right) */}
      <div className="hero-sparkle hero-sparkle-primary">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#0a0a0a">
          <path d="M12 0 C12 6.627 6.627 12 0 12 C6.627 12 12 17.373 12 24 C12 17.373 17.373 12 24 12 C17.373 12 12 6.627 12 0 Z" />
        </svg>
      </div>

      {/* Floating 4-Point Sparkle 2 (Subtle, Left Orbit) */}
      <div className="hero-sparkle hero-sparkle-secondary">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="#0a0a0a">
          <path d="M12 0 C12 6.627 6.627 12 0 12 C6.627 12 12 17.373 12 24 C12 17.373 17.373 12 24 12 C17.373 12 12 6.627 12 0 Z" />
        </svg>
      </div>

      {/* 2. Crisp Foreground 3D Floating Harvard Resume */}
      <div className="hero-sheet hero-sheet-fg">
        <div className="hero-sheet-inner">
          <div className="hero-sheet-header">
            <span className="hero-sheet-name">John Doe</span>
            <div className="hero-sheet-contact-line">
              <span className="hero-skeleton-bar bar-xs" />
              <span className="hero-skeleton-dot" />
              <span className="hero-skeleton-bar bar-xs" />
              <span className="hero-skeleton-dot" />
              <span className="hero-skeleton-bar bar-xs" />
            </div>
          </div>

          <div className="hero-sheet-section">
            <div className="hero-sheet-section-head">
              <span className="hero-sheet-section-title">Experience</span>
              <span className="hero-sheet-date">2019 - 2022</span>
            </div>
            <div className="hero-sheet-subline">
              <span className="hero-skeleton-bar bar-sm" />
            </div>
            <div className="hero-sheet-bullets">
              <div className="hero-sheet-bullet-row">
                <span className="hero-bullet-dot" />
                <span className="hero-skeleton-bar bar-full" />
              </div>
              <div className="hero-sheet-bullet-row">
                <span className="hero-bullet-dot" />
                <span className="hero-skeleton-bar bar-lg" />
              </div>
              <div className="hero-sheet-bullet-row">
                <span className="hero-bullet-dot" />
                <span className="hero-skeleton-bar bar-md" />
              </div>
            </div>
          </div>

          <div className="hero-sheet-section">
            <div className="hero-sheet-section-head">
              <span className="hero-sheet-section-title">Education</span>
              <span className="hero-sheet-date">2015 - 2019</span>
            </div>
            <div className="hero-sheet-bullets">
              <div className="hero-sheet-bullet-row">
                <span className="hero-bullet-dot" />
                <span className="hero-skeleton-bar bar-md" />
              </div>
              <div className="hero-sheet-bullet-row">
                <span className="hero-bullet-dot" />
                <span className="hero-skeleton-bar bar-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Atmospheric Blurred Background Sheet (Depth of Field) */}
      <div className="hero-sheet hero-sheet-bg">
        <div className="hero-sheet-inner">
          <div className="hero-sheet-header">
            <span className="hero-sheet-name">Jane Smith</span>
            <div className="hero-sheet-contact-line">
              <span className="hero-skeleton-bar bar-sm" />
            </div>
          </div>
          <div className="hero-sheet-section">
            <span className="hero-sheet-section-title">Experience</span>
            <div className="hero-sheet-bullets">
              <div className="hero-sheet-bullet-row">
                <span className="hero-bullet-dot" />
                <span className="hero-skeleton-bar bar-full" />
              </div>
              <div className="hero-sheet-bullet-row">
                <span className="hero-bullet-dot" />
                <span className="hero-skeleton-bar bar-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
