// ContactPanel.jsx — two-column contact card with LIVE Web3Forms submission
const { useState: useStateCT } = React;

function ContactPanel() {
  const [form, setForm] = useStateCT({ company: '', email: '', event: '', brief: '' });
  const [status, setStatus] = useStateCT('idle'); // idle | sending | sent | error

  const submit = async (e) => {
    e.preventDefault();
    if (!form.company || !form.email) return;
    setStatus('sending');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: '6ad498c4-171c-4e81-9cb8-3c7c0ccff212',
          subject: 'New Booth Brief — ONE+ Events Website',
          from_name: 'ONE+ Events Website',
          company: form.company,
          email: form.email,
          target_event: form.event || 'Not specified',
          brief: form.brief || 'No brief provided',
          botcheck: ''
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatus('sent');
        setForm({ company: '', email: '', event: '', brief: '' });
        setTimeout(() => setStatus('idle'), 6000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 6000);
      }
    } catch (err) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 6000);
    }
  };

  const btnLabel = {
    idle:    <>Send Brief <span className="arr">›</span></>,
    sending: 'Sending…',
    sent:    'Brief Received · We will reply within 24h',
    error:   'Something went wrong · WhatsApp us instead'
  }[status];

  return (
    <section className="op-contact" id="contact">
      <div className="op-contact-card">
        <div className="op-contact-left">
          <div className="op-eyebrow">BRIEF US</div>
          <h2 className="op-contact-title">Ready when you are.</h2>
          <p className="op-contact-sub">Tell us about your event. We'll come back within 24 hours with a 3D render concept and a fixed-price commission.</p>

          <div className="op-contact-facts">
            <div className="fact">
              <div className="lbl">RIYADH STUDIO</div>
              <div className="val">Riyadh, Saudi Arabia</div>
            </div>
            <div className="fact">
              <div className="lbl">DIRECT LINE</div>
              <div className="val">+966 56 636 9163</div>
            </div>
            <div className="fact">
              <div className="lbl">PRODUCTION SLA</div>
              <div className="val">18 days · standard</div>
            </div>
            <div className="fact">
              <div className="lbl">CURRENT WINDOW</div>
              <div className="val highlight">Q3 2026 · 3 slots left</div>
            </div>
          </div>
        </div>

        <form className="op-contact-form" onSubmit={submit}>
          <div className="field">
            <label>Company / Ministry</label>
            <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}
                   placeholder="Saudi Telecom Company" />
          </div>
          <div className="field">
            <label>Decision-Maker Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                   placeholder="you@brand.com" />
          </div>
          <div className="field">
            <label>Target Event</label>
            <div className="op-select">
              <select value={form.event} onChange={e => setForm({ ...form, event: e.target.value })}>
                <option value="">Select an event</option>
                <option>LEAP 2026</option>
                <option>Cityscape Global</option>
                <option>RICEC Expo</option>
                <option>Riyadh Season</option>
                <option>Black Hat MEA</option>
                <option>Other / Custom</option>
              </select>
              <span className="chev">›</span>
            </div>
          </div>
          <div className="field">
            <label>Project Brief</label>
            <textarea rows="3" value={form.brief} onChange={e => setForm({ ...form, brief: e.target.value })}
                      placeholder="Booth size, materials, budget window, key visual references…"></textarea>
          </div>
          <button type="submit" className="op-cta-primary lg full" disabled={status === 'sending'}>
            {btnLabel}
          </button>
          <div className="op-form-foot">By submitting, you agree to our quiet B2B comms policy. No spam. EN / AR responses available.</div>
        </form>
      </div>
    </section>
  );
}

window.ContactPanel = ContactPanel;
