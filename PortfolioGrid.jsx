// PortfolioGrid.jsx — filterable portfolio cards with blueprint spec strips
const { useState: useStatePF } = React;

const PORTFOLIO_ITEMS = [
  { id: 'OP-2451', sector: 'TECH', event: 'LEAP 2025', title: 'Saudi Telecom Pavilion', size: '12×8 M', sides: '4 OPEN', days: 14, featured: true,
    bg: 'linear-gradient(135deg, #1F4068 0%, #0F172A 70%), radial-gradient(at 30% 20%, #2D9CDB55, transparent 50%)' },
  { id: 'OP-2517', sector: 'GOV', event: 'CITYSCAPE 25', title: 'MoMRAH Pavilion', size: '20×10 M', sides: '3 OPEN', days: 21,
    bg: 'linear-gradient(135deg, #1A2332 0%, #0F172A 70%)' },
  { id: 'OP-2480', sector: 'TECH', event: 'BLACK HAT MEA', title: 'Cybersecurity Stand', size: '8×8 M', sides: '4 OPEN', days: 10,
    bg: 'linear-gradient(135deg, #1F4068 0%, #0F172A 100%)' },
  { id: 'OP-2392', sector: 'CULT', event: 'RIYADH SEASON', title: 'Cultural Authority Stage', size: '40×20 M', sides: '2 OPEN', days: 28, featured: true,
    bg: 'linear-gradient(135deg, #0F2942 0%, #0F172A 100%)' },
  { id: 'OP-2410', sector: 'CORP', event: 'RICEC EXPO', title: 'Aramco Innovation Booth', size: '10×10 M', sides: '4 OPEN', days: 12,
    bg: 'linear-gradient(135deg, #1F4068 0%, #1A2332 100%)' },
  { id: 'OP-2466', sector: 'GOV', event: 'LEAP 2025', title: 'MCIT Innovation Hub', size: '15×10 M', sides: '3 OPEN', days: 18,
    bg: 'linear-gradient(135deg, #1F4068 0%, #0F172A 100%)' },
];

const SECTORS = ['ALL', 'TECH', 'GOV', 'CORP', 'CULT'];

function PortfolioGrid() {
  const [filter, setFilter] = useStatePF('ALL');
  const items = filter === 'ALL' ? PORTFOLIO_ITEMS : PORTFOLIO_ITEMS.filter(i => i.sector === filter);
  return (
    <section className="op-portfolio" id="work">
      <div className="op-section-head">
        <div className="op-eyebrow">RECENT WORK · 06 OF 42</div>
        <h2 className="op-section-title">Pavilions on the Floor.</h2>
        <p className="op-section-sub">Every project shipped at 100% render fidelity. No exceptions.</p>
        <div className="op-filter-row">
          {SECTORS.map(s => (
            <button key={s} className={'op-chip-btn ' + (filter === s ? 'active' : '')} onClick={() => setFilter(s)}>
              {s}
            </button>
          ))}
          <span className="op-filter-count">{items.length} pavilions</span>
        </div>
      </div>
      <div className="op-portfolio-grid">
        {items.map(item => (
          <article className="op-case" key={item.id}>
            <div className="op-case-image" style={{ background: item.bg }}>
              <div className="op-case-corner">PROJECT · #{item.id}</div>
              {item.featured && <div className="op-case-featured">FEATURED</div>}
              <div className="op-case-triangle"></div>
              <div className="op-case-grid-overlay"></div>
            </div>
            <div className="op-case-body">
              <div className="op-case-sector">{item.sector} · {item.event}</div>
              <h3 className="op-case-title">{item.title}</h3>
              <div className="op-case-specs">
                <div className="spec"><div className="lbl">SIZE</div><div className="val">{item.size}</div></div>
                <div className="spec"><div className="lbl">SIDES</div><div className="val">{item.sides}</div></div>
                <div className="spec"><div className="lbl">BUILD</div><div className="val">{item.days} D</div></div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

window.PortfolioGrid = PortfolioGrid;
