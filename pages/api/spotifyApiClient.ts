import axios from 'axios';

let getAccessToken = () => '';
let updateAccessToken = (token: string) => {};

interface TokenSync {
  get: () => string;
  set: (token: string) => void;
}

export const initTokenSync = ({ get, set }: TokenSync) => {
  getAccessToken = get;
  updateAccessToken = set;
};

export const spotifyApiRequest = async (axiosConfig: any): Promise<any> => {
  try {
    const response = await axios({
      ...axiosConfig,
      headers: {
        ...(axiosConfig.headers || {}),
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.warn('Access token expired. Refreshing...');

      try {
        // Call your existing /api/refresh-token endpoint
        const refreshResponse = await axios.get('/api/refresh-token');
        const newAccessToken = refreshResponse.data.access_token;

        // Update TokenContext
        updateAccessToken(newAccessToken);

        // Retry original request
        const retryResponse = await axios({
          ...axiosConfig,
          headers: {
            ...(axiosConfig.headers || {}),
            Authorization: `Bearer ${newAccessToken}`,
          },
        });

        return retryResponse.data;
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError.response?.data || refreshError.message);
        throw refreshError;
      }
    } else {
      console.error('Spotify API error:', error.response?.data || error.message);
      throw error;
    }
  }
};
