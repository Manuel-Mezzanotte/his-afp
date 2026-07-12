export type StaffRole = 'DOC' | 'INF' | 'AMM';

export interface StaffUser {
  id: number;
  username: string;
  role: StaffRole;
  isActive: boolean;
}

export type CreatedStaffUser = Omit<StaffUser, 'isActive'>;

export type StaffRoleUpdateResponse = Pick<StaffUser, 'id' | 'username' | 'role'>;

export interface CreateStaffUser {
  username: string;
  password: string;
  role: StaffRole;
}

export interface UpdateStaffRole {
  role: StaffRole;
}

export interface UsernameAvailability {
  available: boolean;
}

export const staffRoleLabels: Record<StaffRole, string> = {
  DOC: 'Medico',
  INF: 'Infermiere',
  AMM: 'Amministrativo',
};
