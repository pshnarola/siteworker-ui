import { UserRoles } from './UserRoles';

export class User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobilePhone: number;
  subAdminContactNumber: number;
  companyName: string;
  role: string;
  password: string;
  country: string;
  profileImage: string;
  workPhone: string;
  isActive: number;
  roles: UserRoles[];
}
