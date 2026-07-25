// Capabilities.jsx — 4-up capability grid
function Capabilities() {
  const caps = [
    {
      icon: 'ruler',
      tag: 'PHASE 01',
      title: 'Architectural Design',
      body: 'Photoreal 3D renders and engineered floor plans aligned to your brand system, venue constraints, and visitor flow models.',
      meta: 'Rhino · V-Ray · Cinema 4D'
    },
    {
      icon: 'package',
      tag: 'PHASE 02',
      title: 'Premium Fabrication',
      body: 'Polished steel, acrylic, tension fabric, integrated LED. Built in our Riyadh workshop to spec, audited before site delivery.',
      meta: '12,000 m² workshop · 18-day SLA'
    },
    {
      icon: 'building-2',
      tag: 'PHASE 03',
      title: 'Site Execution',
      body: 'One partner. Zero gaps. Site command, structural safety, electrical, AV, branding — coordinated from floorplan to teardown.',
      meta: 'LEAP · Cityscape · RICEC certified'
    },
    {
      icon: 'line-chart',
      tag: 'PHASE 04',
      title: 'Mega-Event Production',
      body: 'Full scenographic master-planning for pavilions, government showcases, and cultural authority commissions.',
      meta: 'Up to 4,000 m² · 14-day standups'
    },
  ];
  return (
    <section className="op-capabilities" id="capabilities">
      <div className="op-section-head">
        <div className="op-eyebrow">CAPABILITIES · 04 PHASES</div>
        <h2 className="op-section-title">One partner. <span className="op-text-grad-cyan">Zero gaps.</span></h2>
        <p className="op-section-sub">Every booth is engineered through four phases — from architectural design through teardown. We do not subcontract any phase.</p>
      </div>
      <div className="op-cap-grid">
        {caps.map((c, i) => (
          <article className="op-cap" key={i}>
            <div className="op-cap-icon"><i data-lucide={c.icon}></i></div>
            <div className="op-cap-tag">{c.tag}</div>
            <h3 className="op-cap-title">{c.title}</h3>
            <p className="op-cap-body">{c.body}</p>
            <div className="op-cap-meta">{c.meta}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

window.Capabilities = Capabilities;
