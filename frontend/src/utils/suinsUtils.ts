// นำเข้าไลบรารีที่จำเป็นสำหรับการทำงานกับ Sui blockchain
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
// นำเข้าไลบรารีสำหรับจัดการกับ SUINS domains
import { SuinsClient, SuinsTransaction, ALLOWED_METADATA } from '@mysten/suins';
// นำเข้า class สำหรับสร้าง transaction
import { Transaction } from '@mysten/sui/transactions';
// นำเข้า hook สำหรับเซ็นและส่ง transaction
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useAuth } from '@/context/AuthContext';

/**
 * ฟังก์ชันสำหรับเชื่อมโยง SUINS domain กับ site ID
 * @param nftId - ID ของ NFT ที่ต้องการเชื่อมโยง
 * @param siteId - ID ของ site ที่ต้องการเชื่อมโยง
 * @param network - เลือก network (mainnet หรือ testnet)
 * @returns ข้อมูลผลลัพธ์การทำงาน
 */
export const linkSuinsToSite = async (
  nftId: string,
  siteId: string,
  network: 'mainnet' | 'testnet' = 'mainnet'
) => {
  try {
    console.log('เริ่มการเชื่อมโยง SUINS:', { nftId, siteId, network });
    
    const { address } = useAuth();
    console.log('Wallet address:', address);
    
    // เรียกใช้ hook สำหรับเซ็นและส่ง transaction
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    console.log('Hook signAndExecuteTransaction ถูกเรียกใช้แล้ว');
    
    // ตรวจสอบว่ามีการเชื่อมต่อ wallet แล้วหรือไม่
    if (!address) {
      console.error('ไม่พบ wallet address');
      throw new Error('Please connect your wallet first');
    }

    // สร้าง client สำหรับเชื่อมต่อกับ Sui blockchain
    const client = new SuiClient({ url: getFullnodeUrl(network) });
    console.log('Sui client ถูกสร้างแล้ว:', { network });
    
    // สร้าง client สำหรับจัดการกับ SUINS domains
    const suinsClient = new SuinsClient({
      client,
      network,
    });
    console.log('SUINS client ถูกสร้างแล้ว');

    // ตรวจสอบความเป็นเจ้าของ NFT โดยดึงข้อมูลจาก blockchain
    console.log('กำลังตรวจสอบ NFT:', nftId);
    const nftObject = await client.getObject({
      id: nftId,
      options: {
        showContent: true, // แสดงข้อมูล content ของ NFT
        showOwner: true, // แสดงข้อมูลเจ้าของ NFT
      },
    });
    console.log('ข้อมูล NFT:', nftObject);

    // ตรวจสอบว่า NFT มีอยู่จริงหรือไม่
    if (!nftObject.data) {
      console.error('ไม่พบ NFT:', nftId);
      throw new Error(`NFT not found: ${nftId}`);
    }

    // ดึงข้อมูลเจ้าของ NFT จาก response
    const owner = nftObject.data?.owner;
    // แปลงข้อมูลเจ้าของเป็น address
    const ownerAddress = owner && typeof owner === 'object' && 'AddressOwner' in owner ? owner.AddressOwner : null;
    console.log('เจ้าของ NFT:', { ownerAddress, currentAddress: address });
    
    // ตรวจสอบว่า wallet ที่เชื่อมต่อเป็นเจ้าของ NFT หรือไม่
    if (ownerAddress && ownerAddress !== address) {
      console.error('ไม่ใช่เจ้าของ NFT:', { ownerAddress, currentAddress: address });
      throw new Error(`You don't own this NFT! NFT owner: ${ownerAddress}, Your address: ${address}`);
    }

    // สร้าง transaction ใหม่สำหรับการเชื่อมโยง
    const tx = new Transaction();
    console.log('Transaction ถูกสร้างแล้ว');
    
    // สร้าง SUINS transaction โดยใช้ client ที่สร้างไว้
    const suinsTx = new SuinsTransaction(suinsClient, tx);
    console.log('SUINS transaction ถูกสร้างแล้ว');

    // กำหนดข้อมูลที่จะเชื่อมโยงใน transaction
    console.log('กำลังกำหนดข้อมูล transaction:', { nftId, siteId });
    suinsTx.setUserData({
      nft: nftId, // ID ของ NFT
      key: ALLOWED_METADATA.walrusSiteId, // key สำหรับเก็บ site ID
      value: siteId, // site ID ที่ต้องการเชื่อมโยง
      isSubname: false, // ไม่ใช่ subname
    });

    // เซ็นและส่ง transaction ไปยัง blockchain
    console.log('กำลังเซ็นและส่ง transaction');
    const result = await signAndExecuteTransaction({
        transaction: tx
    });
    console.log('Transaction result:', result);

    // ส่งผลลัพธ์การทำงานกลับไป
    const response = {
      success: true, // สถานะการทำงานสำเร็จ
      digest: result.digest, // hash ของ transaction
      status: 'success' // สถานะการทำงาน
    };
    console.log('ส่งผลลัพธ์กลับ:', response);
    return response;
  } catch (error) {
    // จัดการกับ error ที่เกิดขึ้น
    console.error('เกิดข้อผิดพลาดในการเชื่อมโยง SUINS:', error);
    throw error; // ส่ง error ต่อไปให้ผู้เรียกใช้จัดการ
  }
};