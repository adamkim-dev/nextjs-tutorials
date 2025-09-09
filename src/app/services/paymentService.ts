/* eslint-disable @typescript-eslint/no-explicit-any */
import { SplitSBClient } from "../utils/supabase/SplitSBClient";
import { PaymentHistory } from "../models";
import { IBaseResponse } from "../model/common.model";

export class PaymentService extends SplitSBClient {
  constructor() {
    super();
  }

  fetchPaymentsByTripId = async (
    tripId: string
  ): Promise<IBaseResponse<PaymentHistory[]>> => {
    try {
      const { data, error } = await this.client
        .from("payments")
        .select("*")
        .eq("tripId", tripId);

      if (error) {
        return { data: null, error: error };
      }

      return {
        data: this.toCamelCase(data),
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  createPayment = async (
    payment: Omit<PaymentHistory, "id">
  ): Promise<IBaseResponse<PaymentHistory>> => {
    try {
      const { data, error } = await this.client
        .from("payments")
        .insert(payment)
        .select()
        .single();

      if (error) {
        return { data: null, error: error };
      }

      return {
        data: this.toCamelCase(data),
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };
}

// Singleton pattern
const paymentService = new PaymentService();

export default paymentService;
