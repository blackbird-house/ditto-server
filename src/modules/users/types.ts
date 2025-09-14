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

export interface PublicUserResponse {
  id: string;
  firstName: string;
  lastName: string;
}

export interface UserService {
  createUser(userData: CreateUserRequest): User | Promise<User>;
  getUserById(id: string): User | null | Promise<User | null>;
  getUserByEmail(email: string): User | null | Promise<User | null>;
  getAllUsers(): User[] | Promise<User[]>;
  updateUser(id: string, userData: Partial<CreateUserRequest>): User | null | Promise<User | null>;
  deleteUser(id: string): boolean | Promise<boolean>;
}
