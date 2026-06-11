export interface UserType {
  id: string;
  email?: { address: string };
}

export interface AuthContextType {
  ready: boolean;
  authenticated: boolean;
  user: UserType | null;
  login: () => void;
  logout: () => void;
  getAccessToken: () => Promise<string | null>;
}
