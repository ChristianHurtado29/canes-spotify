import axios, { AxiosRequestConfig, AxiosError } from 'axios';

let getAccessToken = () => '';
let updateAccessToken: (token: string) => void = () => {};

interface TokenSync {
  get: () => string;
  set: (token: string) => void;
}

export const initTokenSync = ({ get, set }: TokenSync): void => {
  getAccessToken = get;
  updateAccessToken = set;
};

export const spotifyApiRequest = async <T = unknown>(
  axiosConfig: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await axios<T>({
      ...axiosConfig,
      headers: {
        ...(axiosConfig.headers || {}),
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });

    return response.data;
  } catch (error: unknown) {
    const err = error as AxiosError;

    if (err.response?.status === 401) {
      console.warn('Access token expired. Refreshing...');

      try {
        const refreshResponse = await axios<{ access_token: string }>({
          method: 'GET',
          url: '/api/refresh-token',
        });

        const newAccessToken = refreshResponse.data.access_token;
        updateAccessToken(newAccessToken);

        const retryResponse = await axios<T>({
          ...axiosConfig,
          headers: {
            ...(axiosConfig.headers || {}),
            Authorization: `Bearer ${newAccessToken}`,
          },
        });

        return retryResponse.data;
      } catch (refreshError: unknown) {
        const refreshErr = refreshError as AxiosError;
        console.error(
          'Token refresh failed:',
          refreshErr.response?.data || refreshErr.message
        );
        throw refreshErr;
      }
    }

    console.error('Spotify API error:', err.response?.data || err.message);
    throw err;
  }
};
