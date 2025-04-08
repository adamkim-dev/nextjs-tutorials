import { useState } from 'react'
import { toast } from 'react-toastify'
import useSWR from 'swr'

export interface User {
	id: number
	email: string
	first_name: string
	last_name: string
	avatar: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export const useUsers = () => {
	const [pageIndex, setPageIndex] = useState(1)

	// Fetch users with SWR
	const { data, error, isLoading, mutate } = useSWR(
		`https://reqres.in/api/users?page=${pageIndex}`,
		fetcher,
		{
			revalidateIfStale: false,
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
		},
	)

	// Edit user (mock implementation)
	const editUser = async (id: number, updatedUser: Partial<User>) => {
		// Mock API call
		await new Promise((resolve) => setTimeout(resolve, 500))
		// Update the local data
		mutate((currentData: { data: User[]; total_pages: number }) => {
			const updatedUsers = currentData.data.map((user: User) =>
				user.id === id ? { ...user, ...updatedUser } : user,
			)
			return { ...currentData, data: updatedUsers }
		}, false)
	}

	// Remove user
	const removeUser = async (id: number) => {
		// Mock API call
		await new Promise((resolve) => setTimeout(resolve, 500))
		// Update the local data
		mutate((currentData: { data: User[]; total_pages: number }) => {
			toast.success('User removed successfully')
			const filteredUsers = currentData.data.filter((user: User) => user.id !== id)
			return { ...currentData, data: filteredUsers }
		}, false)
	}

	return {
		users: data?.data || [],
		totalPages: data?.total_pages || 1,
		isLoading,
		error,
		pageIndex,
		setPageIndex,
		editUser,
		removeUser,
	}
}
