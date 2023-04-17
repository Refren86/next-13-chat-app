import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

type Props = {}

const DashboardPage = async({}: Props) => {
  const session = await getServerSession(authOptions);

  return <div>{JSON.stringify(session)}</div>;
};

export default DashboardPage;