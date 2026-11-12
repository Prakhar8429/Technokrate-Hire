import AsyncStorage from '@react-native-async-storage/async-storage';

export const AUTH_TOKEN = 'auth_token';
export const AUTH_USER = 'auth_user';

// In-memory cache for synchronous fallback and fast lookup
let inMemoryToken = null;
let inMemoryUser = null;

export const saveToken = async (token) => {
  inMemoryToken = token || null;
  try {
    if (token) {
      await AsyncStorage.setItem(AUTH_TOKEN, token);
    } else {
      await AsyncStorage.removeItem(AUTH_TOKEN);
    }
  } catch (error) {
    // Graceful fallback to inMemoryToken
  }
};

export const getToken = async () => {
  if (inMemoryToken) return inMemoryToken;
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN);
    if (token) {
      inMemoryToken = token;
      return token;
    }
    return inMemoryToken;
  } catch (error) {
    return inMemoryToken;
  }
};

export const removeToken = async () => {
  inMemoryToken = null;
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN);
  } catch (error) {
    // Ignore
  }
};

export const saveUser = async (user) => {
  inMemoryUser = user || null;
  try {
    if (user) {
      await AsyncStorage.setItem(AUTH_USER, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(AUTH_USER);
    }
  } catch (error) {
    // Graceful fallback
  }
};

export const getUser = async () => {
  if (inMemoryUser) return inMemoryUser;
  try {
    const raw = await AsyncStorage.getItem(AUTH_USER);
    if (raw) {
      inMemoryUser = JSON.parse(raw);
      return inMemoryUser;
    }
    return inMemoryUser;
  } catch (error) {
    return inMemoryUser;
  }
};

export const removeUser = async () => {
  inMemoryUser = null;
  try {
    await AsyncStorage.removeItem(AUTH_USER);
  } catch (error) {
    // Ignore
  }
};

export const clearAuth = async () => {
  inMemoryToken = null;
  inMemoryUser = null;
  try {
    await AsyncStorage.multiRemove([AUTH_TOKEN, AUTH_USER]);
  } catch (error) {
    // Ignore
  }
};

export const isAuthenticated = async () => {
  const token = await getToken();
  return Boolean(token);
};

export default {
  AUTH_TOKEN,
  AUTH_USER,
  saveToken,
  getToken,
  removeToken,
  saveUser,
  getUser,
  removeUser,
  clearAuth,
  isAuthenticated,
};
