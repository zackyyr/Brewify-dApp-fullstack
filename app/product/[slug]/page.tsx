// app/product/[slug]/page.tsx (server)
import { prisma } from "@/lib/prisma";

export default async function DetailProducts({ params }: { params: { slug: string }}) {
  const product = await prisma.product.findUnique({ where: { slug: params.slug }});
  if (!product) return <div>Not found</div>;

  // fetch metadata from IPFS gateway
  const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL;
  const metadataUrl = `https://${gateway}/ipfs/${product.metadataCid}`;
  const metaRes = await fetch(metadataUrl);
  const metadata = await metaRes.json();

  // optionally check on-chain status via ethers (server RPC) if needed

  return (
    <main>
      <h1>{product.name}</h1>
      <img src={`https://${gateway}/ipfs/${product.imageCid}`} alt={product.name}/>
      <p>{metadata.description ?? product.description}</p>
      <p>Quantity: {product.quantity}</p>
      <p>Price: {product.priceEth} ETH</p>
      {/* timeline: read from metadata.attributes or product fields */}
    </main>
  );
}
