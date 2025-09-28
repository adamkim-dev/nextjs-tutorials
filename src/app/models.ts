export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  spentMoney: number;
}

export interface ActivityParticipant {
  id: string;
  totalMoneyPerUser: number;
  userId: string;
}

export interface Activity {
  id: string;
  tripId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  activityParticipants?: ActivityParticipant[];
  totalMoney: number;
  payerId: string;
}

export interface TripParticipant {
  userId: string;
  isPaid: boolean;
  totalMoneyPerUser: number;
  paidAmount: number;
}

export interface TripPayer {
  userId: string;
  spentMoney: number;
}

export interface PaymentHistory {
  id: string;
  tripId: string;
  userId: string;
  amount: number;
  paymentDate: string;
  note?: string;
}

export type TripStatus = "planed" | "on-going" | "ended";

export interface Trip {
  id: string;
  name: string;
  date: string;
  participants: TripParticipant[];
  payers: TripPayer[];
  status: TripStatus;
  totalMoney: number;
  moneyPerUser: number;
  activities: TripActivity[];
  paymentHistory: string[];
}

export interface TripActivity {
  id: string;
  name: string;
  tripId: string;
  payerId: string;
  createdAt: string;
  updatedAt: string;
  totalMoney: number;
}

export interface NewActivityPayload {
  tripId: string;
  name: string;
  totalMoney: number;
  payerId: string;
  participants: ActivityParticipant[];
}
