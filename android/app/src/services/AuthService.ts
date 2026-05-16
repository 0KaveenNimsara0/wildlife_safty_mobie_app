import axios from 'axios';
import { API_URL } from '../config/api';

export type Role = 'user' | 'medical-officer';

export interface AuthResponse {
  success: boolean;
  requiresOtp?: boolean;
  message?: string;
  user?: any;
  medicalOfficer?: any;
  token?: string;
  email?: string;
}

class AuthService {
  private getEndpointPrefix(role: Role) {
    return role === 'user' ? '/auth/user' : '/medical-officer/auth';
  }

  async login(email: string, password: string, role: Role, otp?: string): Promise<AuthResponse> {
    const prefix = this.getEndpointPrefix(role);
    try {
      const payload: any = { email, password };
      if (otp) {
        payload.otp = otp;
      }
      
      const response = await axios.post(`${API_URL}${prefix}/login`, payload);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Login failed');
      }
      throw new Error('Network error. Please check your connection.');
    }
  }

  async register(
    email: string,
    password: string,
    displayName: string,
    role: Role,
    otp?: string,
    extraFields?: {
      specialization?: string;
      licenseNumber?: string;
      phoneNumber?: string;
      hospital?: string;
      securityKey?: string;
    }
  ): Promise<AuthResponse> {
    const prefix = this.getEndpointPrefix(role);
    try {
      const payload: any = { email, password };

      if (role === 'user') {
        payload.displayName = displayName;
      } else {
        // Medical officer uses 'name' not 'displayName'
        payload.name = displayName;
        if (extraFields) {
          payload.specialization = extraFields.specialization;
          payload.licenseNumber = extraFields.licenseNumber;
          payload.phoneNumber = extraFields.phoneNumber;
          payload.hospital = extraFields.hospital;
          payload.securityKey = extraFields.securityKey;
        }
      }

      if (otp) {
        payload.otp = otp;
      }

      const response = await axios.post(`${API_URL}${prefix}/register`, payload);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Registration failed');
      }
      throw new Error('Network error. Please check your connection.');
    }
  }

  async sendRegistrationOtp(email: string): Promise<AuthResponse> {
    try {
      // The backend route is /api/shared-auth/send-otp
      const response = await axios.post(`${API_URL}/shared-auth/send-otp`, { email });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Failed to send OTP');
      }
      throw new Error('Network error. Please check your connection.');
    }
  }

  async getProfile(uid: string, role: Role, token: string) {
    // Note: User profile is at /auth/user/profile/:uid, Medical Officer is /medical-officer/auth/profile/:uid?
    // Let's assume the prefix holds true for profile fetching too.
    const prefix = this.getEndpointPrefix(role);
    try {
      const response = await axios.get(`${API_URL}${prefix}/profile/${uid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Failed to fetch profile');
      }
      throw new Error('Network error. Please check your connection.');
    }
  }

  async getMedicalOfficers(token: string): Promise<any> {
    const response = await axios.get(`${API_URL}/user/chat/medical-officers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async getConversations(token: string, role: Role): Promise<any> {
    const prefix = role === 'medical-officer' ? '/medical-officer/chat' : '/user/chat';
    const response = await axios.get(`${API_URL}${prefix}/conversations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async getMessages(conversationId: string, token: string, role: Role): Promise<any> {
    const prefix = role === 'medical-officer' ? '/medical-officer/chat' : '/user/chat';
    const response = await axios.get(`${API_URL}${prefix}/messages/${conversationId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async getUserHistory(uid: string, token: string): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/predictions/history/${uid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Failed to fetch history');
      }
      throw new Error('Network error. Please check your connection.');
    }
  }

  async sendMessage(receiverId: string, message: string, token: string, role: Role, receiverType: 'user' | 'admin' = 'user'): Promise<any> {
    const prefix = role === 'medical-officer' ? '/medical-officer/chat' : '/user/chat';
    const response = await axios.post(`${API_URL}${prefix}/send/${receiverId}`, 
      { message, receiverType },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
}

export default new AuthService();
