const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  role: 'CUSTOMER' | 'MERCHANT' | 'RIDER';
}

export interface LoginRequest {
  email: string;
  password: string;
  role: 'CUSTOMER' | 'MERCHANT' | 'RIDER';
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'CUSTOMER' | 'MERCHANT' | 'RIDER';
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'MERCHANT' | 'RIDER';
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies in requests
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(credentials: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    return response.data!;
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    return response.data!;
  }

  async refresh(): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
    });
    
    return response.data!;
  }

  async getProfile(): Promise<User> {
    const response = await this.request<User>('/auth/me');
    return response.data!;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout request failed:', error);
    }
  }

  async logoutAll(): Promise<void> {
    try {
      await this.request('/auth/logout-all', { method: 'POST' });
    } catch (error) {
      console.error('Logout all request failed:', error);
    }
  }

  // Protected endpoint example
  async getUserInfo(): Promise<any> {
    const response = await this.request('/users');
    return response.data;
  }

  // Customer endpoints
  async getStores(params?: any): Promise<any> {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.request(`/customer/stores${queryString ? `?${queryString}` : ''}`);
    return response.data;
  }

  async searchStores(query: string, params?: any): Promise<any> {
    const searchParams = { q: query, ...params };
    const queryString = new URLSearchParams(searchParams).toString();
    const response = await this.request(`/customer/stores/search?${queryString}`);
    return response.data;
  }

  async getStoreById(id: string): Promise<any> {
    const response = await this.request(`/customer/stores/${id}`);
    return response.data;
  }

  async getStoreProducts(storeId: string, params?: any): Promise<any> {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.request(`/customer/stores/${storeId}/products${queryString ? `?${queryString}` : ''}`);
    return response.data;
  }

  async getProducts(params?: any): Promise<any> {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.request(`/customer/products${queryString ? `?${queryString}` : ''}`);
    return response.data;
  }

  async searchProducts(query: string, params?: any): Promise<any> {
    const searchParams = { q: query, ...params };
    const queryString = new URLSearchParams(searchParams).toString();
    const response = await this.request(`/customer/products/search?${queryString}`);
    return response.data;
  }

  async getProductById(id: string): Promise<any> {
    const response = await this.request(`/customer/products/${id}`);
    return response.data;
  }

  async getFeaturedProducts(limit?: number): Promise<any> {
    const params = limit ? { limit: limit.toString() } : {};
    const queryString = new URLSearchParams(params).toString();
    const response = await this.request(`/customer/products/featured${queryString ? `?${queryString}` : ''}`);
    return response.data;
  }

  async createOrder(orderData: any): Promise<any> {
    const response = await this.request('/customer/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return response.data;
  }

  async getCustomerOrders(params?: any): Promise<any> {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.request(`/customer/orders${queryString ? `?${queryString}` : ''}`);
    return response.data;
  }

  async getOrderById(id: string): Promise<any> {
    const response = await this.request(`/customer/orders/${id}`);
    return response.data;
  }

  async cancelOrder(id: string): Promise<any> {
    const response = await this.request(`/customer/orders/${id}/cancel`, {
      method: 'PATCH',
    });
    return response.data;
  }

  async rateOrder(id: string, rating: number, review?: string): Promise<any> {
    const response = await this.request(`/customer/orders/${id}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, review }),
    });
    return response.data;
  }

  async createMultiStopOrder(orderData: any): Promise<any> {
    const response = await this.request('/customer/multi-stop-orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return response.data;
  }

  async getCustomerMultiStopOrders(params?: any): Promise<any> {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.request(`/customer/multi-stop-orders${queryString ? `?${queryString}` : ''}`);
    return response.data;
  }

  async getMultiStopOrderById(id: string): Promise<any> {
    const response = await this.request(`/customer/multi-stop-orders/${id}`);
    return response.data;
  }

  async updateMultiStopOrder(id: string, orderData: any): Promise<any> {
    const response = await this.request(`/customer/multi-stop-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
    return response.data;
  }

  async deleteMultiStopOrder(id: string): Promise<any> {
    const response = await this.request(`/customer/multi-stop-orders/${id}`, {
      method: 'DELETE',
    });
    return response.data;
  }

  async submitMultiStopOrder(id: string): Promise<any> {
    const response = await this.request(`/customer/multi-stop-orders/${id}/submit`, {
      method: 'PATCH',
    });
    return response.data;
  }

  async createConciergeRequest(requestData: any): Promise<any> {
    const response = await this.request('/customer/concierge-requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    return response.data;
  }

  async getCustomerConciergeRequests(params?: any): Promise<any> {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.request(`/customer/concierge-requests${queryString ? `?${queryString}` : ''}`);
    return response.data;
  }

  async getConciergeRequestById(id: string): Promise<any> {
    const response = await this.request(`/customer/concierge-requests/${id}`);
    return response.data;
  }

  async cancelConciergeRequest(id: string): Promise<any> {
    const response = await this.request(`/customer/concierge-requests/${id}/cancel`, {
      method: 'PATCH',
    });
    return response.data;
  }

  async rateConciergeRequest(id: string, rating: number, review?: string): Promise<any> {
    const response = await this.request(`/customer/concierge-requests/${id}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, review }),
    });
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.request<{ status: string; timestamp: string }>('/auth/health');
    return response.data!;
  }


}

export const apiService = new ApiService();
export default apiService;
