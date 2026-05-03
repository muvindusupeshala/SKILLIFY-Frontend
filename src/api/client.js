import Constants from 'expo-constants';
import { Platform } from 'react-native';

let authToken = null;
let currentUser = null;

const apiPort = process.env.EXPO_PUBLIC_API_PORT || '5000';
const envUrl = process.env.EXPO_PUBLIC_API_URL;

function getExpoHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost ||
    '';

  return hostUri.split(':')[0];
}

function getDefaultHost() {
  if (Platform.OS === 'web') return `http://localhost:${apiPort}`;

  const expoHost = getExpoHost();
  if (expoHost) return `http://${expoHost}:${apiPort}`;

  if (Platform.OS === 'android') return `http://10.0.2.2:${apiPort}`;
  return `http://localhost:${apiPort}`;
}

function normalizeBaseUrl(value) {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.toLowerCase() === 'auto') return getDefaultHost();
  return trimmed;
}

export const API_BASE_URL = normalizeBaseUrl(envUrl).replace(/\/$/, '');

function buildApiUrl(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (API_BASE_URL.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
    return `${API_BASE_URL}${cleanEndpoint.slice(4)}`;
  }
  return `${API_BASE_URL}${cleanEndpoint}`;
}

export function setAuthSession(token, user) {
  authToken = token;
  currentUser = user;
}

export function clearAuthSession() {
  authToken = null;
  currentUser = null;
}

export function getCurrentUser() {
  return currentUser;
}

export async function apiFetch(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(options.headers || {}),
  };

  let response;
  try {
    response = await fetch(buildApiUrl(endpoint), {
      ...options,
      headers,
    });
  } catch (error) {
    throw new Error(`Cannot reach API at ${API_BASE_URL}. Make sure the backend is running and your phone is on the same Wi-Fi.`);
  }

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      data = { message: text };
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with ${response.status}`);
  }

  return data;
}
