import { prisma } from "../../prisma/client";

export default async function Teste() {
  const page = 3;
  const limit = 10;

  const skip = (page - 1) * limit;
  const teste = await prisma.jobs.findMany({
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });
  console.log("teste aqui => ", teste);
  return <></>;
}
