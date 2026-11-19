import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import NewsArticle from '@/models/NewsArticle';
import Discovery from '@/models/Discovery';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    await connectDB();

    const article = await NewsArticle.findOne({ slug, status: 'published' }).lean() as any;

    if (!article) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }

    // Populate related discoveries if any
    let relatedDiscoveries: any[] = [];
    if (article?.relatedDiscoveryIds && article.relatedDiscoveryIds.length > 0) {
      relatedDiscoveries = await Discovery.find({
        _id: { $in: article.relatedDiscoveryIds },
      }).lean();
    }

    return NextResponse.json({
      success: true,
      data: {
        ...article,
        relatedDiscoveries,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
