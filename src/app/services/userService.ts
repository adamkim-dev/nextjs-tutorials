/* eslint-disable @typescript-eslint/no-explicit-any */
import { SplitSBClient } from "../utils/supabase/SplitSBClient";
import { User } from "../models";
import { IBaseResponse } from "../model/common.model";

export class UserService extends SplitSBClient {
  constructor() {
    super();
  }

  fetchAllUsers = async (): Promise<IBaseResponse<User[]>> => {
    try {
      const { data, error } = await this.client.from("users").select("*");

      if (error) {
        return { data: null, error: error };
      }

      const users = data.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phone_number || "",
        spentMoney: 0,
        salary: user.salary ?? undefined,
        dailyAllowance: user.daily_allowance ?? undefined,
        payday: user.payday ?? undefined,
      }));

      return {
        data: users,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  fetchAllUsersWithFinance = async (): Promise<IBaseResponse<any[]>> => {
    try {
      const res = await fetch('/api/users/with-finance', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) {
        return { data: null, error: json?.error || new Error('Failed to fetch users with finance') };
      }
      return { data: json.data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  fetchUserById = async (id: string): Promise<IBaseResponse<User>> => {
    try {
      const { data, error } = await this.client
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return { data: null, error: error };
      }

      const user = {
        id: data.id,
        name: data.name,
        email: data.email,
        phoneNumber: data.phone_number || "",
        spentMoney: 0,
        salary: data.salary ?? undefined,
        dailyAllowance: data.daily_allowance ?? undefined,
        payday: data.payday ?? undefined,
      };

      return {
        data: user,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  createUser = async (
    user: Omit<User, "id" | "spentMoney">
  ): Promise<IBaseResponse<User>> => {
    try {
      const supabaseUser = {
        name: user.name,
        email: user.email,
        phone_number: user.phoneNumber,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.client
        .from("users")
        .insert(supabaseUser)
        .select()
        .single();

      if (error) {
        return { data: null, error: error };
      }

      const createdUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        phoneNumber: data.phone_number || "",
        spentMoney: 0,
      };

      return {
        data: createdUser,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };
}

// Singleton pattern
const userService = new UserService();

export default userService;
