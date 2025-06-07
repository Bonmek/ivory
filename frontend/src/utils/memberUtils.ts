import { MemberPermissions } from '@/types/project'

/**
 * Parses a member string in the format "address|access" where:
 * - address: Wallet address (e.g. "0x1234...")
 * - access: 4-bit permission string where each bit represents:
 *   [3] update (0/1)
 *   [2] delete (0/1)
 *   [1] generateSite (0/1)
 *   [0] setSuins (0/1)
 * Example: "0x1234...|1001" (has update and setSuins permissions)
 */
export const parseMemberString = (memberString: string): { 
  address: string
  permissions: MemberPermissions 
} => {
  const [address, accessBits] = memberString.split('|')
  
  // Convert access bits to permissions object
  const permissions: MemberPermissions = {
    update: accessBits[3] === '1',
    delete: accessBits[2] === '1',
    generateSite: accessBits[1] === '1',
    setSuins: accessBits[0] === '1'
  }

  return { address, permissions }
}

/**
 * Converts permissions object to 4-bit access string
 * Each bit position represents a permission:
 * [3] update, [2] delete, [1] generateSite, [0] setSuins
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
 * Creates a member string for API in format "address|accessBits"
 * Example: "0x1234...|1001" (has update and setSuins permissions)
 */
export const createMemberString = (address: string, permissions: MemberPermissions): string => {
  const accessBits = permissionsToAccessBits(permissions)
  return `${address}|${accessBits}`
}

/**
 * Joins multiple member strings with commas for API submission
 * Example: "0x123|1001,0x456|0011,0x789|1111"
 */
export const joinMemberStrings = (members: string[]): string => {
  return members.join(',')
}

/**
 * Splits comma-separated member string from API into array
 * Example: "0x123|1001,0x456|0011" -> ["0x123|1001", "0x456|0011"]
 */
export const splitMemberString = (memberString: string): string[] => {
  return memberString.split(',').filter(Boolean)
}

/**
 * Creates a member string for API in format:
 * "address1permission|address2permission|address3permission"
 * Example: "0x1234...1111|0x5678...1011"
 * where each permission is 4 bits representing:
 * [3] update (0/1)
 * [2] delete (0/1)
 * [1] generateSite (0/1)
 * [0] setSuins (0/1)
 */
export const createMemberStrings = (members: { address: string, permissions: MemberPermissions }[]): string => {
  return members.map(member => {
    const bits = [
      member.permissions.update ? '1' : '0',
      member.permissions.delete ? '1' : '0',
      member.permissions.generateSite ? '1' : '0',
      member.permissions.setSuins ? '1' : '0'
    ].join('')
    
    return `${member.address}${bits}`
  }).join('|')
}

/**
 * Parse member strings from API response
 * Format: "address1permission|address2permission"
 * Example: "0x1234...1111|0x5678...1011"
 */
export const parseMemberStrings = (memberString: string): {
  address: string
  permissions: MemberPermissions
}[] => {
  return memberString.split('|').map(member => {
    const address = member.slice(0, -4)
    const bits = member.slice(-4)
    
    return {
      address,
      permissions: {
        update: bits[0] === '1',
        delete: bits[1] === '1',
        generateSite: bits[2] === '1',
        setSuins: bits[3] === '1'
      }
    }
  })
} 