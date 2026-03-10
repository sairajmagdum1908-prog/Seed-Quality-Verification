const API_BASE = '/api';

export const api = {
  async post(endpoint: string, data: any) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'API Error');
    return result;
  },
  async get(endpoint: string) {
    const res = await fetch(`${API_BASE}${endpoint}`);
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'API Error');
    return result;
  }
};
