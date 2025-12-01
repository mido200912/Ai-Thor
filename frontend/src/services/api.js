import axios from 'axios';
const API_BASE_URL = "https://ai-thor5.vercel.app/api";



const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// إدخال التوكن في كل طلب
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// التعامل مع أخطاء الاستجابة
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// خدمات المصادقة
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },
};

// خدمات الشركة
export const companyService = {
  // 🔹 جلب بيانات الشركة
  getCompany: async () => {
    const response = await api.get('/company');
    return response.data;
  },

  // 🔹 إنشاء أو تحديث بيانات الشركة (المسار الصحيح من الـ backend)
  updateCompany: async (companyData) => {
    const response = await api.post('/company', companyData);
    return response.data;
  },

  // 🔹 جلب جميع الطلبات الخاصة بالشركة
  getRequests: async () => {
    const response = await api.get('/company/requests');
    return response.data;
  },

  // 🔹 حذف طلب محدد حسب الفهرس
  deleteRequest: async (index) => {
    const response = await api.delete(`/company/requests/${index}`);
    return response.data;
  },

  // 🔹 إرسال طلب خارجي (يُستخدم من تطبيقات أو مواقع خارجية بالـ API Key)
  submitExternalRequest: async (apiKey, customerName, product, message) => {
    const response = await api.post('/company/external-request', {
      apiKey,
      customerName,
      product,
      message,
    });
    return response.data;
  },
};


// خدمات المشاريع
export const projectService = {
  getProjects: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  updateProject: async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
};

// خدمات الدردشة
export const chatService = {
  sendMessage: async (message, apiKey) => {
    const response = await api.post('/chat', { message, apiKey });
    return response.data.reply || 'لم يتم تلقي رد';
  },

  getChatHistory: async (projectId) => {
    const response = await api.get(`/chat/${projectId}`);
    return response.data;
  },
};

export default api;
