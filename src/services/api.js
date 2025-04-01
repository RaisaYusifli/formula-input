import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const API_URL = 'https://652f91320b8d8ddac0b2b62b.mockapi.io/autocomplete';

const MOCK_SUGGESTIONS = [
  { id: '1', name: 'Revenue', description: 'Total income from sales' },
  { id: '2', name: 'Cost', description: 'Total expenses' },
  { id: '3', name: 'Profit', description: 'Revenue minus costs' },
  { id: '4', name: 'Growth', description: 'Percentage increase over time' },
  { id: '5', name: 'Customers', description: 'Number of paying customers' },
  { id: '6', name: 'Conversion', description: 'Percentage of visitors who become customers' },
  { id: '7', name: 'CAC', description: 'Customer Acquisition Cost' },
  { id: '8', name: 'LTV', description: 'Lifetime Value of a customer' },
  { id: '9', name: 'Churn', description: 'Rate at which customers stop subscribing' },
  { id: '10', name: 'MRR', description: 'Monthly Recurring Revenue' }
];

const filterMockData = (query) => {
  if (!query) return MOCK_SUGGESTIONS;
  const lowercaseQuery = query.toLowerCase();
  return MOCK_SUGGESTIONS.filter(item => 
    item.name.toLowerCase().includes(lowercaseQuery) || 
    item.description.toLowerCase().includes(lowercaseQuery)
  );
};

export const fetchSuggestions = async (query = '') => {
  try {
    const response = await axios.get(`${API_URL}?search=${query}`, {
      timeout: 5000
    });
    
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn('API returned unexpected format, using mock data');
      return filterMockData(query);
    }
  } catch (error) {
    console.warn('Error fetching autocomplete suggestions, using mock data:', error);
    return filterMockData(query);
  }
};

export const useSuggestions = (query) => {
  return useQuery({
    queryKey: ['suggestions', query],
    queryFn: () => fetchSuggestions(query),
    enabled: query?.length > 0,
    staleTime: 60000,
    keepPreviousData: true,
    retry: 1,
    onError: (error) => {
      console.error('Query error for suggestions:', error);
    }
  });
};