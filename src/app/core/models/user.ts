export interface User {
  id?: number;
  username: string;
  email: string;
  roles: string[]; // Uso un Union Type para evitar errores de dedo
  token: string;
}
