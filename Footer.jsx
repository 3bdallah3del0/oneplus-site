// Footer.jsx — slate footer
function Footer() {
  return (
    <footer className="op-footer" id="about">
      <div className="op-footer-top">
        <div className="op-footer-brand">
          <a href="#" className="op-logo" aria-label="ONE+ Events">
            <span>ONE</span><span className="plus">+</span>
            <span className="logo-tag">EVENTS</span>
          </a>
          <p className="op-footer-mission">
            The exhibition industry's missing infrastructure layer. Premium booth design,
            fabrication, and mega-event scenography — engineered in Riyadh.
          </p>
          <div className="op-cert-row">
            <span className="cert">LEAP CERTIFIED</span>
            <span className="cert">CITYSCAPE PARTNER</span>
            <span className="cert">ISO 9001:2015</span>
            <span className="cert">SAUDI MADE</span>
          </div>
        </div>

        <div className="op-footer-cols">
          <div className="col">
            <h4>Capabilities</h4>
            <a href="#">Architectural Design</a>
            <a href="#">Premium Fabrication</a>
            <a href="#">Site Execution</a>
            <a href="#">Mega-Event Production</a>
          </div>
          <div className="col">
            <h4>Studio</h4>
            <a href="#">About</a>
            <a href="#">Process</a>
            <a href="#">Materials Library</a>
            <a href="#">Careers</a>
          </div>
          <div className="col">
            <h4>Contact</h4>
            <a href="#">Riyadh, KSA</a>
            <a href="#">+966 11 000 0000</a>
            <a href="#">brief@oneplus.events</a>
            <a href="#">Instagram · TikTok</a>
          </div>
        </div>
      </div>

      <div className="op-footer-bot">
        <div className="op-meta">© 2025 ONE+ EVENTS · RIYADH · ALL RIGHTS RESERVED</div>
        <div className="op-meta">CR · 1010000000 · VAT · 300000000000003</div>
      </div>
    </footer>
  );
}

window.Footer = Footer;
