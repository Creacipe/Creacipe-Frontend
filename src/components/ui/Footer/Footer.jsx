import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Linkedin, Heart } from 'lucide-react';
import './Footer.scss';

const Footer = () => {
  return (
    <footer className="kitchen-footer">
      <div className="footer-content">
        
        {/* KOLOM 1: SOSIAL & NEWSLETTER */}
        <div className="footer-column">
          <h3>Hubungkan</h3>
          
          <div className="social-links">
            <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
            <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
            <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
            <a href="#" aria-label="Youtube"><Youtube size={20} /></a>
          </div>

          <div className="newsletter-section">
            <p>Berlangganan Newsletter kami</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Masukkan email..." />
              <button type="submit">Langganan</button>
            </form>
          </div>

          <div className="app-download">
            <p>Dapatkan Aplikasinya!</p>
            <div className="store-buttons">
              {/* Ganti src dengan gambar badge app store kamu nanti */}
              <button className="store-btn">
                 App Store
              </button>
              <button className="store-btn">
                 Google Play
              </button>
            </div>
          </div>
        </div>

        {/* KOLOM 2: INFO PERUSAHAAN */}
        <div className="footer-column">
          <h3>Tentang Kami</h3>
          <ul className="footer-links">
            <li><Link to="/careers">Karir - Kami merekrut!</Link></li>
            <li><Link to="/about">Tentang Creacipe</Link></li>
            <li><Link to="/team">Tim Kami</Link></li>
            <li><Link to="/partners">Kolaborasi</Link></li>
            <li>
              <Link to="/app" className="link-with-badge">
                Aplikasi Kami <span className="badge-new">Baru</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* KOLOM 3: BANTUAN & LEGAL */}
        <div className="footer-column">
          <h3>Bantuan</h3>
          <ul className="footer-links">
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/terms">Syarat & Ketentuan</Link></li>
            <li><Link to="/privacy">Kebijakan Privasi</Link></li>
            <li><Link to="/contact">Kontak</Link></li>
            <li><Link to="/feedback">Kirim Masukan</Link></li>
          </ul>
          
          <div className="language-switch">
            <h3>Bahasa</h3>
            <div className="lang-options">
              <span className="active">Bahasa</span>
              <span>English</span>
            </div>
          </div>
        </div>

        {/* KOLOM 4: UNTUK BRAND/BISNIS */}
        <div className="footer-column">
          <h3>Untuk Bisnis</h3>
          <ul className="footer-links">
            <li><Link to="/advertise">Beriklan di Creacipe</Link></li>
            <li><Link to="/business">Blog Bisnis</Link></li>
            <li><Link to="/partnership">Kontak Partnership</Link></li>
          </ul>
        </div>
      </div>

      {/* FOOTER BOTTOM */}
      <div className="footer-bottom">
        <p className="made-with">
          Dibuat dengan <Heart size={14} fill="#F4B400" color="#F4B400" /> di Indonesia
        </p>
        <div className="legal-text">
          <p>© 2025 Creacipe Media. All Rights Reserved.</p>
          <p>Creacipe didukung oleh product placement.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;