/* eslint-disable @typescript-eslint/no-explicit-any */
import { SplitSBClient } from "../utils/supabase/SplitSBClient";
import { Activity, NewActivityPayload } from "../models";
import { IBaseResponse } from "../model/common.model";

export class ActivityService extends SplitSBClient {
  constructor() {
    super();
  }

  fetchAllActivities = async (): Promise<IBaseResponse<Activity[]>> => {
    try {
      const { data, error } = await this.client.from("activities").select("*");

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

  fetchActivitiesByTripId = async (
    tripId: string
  ): Promise<IBaseResponse<Activity[]>> => {
    try {
      const { data, error } = await this.client
        .from("activities")
        .select("*")
        .eq("trip_id", tripId);

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

  fetchActivityById = async (id: string): Promise<IBaseResponse<Activity>> => {
    try {
      const { data, error } = await this.client
        .from("activities")
        .select(
          `
        *,
        activity_participants(id,user_id, total_money_per_user) 
      `
        )
        .eq("id", id)
        .single();

      if (error) {
        return { data: null, error: error };
      }
      console.log("🚀 ~ ActivityService ~ data:", this.toCamelCase(data));

      return {
        data: this.toCamelCase(data),
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  createActivity = async (
    activity: NewActivityPayload
  ): Promise<IBaseResponse<Activity>> => {
    try {
      const { participants, ...activityData } = activity;

      const snakeCaseActivityData = {
        trip_id: activityData.tripId,
        name: activityData.name,
        total_money: activityData.totalMoney || 0,
        payer_id: activityData.payerId,
      };

      const { data, error } = await this.client
        .from("activities")
        .insert(snakeCaseActivityData)
        .select()
        .single();

      if (error) {
        return { data: null, error: error };
      }

      if (participants && participants.length > 0) {
        const activityParticipants = participants.map((p) => ({
          activity_id: data.id,
          user_id: p.id,
          total_money_per_user: p.totalMoneyPerUser || 0,
        }));

        const { error: participantsError } = await this.client
          .from("activity_participants")
          .insert(activityParticipants);

        if (participantsError) {
          console.error("Error adding participants:", participantsError);
        }

        // Update trip_participants table with new money amounts
        for (const participant of participants) {
          // Get current participant data
          const { data: currentParticipant, error: fetchError } =
            await this.client
              .from("trip_participants")
              .select("*")
              .eq("trip_id", activityData.tripId)
              .eq("user_id", participant.id);

          if (fetchError) {
            console.error("Error fetching trip participant:", fetchError);
            continue;
          }

          if (currentParticipant && currentParticipant.length > 0) {
            // Update total_money_per_user for existing participant
            const updatedTotalMoneyPerUser =
              (currentParticipant[0].total_money_per_user || 0) +
              (participant.totalMoneyPerUser || 0);

            const { error: updateError } = await this.client
              .from("trip_participants")
              .update({
                total_money_per_user: updatedTotalMoneyPerUser,
              })
              .eq("trip_id", activityData.tripId)
              .eq("user_id", participant.id);

            if (updateError) {
              console.error("Error updating trip participant:", updateError);
            }
          } else {
            // Create new trip participant entry if not exists
            const { error: insertError } = await this.client
              .from("trip_participants")
              .insert({
                trip_id: activityData.tripId,
                user_id: participant.id,
                total_money_per_user: participant.totalMoneyPerUser || 0,
                is_paid: false,
                paid_amount: 0,
              });

            if (insertError) {
              console.error("Error inserting trip participant:", insertError);
            }
          }
        }
      }

      // Update trip_payers table
      if (activityData.payerId) {
        // Check if payer already exists in trip_payers
        const { data: existingPayers, error: payerFetchError } =
          await this.client
            .from("trip_payers")
            .select("*")
            .eq("trip_id", activityData.tripId)
            .eq("user_id", activityData.payerId);

        if (payerFetchError) {
          console.error("Error fetching trip payer:", payerFetchError);
        }

        if (existingPayers && existingPayers.length > 0) {
          // Update existing payer
          const updatedSpentMoney =
            (existingPayers[0].spent_money || 0) +
            (activityData.totalMoney || 0);

          const { error: updatePayerError } = await this.client
            .from("trip_payers")
            .update({
              spent_money: updatedSpentMoney,
            })
            .eq("trip_id", activityData.tripId)
            .eq("user_id", activityData.payerId);

          if (updatePayerError) {
            console.error("Error updating trip payer:", updatePayerError);
          }
        } else {
          // Create new payer entry
          const { error: insertPayerError } = await this.client
            .from("trip_payers")
            .insert({
              trip_id: activityData.tripId,
              user_id: activityData.payerId,
              spent_money: activityData.totalMoney || 0,
            });

          if (insertPayerError) {
            console.error("Error inserting trip payer:", insertPayerError);
          }
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

  updateActivity = async (
    id: string,
    activity: Partial<Activity>
  ): Promise<IBaseResponse<Activity>> => {
    try {
      const { activityParticipants, ...activityData } = activity;

      const snakeCaseActivityData: any = {};

      if (activityData.name !== undefined)
        snakeCaseActivityData.name = activityData.name;
      if (activityData.totalMoney !== undefined)
        snakeCaseActivityData.total_money = activityData.totalMoney;
      if (activityData.payerId !== undefined)
        snakeCaseActivityData.payer_id = activityData.payerId;
      if (activityData.tripId !== undefined)
        snakeCaseActivityData.trip_id = activityData.tripId;

      const { data, error } = await this.client
        .from("activities")
        .update(snakeCaseActivityData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error };
      }

      if (activityParticipants && activityParticipants.length > 0) {
        const { error: deleteError } = await this.client
          .from("activity_participants")
          .delete()
          .eq("activity_id", id);

        if (deleteError) {
          console.error("Error deleting old participants:", deleteError);
        }

        const newActivityParticipants = activityParticipants.map((p) => ({
          activity_id: id,
          user_id: p.id,
          total_money_per_user: p.totalMoneyPerUser || 0,
        }));

        const { error: participantsError } = await this.client
          .from("activity_participants")
          .insert(newActivityParticipants);

        if (participantsError) {
          console.error("Error adding participants:", participantsError);
          // Không xóa activity đã cập nhật, chỉ ghi log lỗi
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

  deleteActivity = async (id: string): Promise<IBaseResponse<null>> => {
    try {
      const { error } = await this.client
        .from("activities")
        .delete()
        .eq("id", id);

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
const activityService = new ActivityService();

export default activityService;
