import { User } from 'firebase/auth';

export interface AppUser extends User {
  id?: string;
  is_admin?: string;
  sectors?: string;
  name?: string;
  email_address?: string;
}