import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export async function saveTokens(accessToken: string, refreshToken: string) {
  await AsyncStorage.setItem(ACCESS_KEY, accessToken);
  await AsyncStorage.setItem(REFRESH_KEY, refreshToken);
}

export async function getAccessToken() {
  return AsyncStorage.getItem(ACCESS_KEY);
}

export async function clearTokens() {
  await AsyncStorage.removeItem(ACCESS_KEY);
  await AsyncStorage.removeItem(REFRESH_KEY);
}