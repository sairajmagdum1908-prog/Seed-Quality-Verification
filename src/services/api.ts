const API_BASE = '/api';

export const api = {
  async post(endpoint: string, data: any) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
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
  },
  async get(endpoint: string) {
    const res = await fetch(`${API_BASE}${endpoint}`);
    
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
