// Platform requires port 3000 for external access.
// Using relative path '/api' is the most robust way to connect to the backend in this environment.
// For external deployments (Vercel/Render), we use VITE_API_URL.
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const api = {
  async post(endpoint: string, data: any) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      return await this.handleResponse(res);
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        throw new Error('Server connection error. Please start the backend server.');
      }
      throw err;
    }
  },
  async get(endpoint: string) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`);
      return await this.handleResponse(res);
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        throw new Error('Server connection error. Please start the backend server.');
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
