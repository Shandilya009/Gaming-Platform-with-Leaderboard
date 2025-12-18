import { Link } from 'react-router-dom';
import '../styles/Landing.css';

const Landing = () => {
  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-icon">🎮</span>
            <span className="logo-text">GameZone</span>
          </div>
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#games" className="nav-link">Games</a>
            <a href="#leaderboard" className="nav-link">Leaderboard</a>
            <Link to="/login" className="nav-link-btn secondary">Login</Link>
            <Link to="/register" className="nav-link-btn primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-circle hero-circle-1"></div>
          <div className="hero-circle hero-circle-2"></div>
          <div className="hero-circle hero-circle-3"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">⚡</span>
            <span>Challenge Your Skills</span>
          </div>
          <h1 className="hero-title">
            Master Your Mind,<br />
            <span className="hero-title-gradient">Dominate the Leaderboard</span>
          </h1>
          <p className="hero-description">
            Compete in exciting mini-games, earn points, and climb to the top. 
            Test your reflexes, logic, and speed in our growing collection of challenges.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="hero-btn primary">
              Start Playing Now
              <span className="btn-arrow">→</span>
            </Link>
            <Link to="/games" className="hero-btn secondary">
              Browse Games
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">4+</div>
              <div className="stat-label">Mini Games</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">100+</div>
              <div className="stat-label">Active Players</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Always Open</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="section-header">
          <span className="section-badge">Why Choose Us</span>
          <h2 className="section-title">Everything You Need to Compete</h2>
          <p className="section-description">
            Experience gaming like never before with our feature-rich platform
          </p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3 className="feature-title">Multiple Game Modes</h3>
            <p className="feature-description">
              From reaction tests to brain puzzles - challenge yourself in various ways
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3 className="feature-title">Live Leaderboards</h3>
            <p className="feature-description">
              Compete with players worldwide and see where you rank in real-time
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3 className="feature-title">Instant Play</h3>
            <p className="feature-description">
              No downloads required - jump straight into the action from your browser
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">Track Progress</h3>
            <p className="feature-description">
              Monitor your scores, points, and improvement over time
            </p>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section id="games" className="games-preview">
        <div className="section-header">
          <span className="section-badge">Popular Games</span>
          <h2 className="section-title">Choose Your Challenge</h2>
        </div>
        <div className="games-cards">
          <div className="game-card">
            <div className="game-card-header">
              <span className="game-emoji">⌨️</span>
              <span className="game-difficulty medium">Medium</span>
            </div>
            <h3 className="game-card-title">Typing Speed Test</h3>
            <p className="game-card-desc">Type a paragraph in 30 seconds. Score = WPM × accuracy%</p>
            <div className="game-card-footer">
              <span className="game-type">⚡ Speed</span>
              <span className="game-popularity">🔥 Hot</span>
            </div>
          </div>
          <div className="game-card">
            <div className="game-card-header">
              <span className="game-emoji">🧮</span>
              <span className="game-difficulty medium">Medium</span>
            </div>
            <h3 className="game-card-title">Speed Math Challenge</h3>
            <p className="game-card-desc">Solve as many math problems as possible in 60 seconds</p>
            <div className="game-card-footer">
              <span className="game-type">🧠 Logic</span>
              <span className="game-popularity">⭐ Popular</span>
            </div>
          </div>
          <div className="game-card">
            <div className="game-card-header">
              <span className="game-emoji">🔤</span>
              <span className="game-difficulty easy">Easy</span>
            </div>
            <h3 className="game-card-title">Word Unscramble</h3>
            <p className="game-card-desc">Unscramble words correctly in 60 seconds</p>
            <div className="game-card-footer">
              <span className="game-type">🧩 Puzzle</span>
              <span className="game-popularity">🎯 Fun</span>
            </div>
          </div>
          <div className="game-card">
            <div className="game-card-header">
              <span className="game-emoji">🧠</span>
              <span className="game-difficulty hard">Hard</span>
            </div>
            <h3 className="game-card-title">Memory Grid Challenge</h3>
            <p className="game-card-desc">Remember and click the highlighted blocks in a 4×4 grid</p>
            <div className="game-card-footer">
              <span className="game-type">🧠 Memory</span>
              <span className="game-popularity">💎 Challenge</span>
            </div>
          </div>
          <div className="game-card">
            <div className="game-card-header">
              <span className="game-emoji">⚡</span>
              <span className="game-difficulty easy">Easy</span>
            </div>
            <h3 className="game-card-title">Reflex Bar Stopper</h3>
            <p className="game-card-desc">Stop the moving bar at the center. Score based on accuracy</p>
            <div className="game-card-footer">
              <span className="game-type">⚡ Reflex</span>
              <span className="game-popularity">🔥 Addictive</span>
            </div>
          </div>
        </div>
        <div className="games-cta">
          <Link to="/games" className="cta-btn">
            View All Games
            <span className="btn-arrow">→</span>
          </Link>
        </div>
      </section>

      {/* Bento Grid Section */}
      <section id="leaderboard" className="bento-section">
        <div className="section-header">
          <span className="section-badge">Join the Competition</span>
          <h2 className="section-title">Be Part of Something Big</h2>
        </div>
        <div className="bento-grid">
          <div className="bento-item large">
            <div className="bento-content">
              <h3 className="bento-title">Global Leaderboard</h3>
              <p className="bento-description">
                Compete with players from around the world. Climb the ranks and prove you're the best!
              </p>
              <div className="bento-visual">
                <div className="leaderboard-preview">
                  <div className="leaderboard-row gold">
                    <span className="rank">🥇</span>
                    <span className="player">ProGamer123</span>
                    <span className="points">2,450 pts</span>
                  </div>
                  <div className="leaderboard-row silver">
                    <span className="rank">🥈</span>
                    <span className="player">SpeedMaster</span>
                    <span className="points">2,180 pts</span>
                  </div>
                  <div className="leaderboard-row bronze">
                    <span className="rank">🥉</span>
                    <span className="player">QuickClick</span>
                    <span className="points">1,950 pts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bento-item medium">
            <div className="bento-content">
              <span className="bento-icon">📈</span>
              <h3 className="bento-title">Track Your Growth</h3>
              <p className="bento-description">
                Monitor your progress with detailed statistics and insights
              </p>
            </div>
          </div>
          <div className="bento-item medium">
            <div className="bento-content">
              <span className="bento-icon">🎖️</span>
              <h3 className="bento-title">Earn Achievements</h3>
              <p className="bento-description">
                Unlock badges and rewards as you master each game
              </p>
            </div>
          </div>
          <div className="bento-item small">
            <div className="bento-content">
              <div className="bento-stat">
                <div className="bento-stat-number">10K+</div>
                <div className="bento-stat-label">Games Played</div>
              </div>
            </div>
          </div>
          <div className="bento-item small">
            <div className="bento-content">
              <div className="bento-stat">
                <div className="bento-stat-number">500+</div>
                <div className="bento-stat-label">Daily Players</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Start Your Journey?</h2>
          <p className="cta-description">
            Join thousands of players competing daily. Sign up now and get started in seconds!
          </p>
          <div className="cta-buttons">
            <Link to="/register" className="cta-btn primary">
              Create Free Account
              <span className="btn-arrow">→</span>
            </Link>
            <Link to="/login" className="cta-btn secondary">
              Already have an account? Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-icon">🎮</span>
              <span className="logo-text">GameZone</span>
            </div>
            <p className="footer-description">
              The ultimate platform for casual gaming competitions. 
              Challenge yourself and compete with the world.
            </p>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Quick Links</h4>
            <Link to="/games" className="footer-link">Browse Games</Link>
            <Link to="/leaderboard" className="footer-link">Leaderboard</Link>
            <Link to="/register" className="footer-link">Sign Up</Link>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Games</h4>
            <a href="#" className="footer-link">Reaction Timer</a>
            <a href="#" className="footer-link">Click Speed Test</a>
            <a href="#" className="footer-link">Math Quiz</a>
            <a href="#" className="footer-link">Number Guessing</a>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Community</h4>
            <a href="#" className="footer-link">Discord</a>
            <a href="#" className="footer-link">Twitter</a>
            <a href="#" className="footer-link">Contact Us</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 GameZone. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
