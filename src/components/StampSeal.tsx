"use client";

import { motion } from "framer-motion";

export default function StampSeal() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.6, rotate: -32 }}
      animate={{ opacity: 1, scale: 1, rotate: -8 }}
      transition={{ type: "spring", stiffness: 260, damping: 14 }}
      className="pointer-events-none select-none"
      aria-hidden="true"
    >
      <svg viewBox="0 0 220 220" className="h-28 w-28 text-seal">
        <defs>
          <filter id="stampInk" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise" />
            <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0" result="alphaNoise" />
            <feComposite in="SourceGraphic" in2="alphaNoise" operator="out" />
          </filter>
          <path id="stampArcTop" d="M 28 118 A 82 82 0 0 1 192 118" fill="none" />
          <path id="stampArcBottom" d="M 192 122 A 82 82 0 0 1 28 122" fill="none" />
        </defs>

        <g filter="url(#stampInk)">
          <circle cx="110" cy="110" r="96" fill="none" stroke="currentColor" strokeWidth="5" />
          <circle cx="110" cy="110" r="82" fill="none" stroke="currentColor" strokeWidth="2" />

          <text fill="currentColor" fontSize="14" fontWeight="700" letterSpacing="3">
            <textPath href="#stampArcTop" startOffset="50%" textAnchor="middle">
              AI GIÁO ÁN PRO
            </textPath>
          </text>
          <text fill="currentColor" fontSize="12" fontWeight="600" letterSpacing="2">
            <textPath href="#stampArcBottom" startOffset="50%" textAnchor="middle">
              CHUẨN CÔNG VĂN 5512
            </textPath>
          </text>

          <text x="110" y="112" fill="currentColor" fontSize="34" fontWeight="800" textAnchor="middle">
            ✓
          </text>
          <text x="110" y="136" fill="currentColor" fontSize="13" fontWeight="600" textAnchor="middle" letterSpacing="1">
            ĐÃ SOẠN XONG
          </text>
        </g>
      </svg>
    </motion.div>
  );
}
