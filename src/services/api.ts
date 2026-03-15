const API_BASE = "https://seed-quality-verification-1.onrender.com/api";

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
  async login(email: string, password: string) {
    return this.post('/auth/login', {
      email: email,
      password: password
    });
  },
  async register(data: any) {
    return this.post('/auth/register', data);
  },
  async getStats() {
    const res = await this.get('/stats');
    return res;
  },
  async getUsers() {
    const res = await this.get('/users/all-users');
    return res.users;
  },
  async getReports() {
    const res = await this.get('/reports/all-reports');
    return res.reports;
  },
  async deleteUser(id: string) {
    return this.delete(`/users/delete-user/${id}`);
  },
  async resolveReport(id: string) {
    return this.post(`/reports/resolve-report/${id}`, {});
  },
  async getTransactions() {
    const res = await this.get('/transactions');
    return res.transactions;
  },
  async verifySeed(id: string) {
    return this.get(`/seeds/verify-seed/${id}`);
  },
  async getSeeds() {
    const res = await this.get('/seeds');
    return res.seeds;
  },
  async createSeed(data: any) {
    return this.post('/seeds', data);
  },
  async recallSeed(id: string) {
    return this.post(`/seeds/recall-seed/${id}`, {});
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
