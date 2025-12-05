import React from 'react';
import { Heart, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import './Footer.scss';

const Footer = () => {
  return (
    <footer className="kitchen-footer">
      <div className="footer-content">
        
        {/* BAGIAN TENGAH: TENTANG KAMI */}
        <div className="about-section-simple">
          <h3>Tentang Kami</h3>
          <p>
            Creacipe adalah platform komunitas bagi pecinta kuliner untuk berbagi, menemukan, 
            dan menyimpan resep favorit mereka. Misi kami adalah membuat kegiatan memasak 
            menjadi lebih menyenangkan, kreatif, dan mudah diakses oleh siapa saja.
          </p>
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