// Import libraries needed for working with Sui blockchain
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
// Import libraries for managing SUINS domains
import { SuinsClient, SuinsTransaction, ALLOWED_METADATA } from '@mysten/suins';
// Import class for creating transactions
import { Transaction } from '@mysten/sui/transactions';
// Import necessary types
import { SuiTransactionBlockResponse } from '@mysten/sui/client';

// Define the type for signAndExecuteTransactionBlock function from wallet-kit
// Use any to support both wallet-kit and dapp-kit
type SignAndExecuteTransactionFunction = (input: any) => Promise<any>;

/**
 * Function for linking a SUINS domain with a site ID
 * @param nftId - ID of the NFT to link
 * @param siteId - ID of the site to link
 * @param address - User's wallet address
 * @param signAndExecuteTransaction - Function for signing and sending transactions
 * @param network - Network selection (mainnet or testnet)
 * @returns Operation result data
 */
export const linkSuinsToSite = async (  
  nftId: string,
  siteId: string,
  address: string,
  signAndExecuteTransaction: SignAndExecuteTransactionFunction,
  network: 'mainnet' | 'testnet' = 'mainnet'
) => {
  try {
    // Check if wallet is connected
    if (!address) {
      throw new Error('Please connect your wallet first');
    }

    // Create client for connecting to Sui blockchain
    const client = new SuiClient({ url: getFullnodeUrl(network) });
    
    // Create client for managing SUINS domains
    const suinsClient = new SuinsClient({
      client,
      network,
    });

    // Check NFT ownership by fetching data from blockchain
    const nftObject = await client.getObject({
      id: nftId,
      options: {
        showContent: true, // Show NFT content
        showOwner: true, // Show NFT owner
      },
    });

    // Check if NFT exists
    if (!nftObject.data) {
      throw new Error(`NFT not found: ${nftId}`);
    }

    // Get NFT owner from response
    const owner = nftObject.data?.owner;
    // Convert owner data to address
    const ownerAddress = owner && typeof owner === 'object' && 'AddressOwner' in owner ? owner.AddressOwner : null;
    
    // Check if connected wallet is the NFT owner
    if (ownerAddress && ownerAddress !== address) {
      throw new Error(`You don't own this NFT! NFT owner: ${ownerAddress}, Your address: ${address}`);
    }

    // Create new transaction for linking
    const tx = new Transaction();
    
    // Create SUINS transaction using the client
    const suinsTx = new SuinsTransaction(suinsClient, tx);

    // Set data to link in the transaction
    suinsTx.setUserData({
      nft: nftId, // NFT ID
      key: ALLOWED_METADATA.walrusSiteId, // Key for storing site ID
      value: siteId, // Site ID to link
      isSubname: false, // Not a subname
    });

    // Sign and send transaction to blockchain
    try {
      // Set transaction sender explicitly
      tx.setSender(address);
      
      // Build transaction in a format ready to send
      const txBytes = await tx.build({ client: suinsClient.client });
      
      // Sign and execute the transaction using wallet-kit's method
      const result = await signAndExecuteTransaction({
        transactionBlock: tx
      });
      
      // Extract digest from result
      // Support multiple result formats from SDK that may change
      let transactionId: string = 'unknown';
      if ('digest' in result && typeof result.digest === 'string') {
        transactionId = result.digest;
      } else if ('transaction' in result && result.transaction && typeof result.transaction === 'object' && 
                 'digest' in result.transaction && typeof result.transaction.digest === 'string') {
        transactionId = result.transaction.digest;
      }
      
      // Return operation result
      const response = {
        success: true, // Operation status success
        transactionId, // Transaction hash
        status: 'success' // Operation status
      };
      return response;
    } catch (error) {
      // Handle errors
      throw error; // Pass error to caller
    }
  } catch (error) {
    // Handle errors
    throw error; // Pass error to caller
  }
};