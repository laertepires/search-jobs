import { NextResponse } from "next/server";
import { prisma } from "../../../../prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";

  try {
    const [paginatedResults, totalCount] = await prisma.$transaction([
      prisma.jobs.findMany({
        where: { displayName: { contains: search } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.jobs.count({
        where: { displayName: { contains: search } },
      }),
    ]);

    return NextResponse.json({
      paginatedResults,
      totalCount,
      page,
      pageSize,
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar jobs" + error }, { status: 500 });
  }
}
