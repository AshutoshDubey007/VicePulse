import { permanentRedirect } from 'next/navigation';

export default async function DiscoveryAliasPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  permanentRedirect(`/discoveries/${slug}`);
}
