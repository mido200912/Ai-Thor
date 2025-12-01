import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { companyService } from "../services/api";
import { useNavigate } from "react-router-dom";
import "./CompanySetup.css";

const CompanySetup = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    industry: "",
    size: "",
    vision: "",
    mission: "",
    values: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiUrl, setApiUrl] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const valuesArray = formData.values
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v);

      const companyData = { ...formData, values: valuesArray };
      const response = await companyService.updateCompany(companyData);
      const company = response.data || response;

      if (company.apiKey) {
        setApiKey(company.apiKey);
        const backendUrl =
          import.meta.env?.VITE_API_URL || "https://ai-thor-pkmr.vercel.app/api";
        setApiUrl(`${backendUrl}/company/use-model`);
      } else {
        setError("API Key not found for this company");
      }
    } catch (error) {
      console.error("Company setup error:", error);
      setError(error.response?.data?.error || "An error occurred while saving");
    } finally {
      setLoading(false);
    }
  };

  if (apiKey && apiUrl) {
    return (
      <div className="company-setup-container">
        <div className="company-success">
          <h2 className="company-setup-title">🎉 Company Created Successfully!</h2>
          <div className="bg-gray-100 p-3 rounded-md text-sm mb-3">
            <strong>API URL:</strong>
            <p className="break-all text-gray-700">{apiUrl}</p>
          </div>
          <div className="bg-gray-100 p-3 rounded-md text-sm mb-3">
            <strong>API Key:</strong>
            <p className="break-all text-gray-700">{apiKey}</p>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Use this API URL and Key to integrate AI with your company.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="company-submit"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="company-setup-container">
      <div className="company-setup-box">
        <h2 className="company-setup-title">Company Setup</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: "name", placeholder: "Company Name", type: "input" },
            { name: "description", placeholder: "Company Description", type: "textarea" },
            { name: "industry", placeholder: "Industry", type: "input" },
            { name: "size", placeholder: "Company Size", type: "input" },
            { name: "vision", placeholder: "Vision", type: "textarea" },
            { name: "mission", placeholder: "Mission", type: "textarea" },
            {
              name: "values",
              placeholder: "Values (comma separated)",
              type: "input",
            },
          ].map((field) =>
            field.type === "textarea" ? (
              <textarea
                key={field.name}
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name]}
                onChange={handleChange}
                className="company-input"
                required={["name", "description"].includes(field.name)}
              />
            ) : (
              <input
                key={field.name}
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name]}
                onChange={handleChange}
                className="company-input"
                required={["name", "description"].includes(field.name)}
              />
            )
          )}

          {error && <p className="company-error">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="company-submit"
          >
            {loading ? "Saving..." : "💾 Save Company"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompanySetup;
