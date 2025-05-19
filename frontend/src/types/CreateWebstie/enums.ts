export enum UploadMethod {
  Upload = 'upload',
  GitHub = 'github',
}

export enum Ownership {
  Leave = 'leave',
  Own = 'own',
}

export enum CacheControl {
  NoCache = '0',
  OneDay = '1',
  OneWeek = '7',
  OneMonth = '30',
  OneYear = '365'
}

export enum DeployingState {
  None = 'none',
  Deploying = 'deploying',
  Deployed = 'deployed',
  Failed = 'failed'
}

export enum BuildingState {
  None = 'none',
  Building = 'building',
  Built = 'built',
  Failed = 'failed'
}