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

export async function getCategories() {
  const token = await getAccessToken();
  const response = await fetch(`${API_URL}/categories/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to load categories");
  return response.json();
}

export async function createCategory(name: string) {
  const token = await getAccessToken();
  const response = await fetch(`${API_URL}/categories/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create category");
  }
  return response.json();
}

export async function updateTransaction(id: number, amount: number, description: string, category: string) {
  const token = await getAccessToken();
  const response = await fetch(`${API_URL}/transactions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount, description, category }),
  });
  if (!response.ok) throw new Error("Failed to update transaction");
  return response.json();
}

export async function deleteTransaction(id: number) {
  const token = await getAccessToken();
  const response = await fetch(`${API_URL}/transactions/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to delete transaction");
  return response.json();
}