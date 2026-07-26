import { getAccessToken } from "./auth";

const API_URL = "http://127.0.0.1:8000";

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }, 
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Login failed");
  }

  return response.json(); 
}


export async function signup(email: string, password: string, username: string) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, username }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Signup failed");
  }

  return response.json(); 
}


export async function getTransactions() {
  const token = await getAccessToken();
  const response = await fetch(`${API_URL}/transactions/`, {
    headers: { Authorization: `Bearer ${token}` }, 
  });
  if (!response.ok) throw new Error("Failed to load transactions");
  return response.json();
}


export async function createTransaction(amount: number, description: string, category: string) {
  const token = await getAccessToken();
  const response = await fetch(`${API_URL}/transactions/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount, description, category }),
  });
  if (!response.ok) throw new Error("Failed to create transaction");
  return response.json();
}