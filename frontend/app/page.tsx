import HomePage from '@/components/home-page';
import { createHomeRepository } from '@/lib/home-repository';

export const revalidate = 60;

export default async function Home() {
  const repo = await createHomeRepository();
  const data = await repo.getAll();
  return <HomePage data={data} />;
}
