// app/api/product/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// CREATE
export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    if (!b.tokenId || !b.owner || !b.metadataCid) return NextResponse.json({ error: "Missing" }, { status: 400 });

    const slug = b.slug ?? `${b.name.toLowerCase().replace(/[^a-z0-9]+/g,"-")}-${b.tokenId}`;

    const product = await prisma.product.create({
      data: {
        tokenId: Number(b.tokenId),
        name: b.name,
        description: b.description,
        imageCid: b.image?.replace(/^ipfs:\/\//, "") ?? b.imageCid ?? "",
        metadataCid: b.metadataCid,
        priceEth: b.priceEth ? Number(b.priceEth) : undefined,
        origin: b.origin,
        process: b.process,
        quantity: Number(b.quantity || 0),
        harvested: b.harvested,
        roasted: b.roasted,
        packed: b.packed,
        slug,
        owner: b.owner
      }
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "create failed" }, { status: 500 });
  }
}

// READ (all, by owner, by slug, by tokenId)
export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const owner = url.searchParams.get("owner");
    const slug = url.searchParams.get("slug");
    const tokenId = url.searchParams.get("tokenId");

    if (slug) {
      const p = await prisma.product.findUnique({ where: { slug }});
      return NextResponse.json(p);
    }
    if (tokenId) {
      const p = await prisma.product.findFirst({ where: { tokenId: Number(tokenId) }});
      return NextResponse.json(p);
    }
    if (owner) {
      const items = await prisma.product.findMany({ where: { owner }, orderBy: { createdAt: "desc" }});
      return NextResponse.json(items);
    }

    const items = await prisma.product.findMany({ orderBy: { createdAt: "desc" }});
    return NextResponse.json(items);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "fetch failed" }, { status: 500 });
  }
}

// UPDATE (only quantity allowed here)
export async function PUT(req: NextRequest) {
  try {
    const b = await req.json();
    if (!b.slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
    if (typeof b.quantity === "undefined") return NextResponse.json({ error: "quantity required" }, { status: 400 });

    // Optional: server-side verify owner via signed message (recommended). For now we trust client wallet.
    const updated = await prisma.product.update({
      where: { slug: b.slug },
      data: { quantity: Number(b.quantity) }
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "update failed" }, { status: 500 });
  }
}
