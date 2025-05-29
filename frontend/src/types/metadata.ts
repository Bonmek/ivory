export interface MetadataMap {
  [key: string]: string
}

export interface MemberPermissions {
  update: boolean;
  delete: boolean;
  generateSite: boolean;
  setSuins: boolean;
}

export interface SingleMemberInfo {
  address: string;
  permissions: MemberPermissions;
}

export interface MemberInfo {
  members: SingleMemberInfo[];
}
