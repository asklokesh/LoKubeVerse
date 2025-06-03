import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const fetchTenants = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tenants/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tenants:', error);
    throw error;
  }
};

export const fetchClusters = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/clusters/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching clusters:', error);
    throw error;
  }
};
