import './NavBar.css';

export default function NavBar() {
  return (
    <nav className="nav">
      <div className="nav-left">
        <span className="logo">HAVEN Genesis</span>
      </div>

      <div className="nav-links">
        {['Home', 'Canvas', 'Resources', 'Tools', 'Community', 'Learning', 'Profile'].map(
          (link) => (
            <a key={link} href={`#${link.toLowerCase()}`}>
              {link}
            </a>
          )
        )}
      </div>

      <div className="nav-right">
        <span className="icon">🔔</span>
        <span className="icon">🔍</span>
        <div className="avatar"></div>
      </div>
    </nav>
  );
}
