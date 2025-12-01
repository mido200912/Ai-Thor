import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './CompanyPages.css';

const CompanyPages = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // جلب الشركات العامة بدون apiKey
  const apiUrl = 'http://localhost:5000/api/public/companies/public';

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        if (data.success) setCompanies(data.companies || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCompanies();
  }, []);

  if (loading) return <p className="loading-text">Loading companies...</p>;

  return (
    <div className="company-pages-container">
      <h1 className="company-pages-title">
        Partner Companies
      </h1>

      <div className="companies-grid">
        {companies.map((company) => (
          <div key={company._id} className="company-card">
            {company.logo && (
              <img
                src={company.logo}
                alt={company.name}
                className="company-logo"
              />
            )}
            <h2 className="company-name">{company.name}</h2>
            <p className="company-description">{company.description}</p>
            <Link
              to={`/company-chat/${company._id}`}
              className="chat-link"
            >
              Open Chat
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyPages;
