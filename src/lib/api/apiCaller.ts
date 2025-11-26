import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';

class ApiCaller {
    private instance: AxiosInstance;

    constructor(baseURL: string = '/api') {
        this.instance = axios.create({
            baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor
        this.instance.interceptors.request.use(
            (config) => {
                // Add any common request logic here
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.instance.interceptors.response.use(
            (response: AxiosResponse) => {
                return response;
            },
            (error) => {
                // Handle common error cases
                if (error.response?.status === 401) {
                    // Handle unauthorized
                    console.error('Unauthorized access');
                } else if (error.response?.status >= 500) {
                    // Handle server errors
                    console.error('Server error');
                }
                return Promise.reject(error);
            }
        );
    }

    // GET request
    async get<T>(url: string, params?: Record<string, any>): Promise<T> {
        try {
            const response = await this.instance.get(url, { params });
            return response.data;
        } catch (error) {
            console.error('GET request failed:', error);
            throw error;
        }
    }

    // POST request
    async post<T>(url: string, data?: any): Promise<T> {
        try {
            const response = await this.instance.post(url, data);
            return response.data;
        } catch (error) {
            console.error('POST request failed:', error);
            throw error;
        }
    }

    // PUT request
    async put<T>(url: string, data?: any): Promise<T> {
        try {
            const response = await this.instance.put(url, data);
            return response.data;
        } catch (error) {
            console.error('PUT request failed:', error);
            throw error;
        }
    }

    // DELETE request
    async delete<T>(url: string): Promise<T> {
        try {
            const response = await this.instance.delete(url);
            return response.data;
        } catch (error) {
            console.error('DELETE request failed:', error);
            throw error;
        }
    }

    // PATCH request
    async patch<T>(url: string, data?: any): Promise<T> {
        try {
            const response = await this.instance.patch(url, data);
            return response.data;
        } catch (error) {
            console.error('PATCH request failed:', error);
            throw error;
        }
    }
}

// Create and export a singleton instance
export const apiCaller = new ApiCaller();

// Export the class for creating custom instances if needed
export { ApiCaller };
