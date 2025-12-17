import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Get auth token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// AI Content Generation
export const generateAIContent = async (productId: string) => {
  const { data } = await axios.post(
    `${API_URL}/ai/generate/${productId}`,
    {},
    { headers: getAuthHeader() }
  );
  return data;
};

export const approveAIContent = async (productId: string) => {
  const { data } = await axios.put(
    `${API_URL}/ai/approve/${productId}`,
    {},
    { headers: getAuthHeader() }
  );
  return data;
};

export const rejectAIContent = async (productId: string) => {
  const { data } = await axios.put(
    `${API_URL}/ai/reject/${productId}`,
    {},
    { headers: getAuthHeader() }
  );
  return data;
};

export const regenerateAIContent = async (productId: string) => {
  const { data } = await axios.put(
    `${API_URL}/ai/regenerate/${productId}`,
    {},
    { headers: getAuthHeader() }
  );
  return data;
};

export const analyzeProduct = async (productId:  string) => {
  const { data } = await axios.get(
    `${API_URL}/ai/analyze/${productId}`,
    { headers: getAuthHeader() }
  );
  return data;
};

export const batchGenerateAI = async (productIds: string[]) => {
  const { data } = await axios.post(
    `${API_URL}/ai/batch-generate`,
    { productIds },
    { headers: getAuthHeader() }
  );
  return data;
};

export const getAIProductsStatus = async () => {
  const { data } = await axios.get(
    `${API_URL}/ai/products/status`,
    { headers: getAuthHeader() }
  );
  return data;
};

export const generateCategoryBuyingGuide = async (categoryId: string) => {
  const { data } = await axios.post(
    `${API_URL}/ai/category/${categoryId}/buying-guide`,
    {},
    { headers: getAuthHeader() }
  );
  return data;
};

export const generateProductComparison = async (productId1: string, productId2: string) => {
  const { data } = await axios.post(
    `${API_URL}/ai/compare`,
    { productId1, productId2 },
    { headers: getAuthHeader() }
  );
  return data;
};