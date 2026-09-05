import axios from "axios";

// If deployed or in dev with proxy, '/api' resolves to backend
const baseURL = import.meta.env.VITE_API_URL || "/api";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Inject JWT token if stored
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("coconuthub_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const pricesApi = {
  getToday: () => apiClient.get("/prices/today").then((res) => res.data),
  getCdaAlert: () => apiClient.get("/prices/cda-alert").then((res) => res.data),
  syncCda: () => apiClient.post("/prices/sync-cda").then((res) => res.data),
  getTrend: (commodity = "coconut", weeks = 8) =>
    apiClient.get(`/prices/trend?commodity=${commodity}&weeks=${weeks}`).then((res) => res.data),
};

export const millsApi = {
  getMills: (category = "all", district = "all") =>
    apiClient.get(`/mills?category=${category}&district=${district}`).then((res) => res.data),
  createMill: (data) => apiClient.post("/mills", data).then((res) => res.data),
};

export const listingsApi = {
  getListings: (category = "all", orderId = null) => {
    const params = new URLSearchParams();
    if (category && category !== "all") params.append("category", category);
    if (orderId) params.append("order_id", orderId);
    return apiClient.get(`/listings?${params.toString()}`).then((res) => res.data);
  },
  createListing: (data) => apiClient.post("/listings", data).then((res) => res.data),
  getUnlockedContact: (listingId, orderId) =>
    apiClient.get(`/listings/${listingId}/contact?order_id=${orderId}`).then((res) => res.data),
};

export const paymentsApi = {
  createPayment: (listingId, listingTitle) =>
    apiClient.post("/payments/create", {
      listing_id: listingId,
      listing_title: listingTitle,
      origin_url: window.location.origin,
    }).then((res) => res.data),
  completeDemo: (orderId) =>
    apiClient.post(`/payments/demo-complete/${orderId}`).then((res) => res.data),
  getStatus: (orderId) =>
    apiClient.get(`/payments/status/${orderId}`).then((res) => res.data),
};

export const authApi = {
  sendOtp: (phoneNumber) =>
    apiClient.post("/auth/send-otp", { phoneNumber }).then((res) => res.data),
  verifyOtp: (phoneNumber, otpCode, fullName, district) =>
    apiClient.post("/auth/verify-otp", { phoneNumber, otpCode, fullName, district }).then((res) => res.data),
};

export const chatsApi = {
  getMessages: (topic = "all", district = "all", search = "") => {
    const params = new URLSearchParams();
    if (topic && topic !== "all") params.append("topic", topic);
    if (district && district !== "all") params.append("district", district);
    if (search && search.trim()) params.append("search", search.trim());
    return apiClient.get(`/chats?${params.toString()}`).then((res) => res.data);
  },
  postMessage: (data) => apiClient.post("/chats", data).then((res) => res.data),
  likeMessage: (id) => apiClient.post(`/chats/${id}/like`).then((res) => res.data),
  getUserDiscussions: (userId) => apiClient.get(`/chats/user/${userId}`).then((res) => res.data),
};

export const notificationsApi = {
  getNotifications: (userId, limit = 30) =>
    apiClient.get(`/notifications?userId=${userId}&limit=${limit}`).then((res) => res.data),
  getUnreadCount: (userId) =>
    apiClient.get(`/notifications/unread-count?userId=${userId}`).then((res) => res.data),
  markAsRead: (id) =>
    apiClient.post(`/notifications/${id}/read`).then((res) => res.data),
  markAllAsRead: (userId) =>
    apiClient.post(`/notifications/read-all?userId=${userId}`).then((res) => res.data),
};

