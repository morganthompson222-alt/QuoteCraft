import { CustomerDetailPage } from "../../../components/customers/CustomerDetailPage";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CustomerDetailRoute({ params }: Props) {
  const { id } = await params;
  return <CustomerDetailPage customerId={id} />;
}
