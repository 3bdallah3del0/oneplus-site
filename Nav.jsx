// Nav.jsx — sticky top nav over slate hero
const { useState } = React;

function Nav({ lang, setLang }) {
  const [open, setOpen] = useState('work');
  const links = [
    { id: 'work', label: 'Work' },
    { id: 'capabilities', label: 'Capabilities' },
    { id: 'process', label: 'Process' },
    { id: 'about', label: 'About' },
  ];
  return (
    <nav className="op-nav">
      <a href="#" className="op-logo" aria-label="ONE+ Events home">
        <span>ONE</span><span className="plus">+</span>
        <span className="logo-tag">EVENTS</span>
      </a>
      <div className="op-nav-links">
        {links.map(l => (
          <a key={l.id} href={`#${l.id}`} className={open === l.id ? 'active' : ''}
             onClick={(e) => { e.preventDefault(); setOpen(l.id); document.getElementById(l.id)?.scrollIntoView({ behavior: 'smooth' }); }}>
            {l.label}
          </a>
        ))}
      </div>
      <div className="op-nav-right">
        <button className="op-lang-toggle" onClick={() => setLang(lang === 'EN' ? 'AR' : 'EN')}>
          <span className={lang === 'EN' ? 'active' : ''}>EN</span>
          <span className="sep">·</span>
          <span className={lang === 'AR' ? 'active' : ''}>AR</span>
        </button>
        <a href="#contact" className="op-cta-primary"
           onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}>
          Brief Us <span className="arr">›</span>
        </a>
      </div>
    </nav>
  );
}

window.Nav = Nav;
