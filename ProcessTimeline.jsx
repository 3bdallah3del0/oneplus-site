// ProcessTimeline.jsx — SPIN-aligned process steps
function ProcessTimeline() {
  const steps = [
    { n: '01', code: 'S', title: 'Situation', body: 'We map your exhibition vendor setup, upcoming events, and brand system. Site survey, venue constraints, budget cycle.', meta: 'Week 1 · Discovery & site walk' },
    { n: '02', code: 'P', title: 'Problem', body: 'Surface the gap between your design expectations and past execution failures. Vendor mismatches. Floor plan compromises.', meta: 'Week 1 · Strategy session' },
    { n: '03', code: 'I', title: 'Implication', body: 'Quantify brand damage, missed ROI, and the opportunity cost of substandard booth execution at headline events.', meta: 'Week 2 · Cost modelling' },
    { n: '04', code: 'N', title: 'Need-Payoff', body: '3D render review, materials lock, factory build, site execution. One partner across every phase. 100% fidelity.', meta: 'Weeks 3–8 · Build & deliver' },
  ];
  return (
    <section className="op-process" id="process">
      <div className="op-section-head">
        <div className="op-eyebrow">METHOD · SPIN FRAMEWORK</div>
        <h2 className="op-section-title">Engineered, not improvised.</h2>
        <p className="op-section-sub">Every commission runs through the same 4-phase consultative process — adapted from Rackham's SPIN methodology for the Gulf B2B exhibition market.</p>
      </div>
      <ol className="op-timeline">
        {steps.map((s, i) => (
          <li className="op-tl-step" key={i}>
            <div className="op-tl-rail">
              <div className="op-tl-num">{s.n}</div>
              <div className="op-tl-code">{s.code}</div>
              {i < steps.length - 1 && <div className="op-tl-line"></div>}
            </div>
            <div className="op-tl-content">
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              <div className="op-tl-meta">{s.meta}</div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

window.ProcessTimeline = ProcessTimeline;
