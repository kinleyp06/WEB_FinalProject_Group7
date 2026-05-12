// frontend/lib/api.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: "STUDENT" | "ADMIN";
}

// Mock user data - replace with your actual auth logic
const MOCK_USER: User = {
  id: "1",
  email: "student@example.com",
  name: "John Doe",
  role: "STUDENT"
};

export function getCurrentUser(): User | null {
  // Check if running in browser
  if (typeof window === 'undefined') return null;
  
  // Get user from localStorage or session
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User): void {
  localStorage.setItem('user', JSON.stringify(user));
}

export function removeCurrentUser(): void {
  localStorage.removeItem('user');
}

// Example login function
export async function login(email: string, password: string): Promise<User> {
  // Replace with your actual API call
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) throw new Error('Login failed');
  
  const user = await response.json();
  setCurrentUser(user);
  return user;
}