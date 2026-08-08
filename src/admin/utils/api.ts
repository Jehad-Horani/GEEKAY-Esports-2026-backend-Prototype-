export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('geekay_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('geekay_token');
  const reqHeaders = (options.headers as Record<string, string>) || {};
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...reqHeaders,
  };
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
};
