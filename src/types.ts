export type Role = {
  id?: string;
  name: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};
