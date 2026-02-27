export interface Subscription {
  id: string;
  name: string;
  websiteUrl: string;
  plan: string;
  amount: string;
  expirationDate: string;
  cancellationUrl: string;
}

export type SubscriptionFormData = Omit<Subscription, 'id'>;
