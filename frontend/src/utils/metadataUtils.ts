import { DEFAULT_EXPIRY_BUFFER } from '@/constants/time'

interface MetadataMap {
  [key: string]: string
}

export const extractMetadataMap = (metadataFields: any[]): MetadataMap => {
  return metadataFields.reduce(
    (acc: MetadataMap, entry: any) => {
      acc[entry.fields.key] = entry.fields.value
      return acc
    },
    {},
  )
}

export const transformMetadataToProject = (metadata: any, index: number) => {
  if (!metadata?.content || metadata.content.dataType !== 'moveObject') {
    return {
      id: index,
      name: `Project ${index}`,
      url: '',
      startDate: new Date(),
      expiredDate: new Date(Date.now() + DEFAULT_EXPIRY_BUFFER),
      color: '#97f0e5',
      urlImg: '/walrus.png',
      status: 0
    }
  }

  const fields = metadata.content.fields as any
  const metadataFields = fields.value.fields.metadata.fields.contents
  const metadataMap = extractMetadataMap(metadataFields)

  const status = parseInt(metadataMap['status'] || '0')

  const project = {
    id: index,
    name: metadataMap['site-name'] || `Project ${index}`,
    url: metadataMap['root'] || '',
    startDate: new Date(metadataMap['start_date'] || Date.now()),
    expiredDate: new Date(
      metadataMap['end_date'] || Date.now() + 365 * 24 * 60 * 60 * 1000,
    ),
    color: '#97f0e5',
    urlImg: '/walrus.png',
    description: metadataMap['description'] || '',
    status,
    siteId: status === 1 ? metadataMap['site_id'] : '',
    suins: metadataMap['sui_ns'] || '',
    blobId: metadataMap['blobId'] || '',
    installCommand: metadataMap['install_command'] || '',
    buildCommand: metadataMap['build_command'] || '',
    defaultRoute: metadataMap['default_route'] || '',
    isBuild: metadataMap['is_build'] === '1',
    epochs: parseInt(metadataMap['epochs'] || '0'),
    ownership: parseInt(metadataMap['ownership'] || '0'),
    parentId: metadata.parentId || '',
    client_error_description: metadataMap['client_error_description'] || '',
  }
  return project
} 