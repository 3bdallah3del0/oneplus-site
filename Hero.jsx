// Hero.jsx — full-bleed dark hero with cyan spotlight
function Hero({ lang }) {
  return (
    <header className="op-hero" id="hero">
      <div className="op-hero-spotlight"></div>
      <div className="op-hero-grid"></div>

      <div className="op-hero-inner">
        <div className="op-eyebrow op-hero-eyebrow">
          <span className="dot"></span> RIYADH · KSA · 2025
        </div>

        {lang === 'EN' ? (
          <h1 className="op-hero-claim">
            Render to Reality.<br/>
            <span className="op-text-grad-cyan">No Compromise.</span><span className="plus-accent">+</span>
          </h1>
        ) : (
          <h1 className="op-hero-claim op-ar" dir="rtl" style={{ fontFamily: "var(--font-display-ar)" }}>
            من التصميم إلى<br/>
            <span className="op-text-grad-cyan">التنفيذ.</span><span className="plus-accent">+</span>
          </h1>
        )}

        <p className="op-hero-sub">
          Premium exhibition booths and mega-event scenography for tech giants, ministries,
          and cultural authorities. 100% fidelity between 3D architectural render and physical floor execution.
        </p>

        <div className="op-hero-actions">
          <a href="#contact" className="op-cta-primary lg">
            Request a Site Audit <span className="arr">›</span>
          </a>
          <a href="#work" className="op-cta-ghost lg">
            View Recent Pavilions
          </a>
        </div>

        <div className="op-hero-metrics">
          <div className="m-stat">
            <div className="m-num"><span className="grad">100</span><span className="m-unit">%</span></div>
            <div className="m-label">Render-to-Reality<br/>Fidelity</div>
          </div>
          <div className="m-stat">
            <div className="m-num">3.2<span className="m-unit">s</span></div>
            <div className="m-label">Visitor Decision<br/>Window (CEIR)</div>
          </div>
          <div className="m-stat">
            <div className="m-num"><span className="red">3</span><span className="m-unit">×</span></div>
            <div className="m-label">Traffic Uplift<br/>vs Empty Booth</div>
          </div>
          <div className="m-stat">
            <div className="m-num">42</div>
            <div className="m-label">Pavilions Delivered<br/>LEAP · Cityscape · RICEC</div>
          </div>
        </div>

        <div className="op-hero-blueprint">
          <span>BLUEPRINT</span>
          <span className="line"></span>
          <span>PROJECT · LEAP 2025</span>
          <span className="line"></span>
          <span>SITE 4-B · 480 m²</span>
          <span className="line"></span>
          <span>STATUS · COMMISSIONED</span>
        </div>
      </div>
    </header>
  );
}

window.Hero = Hero;
