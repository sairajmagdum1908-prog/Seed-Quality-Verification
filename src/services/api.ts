const API_BASE = '/api';

export const api = {
  getToken() {
    return localStorage.getItem('agritrust_token');
  },
  async post(endpoint: string, data: any) {
    try {
      const token = this.getToken();
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(data),
      });
      
      return await this.handleResponse(res);
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        throw new Error('Server connection error. Please ensure the backend is running.');
      }
      throw err;
    }
  },
  async get(endpoint: string) {
    try {
      const token = this.getToken();
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      return await this.handleResponse(res);
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        throw new Error('Server connection error. Please ensure the backend is running.');
      }
      throw err;
    }
  },
  async delete(endpoint: string) {
    try {
      const token = this.getToken();
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      return await this.handleResponse(res);
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        throw new Error('Server connection error. Please ensure the backend is running.');
      }
      throw err;
    }
  },
  async handleResponse(res: Response) {
    let result;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      result = await res.json();
    } else {
      const text = await res.text();
      throw new Error(text || `Server error: ${res.status}`);
    }

    if (!res.ok) throw new Error(result.message || result.error || 'API Error');
    return result;
  }
};
