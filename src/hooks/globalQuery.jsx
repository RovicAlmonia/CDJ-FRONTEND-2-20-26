import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {http} from '../api/http';

const hookContainer = (urlEndPoint = false, paramsVar = [], enabled = true) => {
	// Ensure paramsVar is always an array
	const queryParams = Array.isArray(paramsVar) ? paramsVar : [paramsVar];

	if (urlEndPoint) {
		const queryResult = useQuery({
			queryKey: [urlEndPoint, ...queryParams],
			enabled,
			queryFn: async () => {
				const response = await http.get(urlEndPoint, { params: queryParams[0] || {} });
				return response.data;
			},
			onError: () => {
				toast.error('Connection failed!');
			},
			staleTime: 60000, 
			cacheTime: 300000,
		});
		return {
			...queryResult,
			isLoading: queryResult.isLoading,
		};
	}
	return { data: null, isLoading: false, isError: false, refetch: () => {} };
};
export { hookContainer};

export default {
	hookContainer,
};
