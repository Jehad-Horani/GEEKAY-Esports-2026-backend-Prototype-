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

export const handleAuthError = (res: Response) => {
  if (res.status === 401) {
    localStorage.removeItem('geekay_token');
    localStorage.removeItem('geekay_user');
    if (!window.location.pathname.includes('/admin/login')) {
      window.location.href = '/admin/login';
    }
  }
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
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
  
  if (response.status === 401) {
    handleAuthError(response);
  }

  return response;
};

