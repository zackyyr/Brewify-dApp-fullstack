// utils/config.ts
import { PinataSDK } from "pinata";

export const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL!,
});

// Upload FILE → return ipfs://CID
export const uploadFileToIPFS = async (file: File) => {
  const result = await pinata.upload.public.file(file);
  return `ipfs://${result.cid}`;
};

// Upload JSON → return ipfs://CID
export const uploadJSONToIPFS = async (jsonData: object) => {
  const result = await pinata.upload.public.json(jsonData);
  return `ipfs://${result.cid}`;
};

// Convert CID → Public gateway URL (optional)
export const toGatewayURL = (cid: string) => {
  return `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${cid.replace("ipfs://", "")}`;
};
