import { User } from "@/services/auth";

type Listener = () => void;

let _user: User | null = null;
let _isAuthenticated: boolean = false;

const listeners = new Set<Listener>();

export const getUserState = () => _user;
export const getAuthState = () => _isAuthenticated;

export const setAuthState = (user: User | null, isAuth: boolean) => {
  _user = user;
  _isAuthenticated = isAuth;
  listeners.forEach((listener) => listener());
};

export const subscribeToAuthChanges = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener); // unsubscribe
};
