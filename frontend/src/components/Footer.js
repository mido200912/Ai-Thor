import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { isDark } = useTheme();
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      style={{ background: isDark ? '#0f172a' : '#0f172a', color: 'white', marginTop: 40 }}
    >
      <div className="container" style={{ padding: '32px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          <div>
            <h3 style={{ marginBottom: 12 }}>AiThor</h3>
            <p style={{ color: '#cbd5e1', lineHeight: 1.8 }}>
              منصة ذكية لإدارة الشركات والمشاريع مع تكامل الدردشة بالذكاء الاصطناعي.
            </p>
          </div>
          <div>
            <h4 style={{ marginBottom: 12 }}>روابط سريعة</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#cbd5e1' }}>
              <li>الأسئلة الشائعة</li>
              <li>الأسعار</li>
              <li>الخصوصية</li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: 12 }}>تواصل معنا</h4>
            <p style={{ color: '#cbd5e1', lineHeight: 1.8 }}>support@aithor.app</p>
          </div>
        </div>
        <div style={{ marginTop: 24, borderTop: '1px solid #1f2937', paddingTop: 16, textAlign: 'center', color: '#94a3b8' }}>
          © {new Date().getFullYear()} AiThor. جميع الحقوق محفوظة.
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
