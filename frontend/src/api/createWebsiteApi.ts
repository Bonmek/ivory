import { CacheControl, Ownership, UploadMethod } from '@/types/CreateWebstie/enums';
import { buildOutputSettingsType, advancedOptionsType } from '@/types/CreateWebstie/types';
import { frameworks } from '@/constants/frameworks';
import axios from 'axios';

interface CreateWebsiteRequest {
  name: string;
  ownership: Ownership;
  uploadMethod: UploadMethod;
  framework: string;
  buildOutputSettings: buildOutputSettingsType;
  advancedOptions: advancedOptionsType;
  githubRepo?: {
    owner: string;
    repo: string;
  };
  files?: File[];
}

interface CreateWebsiteResponse {
  id: string;
  name: string;
  status: 'pending' | 'building' | 'completed' | 'failed';
  message?: string;
}

export const createWebsite = async (data: CreateWebsiteRequest): Promise<CreateWebsiteResponse> => {
  try {
    const response = await axios.post('/api/websites', data);
    return response.data;
  } catch (error) {
    throw new Error('Failed to create website: ' + (error as Error).message);
  }
};

export const getWebsiteStatus = async (websiteId: string): Promise<CreateWebsiteResponse> => {
  try {
    const response = await axios.get(`/api/websites/${websiteId}/status`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to get website status: ' + (error as Error).message);
  }
};

export const uploadFiles = async (files: File[], websiteId: string): Promise<void> => {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append('files', file, file.name);
  });

  try {
    await axios.post(`/api/websites/${websiteId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (error) {
    throw new Error('Failed to upload files: ' + (error as Error).message);
  }
};

export const getFrameworks = (): typeof frameworks => {
  return frameworks;
};