/** App-wide TypeScript types */

export type Role = 'owner' | 'driver';

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Timestamps {
  createdAt: number;
  updatedAt: number;
}
