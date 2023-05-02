import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

type Props = {};

const DashboardPage = async ({}: Props) => {
  const session = await getServerSession(authOptions);

  return (
    <div>
      Dashboard
    </div>
  );
};

export default DashboardPage;
