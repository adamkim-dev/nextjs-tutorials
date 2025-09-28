import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchUsers,
  fetchUserById,
  createUser,
} from "../redux/slices/userSlice";
import { User } from "../models";

const useUsers = () => {
  const dispatch = useAppDispatch();
  const { users, status, error } = useAppSelector((state) => state.users);

  useEffect(() => {
    if (status === "idle" || !users.length) {
      dispatch(fetchUsers());
    }
  }, [status, dispatch, users]);

  const refetch = () => {
    dispatch(fetchUsers());
  };

  const getUserById = (userId: string) => {
    return users.find((user) => user.id === userId);
  };

  const addUser = (userData: Omit<User, "id" | "spentMoney">) => {
    return dispatch(createUser(userData));
  };

  return {
    data: users,
    isLoading: status === "loading",
    isError: status === "failed",
    error,
    refetch,
    getUserById,
    addUser,
  };
};

export default useUsers;
