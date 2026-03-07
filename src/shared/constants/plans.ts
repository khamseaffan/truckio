export const PLANS = {
  starter: {
    name: 'Starter',
    price: 299,
    currency: '₹',
    maxDrivers: 5,
    maxMaterials: 5,
  },
  growth: {
    name: 'Growth',
    price: 599,
    currency: '₹',
    maxDrivers: 20,
    maxMaterials: 30,
  },
  fleet: {
    name: 'Fleet',
    price: 999,
    currency: '₹',
    maxDrivers: 50,
    maxMaterials: Infinity,
  },
} as const;

export type PlanTier = keyof typeof PLANS;
