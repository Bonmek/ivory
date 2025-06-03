import apiClient from '@/lib/axiosConfig';
import axios from 'axios';

export interface UpdateSiteAttributes {
    old_object_id?: string;
    'site-name'?: string;
    owner?: string;
    ownership?: '0' | '1';
    send_to?: string;
    epochs?: string;
    start_date?: string;
    end_date?: string;
    status?: '0' | '1' | '2' | '3';
    cache?: string;
    root?: string;
    output_dir?: string;
    install_command?: string;
    build_command?: string;
    default_route?: string;
    is_build?: string;
    [key: string]: any; // Allow additional properties
}

export interface UpdateSiteRequest {
    file?: File;
    attributes: Partial<UpdateSiteAttributes>;
}

export interface UpdateSiteResponse {
    success: boolean;
    message: string;
    data?: {
        statusCode: number;
        taskName: string;
    };
}

export const handleUpdateSite = async (
    request: UpdateSiteRequest
): Promise<UpdateSiteResponse> => {
    try {
        const formData = new FormData();

        // Append file if provided
        if (request.file) {
            if (!request.file.name.endsWith('.zip')) {
                throw new Error('Only ZIP files are allowed');
            }
            formData.append('file', request.file);
        }

        // Append attributes
        if (request.attributes) {
            formData.append('attributes', JSON.stringify(request.attributes));
        }

        const response = await axios.put(
            `${process.env.REACT_APP_SERVER_URL}${process.env.REACT_APP_API_UPDATE_SITE}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return {
            success: true,
            message: 'Site updated successfully',
            data: response.data,
        };
    } catch (error: any) {
        console.error('Error updating site:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to update site',
        };
    }
};