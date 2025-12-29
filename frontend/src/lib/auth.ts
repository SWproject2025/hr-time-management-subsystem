import Cookies from 'js-cookie';

// 1. Login: Save the token to a cookie
export const login = (token: string) => {
  // Save cookie for 1 day
  Cookies.set('token', token, { expires: 1 });
};

// 2. Logout: Remove the cookie
export const logout = () => {
  Cookies.remove('token');
  // Optional: Redirect to login if called explicitly
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

// 3. Get Token: Retrieve from cookie
export const getToken = () => {
  return Cookies.get('token');
};

// 4. AuthFetch: Wrapper for fetch that adds the Authorization header automatically
export const authFetch = async (url: string, options: any = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Auto-logout if token is invalid (401)
  if (response.status === 401) {
    logout();
  }

  return response;
};