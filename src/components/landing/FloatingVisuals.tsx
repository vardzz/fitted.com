import React from "react";

export default function FloatingVisuals() {
  return (
    <div className="hero-visuals-container" aria-hidden="true">
      {/* 1. Orbit Arc SVG Path matching reference trajectory */}
      <svg
        className="hero-orbit-svg"
        viewBox="0 0 1440 760"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Subtle sweeping orbit ellipse curve */}
        <path
          d="M -60 680 C 180 340, 480 90, 1150 140 C 1480 170, 1500 480, 1260 700"
          stroke="#0a0a0a"
          strokeWidth="0.85"
          opacity="0.22"
        />
        {/* Secondary faint echo curve for subtle depth */}
        <path
          d="M -30 650 C 210 320, 510 80, 1170 120 C 1450 150, 1480 440, 1280 670"
          stroke="#0a0a0a"
          strokeWidth="0.6"
          strokeDasharray="3 5"
          opacity="0.12"
        />
      </svg>

      {/* Sparkle 1: Top Right on Orbit Curve */}
      <div className="hero-sparkle hero-sparkle-top-right">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#0a0a0a">
          <path d="M12 0 C12 6.627 6.627 12 0 12 C6.627 12 12 17.373 12 24 C12 17.373 17.373 12 24 12 C17.373 12 12 6.627 12 0 Z" />
        </svg>
      </div>

      {/* Sparkle 2: Bottom Left on Orbit Curve */}
      <div className="hero-sparkle hero-sparkle-bottom-left">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="#0a0a0a">
          <path d="M12 0 C12 6.627 6.627 12 0 12 C6.627 12 12 17.373 12 24 C12 17.373 17.373 12 24 12 C17.373 12 12 6.627 12 0 Z" />
        </svg>
      </div>

      {/* 2. Right Foreground Tilted Harvard Resume ("John Doe") */}
      <div className="hero-sheet hero-sheet-right">
        <div className="hero-sheet-inner">
          <div className="hero-sheet-header">
            <span className="hero-sheet-name">John Doe</span>
            <div className="hero-sheet-contacts">
              <span className="hero-skeleton-bar bar-xs" />
              <span className="hero-skeleton-bar bar-xs" />
              <span className="hero-skeleton-bar bar-xs" />
            </div>
            <div className="hero-sheet-divider" />
          </div>

          <div className="hero-sheet-section">
            <div className="hero-sheet-section-head">
              <span className="hero-sheet-section-title">Experience</span>
              <span className="hero-sheet-date">2019-2022</span>
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

          <div className="hero-sheet-section" style={{ marginTop: 6 }}>
            <div className="hero-sheet-bullets">
              <div className="hero-sheet-bullet-row">
                <span className="hero-skeleton-bar bar-lg" />
              </div>
              <div className="hero-sheet-bullet-row">
                <span className="hero-skeleton-bar bar-full" />
              </div>
              <div className="hero-sheet-bullet-row">
                <span className="hero-skeleton-bar bar-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Left Top Blurred Sheet (Cinematic Depth of Field) */}
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
              <span className="hero-skeleton-bar bar-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Left Bottom Blurred Sheet (Cinematic Depth of Field) */}
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
              <span className="hero-skeleton-bar bar-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
