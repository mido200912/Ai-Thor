import React, { useState, useEffect } from 'react';
import { projectService } from '../services/api';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    products: [],
    faqs: [],
    tone: 'professional',
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...formData.products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setFormData({ ...formData, products: newProducts });
  };

  const addProduct = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { title: '', price: 0, sku: '' }],
    });
  };

  const removeProduct = (index) => {
    const newProducts = formData.products.filter((_, i) => i !== index);
    setFormData({ ...formData, products: newProducts });
  };

  const handleFaqChange = (index, field, value) => {
    const newFaqs = [...formData.faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    setFormData({ ...formData, faqs: newFaqs });
  };

  const addFaq = () => {
    setFormData({
      ...formData,
      faqs: [...formData.faqs, { q: '', a: '' }],
    });
  };

  const removeFaq = (index) => {
    const newFaqs = formData.faqs.filter((_, i) => i !== index);
    setFormData({ ...formData, faqs: newFaqs });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await projectService.updateProject(editingProject._id, formData);
      } else {
        await projectService.createProject(formData);
      }
      fetchProjects();
      resetForm();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      products: [],
      faqs: [],
      tone: 'professional',
    });
    setEditingProject(null);
    setShowForm(false);
  };

  const handleEdit = (project) => {
    setFormData({
      name: project.name,
      description: project.description,
      products: project.products || [],
      faqs: project.faqs || [],
      tone: project.tone || 'professional',
    });
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDelete = async (companyId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
      try {
        await projectService.deleteProject(companyId);
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#495057' }}>إدارة المشاريع</h2>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          إضافة مشروع جديد
        </button>
      </div>

      {showForm && (
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#495057' }}>
            {editingProject ? 'تعديل المشروع' : 'إضافة مشروع جديد'}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">اسم المشروع</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">وصف المشروع</label>
              <textarea
                name="description"
                className="form-input"
                value={formData.description}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label className="form-label">نبرة التواصل</label>
              <select
                name="tone"
                className="form-input"
                value={formData.tone}
                onChange={handleChange}
              >
                <option value="professional">مهنية</option>
                <option value="friendly">ودودة</option>
                <option value="formal">رسمية</option>
                <option value="casual">عادية</option>
              </select>
            </div>

            {/* المنتجات */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label className="form-label">المنتجات</label>
                <button type="button" onClick={addProduct} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
                  إضافة منتج
                </button>
              </div>
              
              {formData.products.map((product, index) => (
                <div key={index} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr auto',
                  gap: '10px',
                  alignItems: 'end',
                  marginBottom: '10px',
                  padding: '10px',
                  background: 'white',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6'
                }}>
                  <input
                    type="text"
                    placeholder="اسم المنتج"
                    className="form-input"
                    value={product.title}
                    onChange={(e) => handleProductChange(index, 'title', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="السعر"
                    className="form-input"
                    value={product.price}
                    onChange={(e) => handleProductChange(index, 'price', parseFloat(e.target.value) || 0)}
                  />
                  <input
                    type="text"
                    placeholder="رمز المنتج"
                    className="form-input"
                    value={product.sku}
                    onChange={(e) => handleProductChange(index, 'sku', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeProduct(index)}
                    className="btn btn-secondary"
                    style={{ padding: '8px 12px' }}
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>

            {/* الأسئلة الشائعة */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label className="form-label">الأسئلة الشائعة</label>
                <button type="button" onClick={addFaq} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
                  إضافة سؤال
                </button>
              </div>
              
              {formData.faqs.map((faq, index) => (
                <div key={index} style={{
                  marginBottom: '10px',
                  padding: '10px',
                  background: 'white',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6'
                }}>
                  <input
                    type="text"
                    placeholder="السؤال"
                    className="form-input"
                    value={faq.q}
                    onChange={(e) => handleFaqChange(index, 'q', e.target.value)}
                    style={{ marginBottom: '8px' }}
                  />
                  <textarea
                    placeholder="الإجابة"
                    className="form-input"
                    value={faq.a}
                    onChange={(e) => handleFaqChange(index, 'a', e.target.value)}
                    rows="2"
                  />
                  <button
                    type="button"
                    onClick={() => removeFaq(index)}
                    className="btn btn-secondary"
                    style={{ padding: '8px 12px', marginTop: '8px' }}
                  >
                    حذف السؤال
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">
                {editingProject ? 'تحديث المشروع' : 'إضافة المشروع'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* قائمة المشاريع */}
      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
          <p>لا توجد مشاريع حالياً</p>
          <p>اضغط على "إضافة مشروع جديد" للبدء</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {projects.map((project) => (
            <div key={project._id} style={{
              background: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>
                {project.name}
              </h3>
              <p style={{ margin: '0 0 10px 0', color: '#6c757d' }}>
                {project.description}
              </p>
              <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#adb5bd' }}>
                النبرة: {project.tone === 'professional' ? 'مهنية' : 
                         project.tone === 'friendly' ? 'ودودة' :
                         project.tone === 'formal' ? 'رسمية' : 'عادية'}
              </p>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleEdit(project)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                >
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(project._id)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
