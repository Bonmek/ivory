import { MemberPermissions } from '@/types/project'

/**
 * แยก member string ในรูปแบบ "address|access" เป็น object
 * @param memberString string ในรูปแบบ "0x1234...|0001"
 * @returns object ที่มี address และ permissions
 */
export const parseMemberString = (memberString: string): { 
  address: string
  permissions: MemberPermissions 
} => {
  const [address, accessBits] = memberString.split('|')
  
  // แปลง access bits เป็น permissions object
  const permissions: MemberPermissions = {
    update: accessBits[3] === '1',
    delete: accessBits[2] === '1',
    generateSite: accessBits[1] === '1',
    setSuins: accessBits[0] === '1'
  }

  return { address, permissions }
}

/**
 * แปลง permissions object เป็น access bits string
 * @param permissions MemberPermissions object
 * @returns string เช่น "0001"
 */
export const permissionsToAccessBits = (permissions: MemberPermissions): string => {
  const bits = [
    permissions.setSuins ? '1' : '0',
    permissions.generateSite ? '1' : '0',
    permissions.delete ? '1' : '0',
    permissions.update ? '1' : '0'
  ]
  return bits.join('')
}

/**
 * สร้าง member string สำหรับส่งไป API
 * @param address wallet address
 * @param permissions MemberPermissions object
 * @returns string ในรูปแบบ "address|accessBits"
 */
export const createMemberString = (address: string, permissions: MemberPermissions): string => {
  const accessBits = permissionsToAccessBits(permissions)
  return `${address}|${accessBits}`
}

/**
 * แปลง array ของ member strings เป็น string เดียวสำหรับส่ง API
 * @param members array ของ member strings
 * @returns string ที่รวม members ด้วย comma
 */
export const joinMemberStrings = (members: string[]): string => {
  return members.join(',')
}

/**
 * แยก member string ที่มาจาก API เป็น array
 * @param memberString string ที่มี members คั่นด้วย comma
 * @returns array ของ member strings
 */
export const splitMemberString = (memberString: string): string[] => {
  return memberString.split(',').filter(Boolean)
} 