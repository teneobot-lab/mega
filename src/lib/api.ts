export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Something went wrong");
  }
  return res.json();
};
