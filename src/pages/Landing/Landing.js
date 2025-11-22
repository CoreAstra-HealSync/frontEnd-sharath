import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FiMoon, FiSun, FiUser, FiUserCheck, FiShoppingBag, FiActivity, FiMail, FiGithub, FiHeart } from 'react-icons/fi';
import Logo from '../../components/Logo';
import './Landing.css';

const Landing = () => {
  const { theme, toggleTheme } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <Logo size="medium" showText={true} />
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? <FiMoon /> : <FiSun />}
        </button>
      </nav>

      <div className="landing-content">
        <div className="hero-section">
          <h1 className="hero-title">
            Your Healthcare, <span className="gradient-text">Simplified</span>
          </h1>
          <p className="hero-subtitle">
            Manage appointments, track health, access medical records, and connect with healthcare providers - all in one place
          </p>
        </div>

        <div className="login-cards">
          <Link to="/patient/login" className="login-card">
            <div className="card-icon patient-icon">
              <FiUser />
            </div>
            <h3>Patient</h3>
            <p>Access your medical records and manage appointments</p>
          </Link>

          <Link to="/doctor/login" className="login-card">
            <div className="card-icon doctor-icon">
              <FiUserCheck />
            </div>
            <h3>Doctor</h3>
            <p>Manage patients and medical consultations</p>
          </Link>

          <Link to="/hospital/login" className="login-card">
            <div className="card-icon hospital-icon">
              <FiActivity />
            </div>
            <h3>Hospital</h3>
            <p>Manage doctors and hospital operations</p>
          </Link>

          <Link to="/pharmacy/login" className="login-card">
            <div className="card-icon pharmacy-icon">
              <FiShoppingBag />
            </div>
            <h3>Pharmacy</h3>
            <p>Manage inventory and prescriptions</p>
          </Link>
        </div>

        <div className="features-section">
          <h2>Why Choose HealSync?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h4>Smart Reminders</h4>
              <p>Never miss an appointment or medication</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h4>AI Assistant</h4>
              <p>Get instant answers to medical queries</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h4>Health Tracking</h4>
              <p>Monitor your vitals and health metrics</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h4>Secure & Private</h4>
              <p>Your data is encrypted and protected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section footer-brand-section">
            <Logo size="medium" showText={true} />
            <p className="footer-tagline">
              Your Healthcare, Simplified
            </p>
            <p className="footer-description">
              Empowering patients and healthcare providers with seamless, secure, and intelligent healthcare management.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/patient/login">Patient Portal</Link></li>
              <li><Link to="/doctor/login">Doctor Portal</Link></li>
              <li><Link to="/hospital/login">Hospital Portal</Link></li>
              <li><Link to="/pharmacy/login">Pharmacy Portal</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Features</h4>
            <ul className="footer-links">
              <li><a href="#features">Smart Reminders</a></li>
              <li><a href="#features">AI Assistant</a></li>
              <li><a href="#features">Health Tracking</a></li>
              <li><a href="#features">Access Control</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Connect</h4>
            <ul className="footer-links">
              <li>
                <a href="mailto:support@healsync.com" className="footer-link-with-icon">
                  <FiMail /> support@healsync.com
                </a>
              </li>
              <li>
                <a href="https://github.com/CoreAstra-HealSync" target="_blank" rel="noopener noreferrer" className="footer-link-with-icon">
                  <FiGithub /> GitHub
                </a>
              </li>
            </ul>
            <div className="footer-social">
              <a href="#" className="social-icon" aria-label="GitHub">
                <FiGithub />
              </a>
              <a href="#" className="social-icon" aria-label="Email">
                <FiMail />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; {currentYear} HealSync. All rights reserved.</p>
            <p className="footer-love">
              Made with <FiHeart className="heart-icon" /> for better healthcare
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
