import { User as PrismaUser } from '@prisma/client';

export class User implements PrismaUser {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isValidForOrder(): boolean {
    return this.isActive && this.address !== null && this.phone !== null;
  }

  canManageSystem(): boolean {
    return this.isAdmin && this.isActive;
  }

  toPublicProfile() {
    const { password, ...publicProfile } = this;
    return publicProfile;
  }
}
