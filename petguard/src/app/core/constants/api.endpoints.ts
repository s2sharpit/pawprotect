import { environment } from '../../../environments/environment';

const BASE_URL = `${environment.apiUrl}/v1`;

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${BASE_URL}/auth/register`,
    LOGIN: `${BASE_URL}/auth/login`,
    LOGOUT: `${BASE_URL}/auth/logout`,
    ME: `${BASE_URL}/auth/me`,
  },
  AI: {
    CHAT: `${BASE_URL}/ai/chat`,
    CHECK_ELIGIBILITY: `${BASE_URL}/ai/check-eligibility`,
  },
  CLAIMS: {
    BASE: `${BASE_URL}/claims`,
    ALL: `${BASE_URL}/claims/all`,
    byId: (id: number) => `${BASE_URL}/claims/${id}`,
    review: (id: number) => `${BASE_URL}/claims/${id}/review`,
  },
  PETS: {
    BASE: `${BASE_URL}/pets`,
    byId: (id: number) => `${BASE_URL}/pets/${id}`,
  },
  PLANS: {
    BASE: `${BASE_URL}/plans`,
    byId: (id: number) => `${BASE_URL}/plans/${id}`,
    status: (id: number) => `${BASE_URL}/plans/${id}/status`,
  },
  POLICIES: {
    BASE: `${BASE_URL}/policies`,
    cancel: (id: number) => `${BASE_URL}/policies/${id}/cancel`,
  },
  DASHBOARD: {
    STATS: `${BASE_URL}/dashboard/stats`,
  },
  ADMIN: {
    STATS: `${BASE_URL}/dashboard/stats/global`,
  }
};
