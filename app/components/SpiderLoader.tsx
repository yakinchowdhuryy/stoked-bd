"use client";

// Cute spider loading screen — STOKED
// Use: <SpiderLoader /> (full-screen overlay) jokhon product load hocche

export default function SpiderLoader({ label = "LOADING PRODUCT" }: { label?: string }) {
  return (
    <div className="sl-wrap">
      <div className="sl-glow" />
      <div className="sl-ring r1" />
      <div className="sl-ring r2" />
      <div className="sl-ring r3" />

      <div className="sl-center">
        <div className="sl-thread" />
        <svg className="sl-spider" viewBox="0 0 120 100" width="96" height="80">
          {/* left legs */}
          <g className="legs-l" stroke="#8a8a8f" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M50 45 L30 30 L12 22" />
            <path d="M50 50 L28 44 L8 42" />
            <path d="M50 55 L28 60 L10 68" />
            <path d="M52 60 L34 74 L22 88" />
          </g>
          {/* right legs */}
          <g className="legs-r" stroke="#8a8a8f" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M70 45 L90 30 L108 22" />
            <path d="M70 50 L92 44 L112 42" />
            <path d="M70 55 L92 60 L110 68" />
            <path d="M68 60 L86 74 L98 88" />
          </g>
          {/* body */}
          <ellipse cx="60" cy="62" rx="13" ry="16" fill="#5a5a60" />
          <circle cx="60" cy="40" r="11" fill="#6a6a70" />
          {/* eyes */}
          <circle className="eye" cx="55.5" cy="38" r="2.6" fill="#ff2a2a" />
          <circle className="eye" cx="64.5" cy="38" r="2.6" fill="#ff2a2a" />
        </svg>

        <div className="sl-brand">STOKED</div>
        <div className="sl-label">{label}</div>
      </div>

      <style>{`
        .sl-wrap{position:fixed;inset:0;z-index:9999;background:#050505;display:flex;align-items:center;justify-content:center;overflow:hidden;font-family:"Space Grotesk",sans-serif}
        .sl-glow{position:absolute;width:560px;height:560px;border-radius:50%;background:radial-gradient(circle,rgba(120,0,0,.35) 0%,rgba(60,0,0,.15) 45%,transparent 70%);animation:slGlow 3s ease-in-out infinite}
        .sl-ring{position:absolute;border-radius:50%;border:1px solid rgba(160,20,20,.18);animation:slRing 3s ease-out infinite}
        .r1{width:200px;height:200px}.r2{width:200px;height:200px;animation-delay:1s}.r3{width:200px;height:200px;animation-delay:2s}
        .sl-center{position:relative;display:flex;flex-direction:column;align-items:center}
        .sl-thread{width:1px;height:60px;background:linear-gradient(transparent,rgba(180,180,180,.35));animation:slDrop 2.4s ease-in-out infinite;transform-origin:top}
        .sl-spider{margin-top:-6px;opacity:.85;animation:slBob 2.4s ease-in-out infinite}
        .legs-l{transform-origin:50px 50px;animation:slLegL .5s ease-in-out infinite alternate}
        .legs-r{transform-origin:70px 50px;animation:slLegR .5s ease-in-out infinite alternate}
        .eye{animation:slBlink 3.5s infinite;transform-box:fill-box;transform-origin:center;filter:drop-shadow(0 0 3px #ff0000)}
        .sl-brand{margin-top:22px;color:#eee;font-size:18px;font-weight:600;letter-spacing:.45em;padding-left:.45em}
        .sl-label{margin-top:10px;color:#666;font-size:9px;letter-spacing:.35em;padding-left:.35em;animation:slFade 1.6s ease-in-out infinite}
        @keyframes slGlow{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.08);opacity:1}}
        @keyframes slRing{0%{transform:scale(.6);opacity:.9}100%{transform:scale(2.8);opacity:0}}
        @keyframes slBob{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(10px) rotate(3deg)}}
        @keyframes slDrop{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.17)}}
        @keyframes slLegL{from{transform:rotate(-5deg)}to{transform:rotate(5deg)}}
        @keyframes slLegR{from{transform:rotate(5deg)}to{transform:rotate(-5deg)}}
        @keyframes slBlink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}
        @keyframes slFade{0%,100%{opacity:.4}50%{opacity:1}}
      `}</style>
    </div>
  );
}