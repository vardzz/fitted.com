import React from "react";

export default function FloatingVisuals() {
  return (
    <div className="hero-visuals-container" aria-hidden="true">
      {/* 1. Orbit Arc SVG Path matching the exact swooping trajectory */}
      <svg
        className="hero-orbit-svg"
        viewBox="0 0 1440 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M -40 620 C 260 280, 520 80, 1140 130 S 1460 400, 1220 640"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeDasharray="4 4"
          opacity="0.32"
        />
        <path
          d="M 0 600 C 300 240, 560 60, 1180 110 S 1490 380, 1260 620"
          stroke="currentColor"
          strokeWidth="0.8"
          opacity="0.22"
        />
      </svg>

      {/* Sparkle 1: Top Right on Orbit Line */}
      <div className="hero-sparkle hero-sparkle-top-right">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#0a0a0a">
          <path d="M12 0 C12 6.627 6.627 12 0 12 C6.627 12 12 17.373 12 24 C12 17.373 17.373 12 24 12 C17.373 12 12 6.627 12 0 Z" />
        </svg>
      </div>

      {/* Sparkle 2: Bottom Left on Orbit Line */}
      <div className="hero-sparkle hero-sparkle-bottom-left">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="#0a0a0a">
          <path d="M12 0 C12 6.627 6.627 12 0 12 C6.627 12 12 17.373 12 24 C12 17.373 17.373 12 24 12 C17.373 12 12 6.627 12 0 Z" />
        </svg>
      </div>

      {/* 2. Right Foreground Tilted Harvard Resume (John Doe) */}
      <div className="hero-sheet hero-sheet-right">
        <div className="hero-sheet-inner">
          <div className="hero-sheet-header">
            <span className="hero-sheet-name">John Doe</span>
            <div className="hero-sheet-divider" />
          </div>

          <div className="hero-sheet-section">
            <div className="hero-sheet-section-head">
              <span className="hero-sheet-section-title">Experience</span>
              <span className="hero-sheet-date">2019 - 2022</span>
            </div>
            <div className="hero-sheet-bullets">
              <div className="hero-sheet-bullet-row">
                <span className="hero-skeleton-bar bar-full" />
              </div>
              <div className="hero-sheet-bullet-row">
                <span className="hero-skeleton-bar bar-lg" />
              </div>
              <div className="hero-sheet-bullet-row">
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
                <span className="hero-skeleton-bar bar-md" />
              </div>
              <div className="hero-sheet-bullet-row">
                <span className="hero-skeleton-bar bar-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Left Top Blurred Sheet (Depth of Field) */}
      <div className="hero-sheet hero-sheet-left-top">
        <div className="hero-sheet-inner">
          <div className="hero-sheet-header">
            <span className="hero-sheet-name">Alex Taylor</span>
            <div className="hero-sheet-divider" />
          </div>
          <div className="hero-sheet-section">
            <div className="hero-sheet-bullets">
              <span className="hero-skeleton-bar bar-full" />
              <span className="hero-skeleton-bar bar-lg" />
              <span className="hero-skeleton-bar bar-md" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Left Bottom Blurred Sheet (Depth of Field) */}
      <div className="hero-sheet hero-sheet-left-bottom">
        <div className="hero-sheet-inner">
          <div className="hero-sheet-header">
            <span className="hero-sheet-name">Sarah Chen</span>
            <div className="hero-sheet-divider" />
          </div>
          <div className="hero-sheet-section">
            <div className="hero-sheet-bullets">
              <span className="hero-skeleton-bar bar-lg" />
              <span className="hero-skeleton-bar bar-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
