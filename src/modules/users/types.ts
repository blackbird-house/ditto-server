export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface CreateUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserService {
  createUser(userData: CreateUserRequest): User;
  getUserById(id: string): User | null;
  getUserByEmail(email: string): User | null;
  getAllUsers(): User[];
  updateUser(id: string, userData: Partial<CreateUserRequest>): User | null;
  deleteUser(id: string): boolean;
}
