/* eslint-disable @typescript-eslint/no-explicit-any */
import { SplitSBClient } from "../utils/supabase/SplitSBClient";
import { Activity, Trip } from "../models";
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
        data: this.toCamelCase(data),
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  fetchTripById = async (id: string): Promise<IBaseResponse<Trip>> => {
    try {
      const { data, error } = await this.client
        .from("trips")
        .select(
          `
        *,
        trip_participants(*),
        activities(*)
      `
        )
        .eq("id", id)
        .single();

      if (error) {
        return { data: null, error: error };
      }

      // Chuyển đổi dữ liệu từ snake_case sang camelCase
      // và cấu trúc lại dữ liệu để phù hợp với model Trip
      const formattedActivities = data.activities
        ? data.activities.map((activity: Activity) => ({
            ...this.toCamelCase(activity),
            participants: activity.participants
              ? activity.participants.map((participant: any) => ({
                  ...this.toCamelCase(participant),
                  totalMoneyPerUser: participant.total_money_per_user || 0,
                }))
              : [],
          }))
        : [];

      const formattedData = {
        ...this.toCamelCase(data),
        participants: data.trip_participants
          ? this.toCamelCase(data.trip_participants)
          : [],
        activities: formattedActivities,
      };

      return {
        data: formattedData,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  createTrip = async (trip: Omit<Trip, "id">): Promise<IBaseResponse<Trip>> => {
    try {
      // Tách participants ra khỏi trip object
      const { participants, ...tripData } = trip;

      // Chuyển đổi các trường camelCase sang snake_case
      const snakeCaseTripData = {
        name: tripData.name,
        date: tripData.date,
        status: tripData.status,
        total_money: tripData.totalMoney || 0,
        money_per_user: tripData.moneyPerUser || 0,
      };

      // Tạo trip trước
      const { data, error } = await this.client
        .from("trips")
        .insert(snakeCaseTripData)
        .select()
        .single();

      if (error) {
        return { data: null, error: error };
      }

      // Nếu có participants, thêm vào bảng trip_participants
      if (participants && participants.length > 0) {
        const tripParticipants = participants.map((p) => ({
          trip_id: data.id,
          user_id: p.userId,
          is_paid: p.isPaid || false,
          total_money_per_user: p.totalMoneyPerUser || 0,
          paid_amount: p.paidAmount || 0,
        }));

        const { error: participantsError } = await this.client
          .from("trip_participants")
          .insert(tripParticipants);

        if (participantsError) {
          console.error("Error adding participants:", participantsError);
          // Không xóa trip đã tạo, chỉ ghi log lỗi
        }
      }

      return {
        data: this.toCamelCase(data),
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  updateTrip = async (
    id: string,
    trip: Partial<Trip>
  ): Promise<IBaseResponse<Trip>> => {
    try {
      const { data, error } = await this.client
        .from("trips")
        .update(trip)
        .eq("id", id)
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

  deleteTrip = async (id: string): Promise<IBaseResponse<null>> => {
    try {
      const { error } = await this.client.from("trips").delete().eq("id", id);

      if (error) {
        return { data: null, error: error };
      }

      return {
        data: null,
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
