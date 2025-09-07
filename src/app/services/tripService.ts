/* eslint-disable @typescript-eslint/no-explicit-any */
import { SplitSBClient } from "../utils/supabase/SplitSBClient";
import { Trip } from "../models";
import { IBaseResponse } from "../model/common.model";

export class TripService extends SplitSBClient {
  constructor() {
    super();
  }

  fetchAllTrips = async (): Promise<IBaseResponse<Trip[]>> => {
    try {
      const { data, error } = await this.client.from("trips").select("*");

      if (error) {
        return { data: null, error: error };
      }

      return {
        data: data,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };
}

// Singleton pattern
const tripService = new TripService();

export default tripService;
