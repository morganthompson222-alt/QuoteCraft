import { QuotePreviewPage } from "../../../components/quotes/QuotePreviewPage";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function QuoteDetailRoute({ params }: Props) {
  const { id } = await params;
  return <QuotePreviewPage quoteId={id} />;
}
