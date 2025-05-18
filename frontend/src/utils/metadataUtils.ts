import { DEFAULT_EXPIRY_BUFFER } from '@/constants/time';

interface MetadataMap {
  [key: string]: string;
}

export interface Project {
  id: number;
  parentId: string;
  name: string;
  url: string;
  startDate: Date;
  expiredDate: Date;
  color: string;
  urlImg: string;
  status: number;
  siteId: string;
  suins: string;
  blobId: string;
  installCommand: string;
  buildCommand: string;
  defaultRoute: string;
  isBuild: boolean;
  epochs: number;
  ownership: number;
  description: string;
  client_error_description: string;
}

export const extractMetadataMap = (metadataFields: any[]): MetadataMap => {
  if (!Array.isArray(metadataFields)) return {};
  return metadataFields.reduce((acc: MetadataMap, entry: any) => {
    if (entry?.fields?.key && entry.fields.value !== undefined) {
      acc[entry.fields.key] = entry.fields.value;
    }
    return acc;
  }, {});
};

export const transformMetadataToProject = (metadata: any, index: number): Project => {
  // Default project for invalid metadata
  if (!metadata?.content || metadata.content.dataType !== 'moveObject') {
    return {
      id: index,
      parentId: '',
      name: `Project ${index}`,
      url: '',
      startDate: new Date(),
      expiredDate: new Date(Date.now() + DEFAULT_EXPIRY_BUFFER),
      color: '#97f0e5',
      urlImg: '/walrus.png',
      status: 0,
      siteId: '',
      suins: '',
      blobId: '',
      installCommand: '',
      buildCommand: '',
      defaultRoute: '',
      isBuild: false,
      epochs: 0,
      ownership: 0,
      description: '',
      client_error_description: '',
    };
  }

  try {
    const fields = metadata.content.fields;
    const metadataFields = fields?.value?.fields?.metadata?.fields?.contents;
    const metadataMap = extractMetadataMap(metadataFields || []);

    const status = parseInt(metadataMap['status'] || '0');

    return {
      id: metadataMap['id'] ? parseInt(metadataMap['id']) : index, // Prefer metadata id if available
      parentId: metadata.parentId || '', // Ensure parentId is set
      name: metadataMap['site-name'] || `Project ${index}`,
      url: metadataMap['root'] || '',
      startDate: new Date(metadataMap['start_date'] || Date.now()),
      expiredDate: new Date(
        metadataMap['end_date'] || Date.now() + 365 * 24 * 60 * 60 * 1000,
      ),
      color: metadataMap['color'] || '#97f0e5', // Dynamic color if available
      urlImg: metadataMap['url_img'] || '/walrus.png', // Dynamic urlImg
      status,
      siteId: status === 1 ? metadataMap['site_id'] || '' : '',
      suins: metadataMap['sui_ns'] || '',
      blobId: metadataMap['blobId'] || '',
      installCommand: metadataMap['install_command'] || '',
      buildCommand: metadataMap['build_command'] || '',
      defaultRoute: metadataMap['default_route'] || '',
      isBuild: metadataMap['is_build'] === '1',
      epochs: parseInt(metadataMap['epochs'] || '0'),
      ownership: parseInt(metadataMap['ownership'] || '0'),
      description: metadataMap['description'] || '',
      client_error_description: metadataMap['client_error_description'] || '',
    };
  } catch (error) {
    console.error('Error transforming metadata:', error, metadata);
    return {
      id: index,
      parentId: '',
      name: `Project ${index}`,
      url: '',
      startDate: new Date(),
      expiredDate: new Date(Date.now() + DEFAULT_EXPIRY_BUFFER),
      color: '#97f0e5',
      urlImg: '/walrus.png',
      status: 0,
      siteId: '',
      suins: '',
      blobId: '',
      installCommand: '',
      buildCommand: '',
      defaultRoute: '',
      isBuild: false,
      epochs: 0,
      ownership: 0,
      description: '',
      client_error_description: '',
    };
  }
};