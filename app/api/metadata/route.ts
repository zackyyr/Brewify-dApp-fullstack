// app/api/metadata/route.ts
import { NextRequest, NextResponse } from "next/server";
import { pinata } from "@/utils/config";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const metadata = {
      name: body.name,
      description: body.description,
      image: `ipfs://${body.imageCid}`,
      priceEth: body.priceEth,
      attributes: [
        { trait_type: "Origin", value: body.origin },
        { trait_type: "Process", value: body.process },
        { trait_type: "Quantity", value: Number(body.quantity) },
        { trait_type: "Harvested", value: body.harvested },
        { trait_type: "Roasted", value: body.roasted },
        { trait_type: "Packed", value: body.packed }
      ],
    };

    // Upload JSON directly
    const result = await pinata.upload.public.json(metadata);
    const cid = result.cid;
    const url = await pinata.gateways.public.convert(cid);

    return NextResponse.json({ cid, url }, { status: 200 });
  } catch (err) {
    console.error("metadata upload err:", err);
    return NextResponse.json({ error: "Metadata upload failed" }, { status: 500 });
  }
}
