import axios from 'axios';


export interface PreviewSiteAttributes {
  'site-name': string;
  owner: string;
  ownership: '0' | '1';
  send_to: string;
  epochs: string;
  start_date: string;
  end_date: string;
  status: '0' | '1' | '2' | '3';
  cache: string;
  root: string;
  output_dir: string;
  install_command?: string;
  build_command?: string;
  default_route: string;
  is_build?: string;
}

export interface CreateSiteAttributes {
  'site-name': string;
  root: string;
  owner: string;
  ownership: '0' | '1';
  send_to: string;
  epochs: string;
  status: '0' | '1' | '2' | '3';
  cache: string;
  start_date: string;
  end_date: string;
}

export interface PreviewSiteRequest {
  file?: File;
  attributes: PreviewSiteAttributes;
  githubUrl?: string;
}

export interface CreateSiteRequest {
  file?: File;
  attributes: CreateSiteAttributes;
  githubUrl?: string;
}

export interface WriteBlobResponse {
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  message?: string;
}

export interface PreviewWebsiteResponse {
  data: ArrayBuffer;
  headers: {
    'content-type': string;
    'content-disposition': string;
  };
}

export const previewWebsite = async (data: PreviewSiteRequest): Promise<File> => {
  const formData = new FormData();

  // Add file parameter if it exists
  if (data.file) {
    if (!data.file.name.endsWith('.zip')) {
      throw new Error('Only ZIP files are allowed');
    }
    formData.append('file', data.file);
  }

  // Always add attributes
  formData.append('attributes', JSON.stringify(data.attributes));

  try {
    const response = await axios.post(
      `${process.env.REACT_APP_SERVER_URL}${process.env.REACT_APP_API_PREVIEW_WEBSITE!}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'arraybuffer',
      }
    );

    return new File([
      response.data,
    ], 'preview.zip', {
      type: response.headers['content-type'],
    })
  } catch (error) {
    throw new Error('Failed to preview website: ' + (error as Error).message);
  }
};

export const writeBlobAndRunJob = async (data: CreateSiteRequest): Promise<WriteBlobResponse> => {
  const formData = new FormData();

  // Add file parameter if it exists
  if (data.file) {
    if (!data.file.name.endsWith('.zip')) {
      throw new Error('Only ZIP files are allowed');
    }
    formData.append('file', data.file);
  }

  // Always add attributes
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