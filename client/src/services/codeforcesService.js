import axios from 'axios';

export const getContestHistory = async (handle) => {
  try {
    const response = await axios.get(`https://codeforces.com/api/user.rating?handle=${handle}`);
    return response.data.result;
  } catch (error) {
    console.error('Failed to fetch contest history:', error);
    return [];
  }
};
