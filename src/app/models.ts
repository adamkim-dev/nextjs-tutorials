export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  spentMoney: number;
}

export interface ActivityParticipant {
  userId: string;
  isPaid: boolean;
  totalMoneyPerUser: number;
}

export interface Activity {
  id: string;
  tripId: string; // Reference to parent Trip
  name: string;
  time: string;
  participants: ActivityParticipant[];
  totalMoney: number;
  payerId: string; // Reference to User
}

export interface TripParticipant {
  userId: string;
  isPaid: boolean;
  totalMoneyPerUser: number;
  paidAmount: number; // Số tiền đã đóng
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
  activities: string[]; // Array of Activity IDs
  paymentHistory: string[]; // Array of PaymentHistory IDs
}
