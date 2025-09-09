/* eslint-disable @typescript-eslint/no-explicit-any */
import { SplitSBClient } from "../utils/supabase/SplitSBClient";
import { Activity } from "../models";
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
        activity_participants(*) 
      `
        )
        .eq("id", id)
        .single();

      if (error) {
        return { data: null, error: error };
      }

      // Chuyển đổi dữ liệu từ snake_case sang camelCase
      // và cấu trúc lại dữ liệu để phù hợp với model Activity
      const formattedData = {
        ...this.toCamelCase(data),
        participants: data.activity_participants
          ? this.toCamelCase(data.activity_participants)
          : [],
      };

      return {
        data: formattedData,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  createActivity = async (
    activity: Omit<Activity, "id">
  ): Promise<IBaseResponse<Activity>> => {
    try {
      const { participants, ...activityData } = activity;

      const snakeCaseActivityData = {
        trip_id: activityData.tripId,
        name: activityData.name,
        time: activityData.time,
        total_money: activityData.totalMoney || 0,
        payer_id: activityData.payerId,
      };

      // Tạo activity trước
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
          user_id: p.userId,
          total_money_per_user: p.totalMoneyPerUser || 0,
        }));

        const { error: participantsError } = await this.client
          .from("activity_participants")
          .insert(activityParticipants);

        if (participantsError) {
          console.error("Error adding participants:", participantsError);
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
      // Tách participants ra khỏi activity object nếu có
      const { participants, ...activityData } = activity;

      // Chuyển đổi các trường camelCase sang snake_case
      const snakeCaseActivityData: any = {};

      if (activityData.name !== undefined)
        snakeCaseActivityData.name = activityData.name;
      if (activityData.time !== undefined)
        snakeCaseActivityData.time = activityData.time;
      if (activityData.totalMoney !== undefined)
        snakeCaseActivityData.total_money = activityData.totalMoney;
      if (activityData.payerId !== undefined)
        snakeCaseActivityData.payer_id = activityData.payerId;
      if (activityData.tripId !== undefined)
        snakeCaseActivityData.trip_id = activityData.tripId;

      // Cập nhật activity
      const { data, error } = await this.client
        .from("activities")
        .update(snakeCaseActivityData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error };
      }

      // Nếu có participants, cập nhật bảng activity_participants
      if (participants && participants.length > 0) {
        // Xóa tất cả participants cũ
        const { error: deleteError } = await this.client
          .from("activity_participants")
          .delete()
          .eq("activity_id", id);

        if (deleteError) {
          console.error("Error deleting old participants:", deleteError);
          // Tiếp tục xử lý mặc dù có lỗi
        }

        // Thêm participants mới
        const activityParticipants = participants.map((p) => ({
          activity_id: id,
          user_id: p.userId,
          total_money_per_user: p.totalMoneyPerUser || 0,
        }));

        const { error: participantsError } = await this.client
          .from("activity_participants")
          .insert(activityParticipants);

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
