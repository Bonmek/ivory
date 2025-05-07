import { buildOutputSettingsType } from '@/types/CreateWebstie/types';
import axios from 'axios';

export interface WebsiteAttributes {
  'site-name': string;
  owner: string;
  ownership: '0' | '1';
  send_to: string;
  epochs: string;
  start_date: string;
  end_date: string;
  status: '0' | '1';
  cache: string;
  root: string;
  install_command: string;
  build_command: string;
  default_route: string;
  is_build: string;
}

interface WriteBlobRequest {
  file: File;
  attributes: WebsiteAttributes;
}

interface WriteBlobResponse {
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  message?: string;
}

export const writeBlobAndRunJob = async (data: WriteBlobRequest): Promise<WriteBlobResponse> => {
  const formData = new FormData();
  
  // Validate file type
  if (!data.file.name.endsWith('.zip')) {
    throw new Error('Only ZIP files are allowed');
  }

  formData.append('file', data.file);
  formData.append('attributes', JSON.stringify(data.attributes));

  try {
    const response = await axios.post(process.env.REACT_APP_SERVER_URL + process.env.REACT_APP_API_WRITE_BLOB_N_RUN_JOB!, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to write blob and run job: ' + (error as Error).message);
  }
};