import { NextResponse } from "next/server";
import { prisma } from "../../../../prisma/client";

function parseListParam(value: string | null) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const companies = parseListParam(searchParams.get("companies"));
  const locations = parseListParam(searchParams.get("locations"));
  const workplaceTypes = parseListParam(searchParams.get("workplaceTypes"));
  const postedWithinDays = Number(searchParams.get("postedWithinDays")) || 0;

  const searchWhere = search
    ? {
        OR: [
          { displayName: { contains: search } },
          { tenantName: { contains: search } },
          { location: { contains: search } },
        ],
      }
    : {};

  const publishedAfter =
    postedWithinDays > 0
      ? new Date(Date.now() - postedWithinDays * 24 * 60 * 60 * 1000)
      : null;

  const where = {
    ...searchWhere,
    ...(companies.length > 0
      ? {
          tenantName: {
            in: companies,
          },
        }
      : {}),
    ...(locations.length > 0
      ? {
          location: {
            in: locations,
          },
        }
      : {}),
    ...(workplaceTypes.length > 0
      ? {
          workplaceType: {
            in: workplaceTypes,
          },
        }
      : {}),
    ...(publishedAfter
      ? {
          createdAt: {
            gte: publishedAfter,
          },
        }
      : {}),
  };

  try {
    const [
      paginatedResults,
      totalCount,
      companyOptions,
      locationOptions,
      workplaceTypeOptions,
    ] = await prisma.$transaction([
      prisma.jobs.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.jobs.count({
        where,
      }),
      prisma.jobs.findMany({
        where: searchWhere,
        distinct: ["tenantName"],
        select: { tenantName: true },
        orderBy: { tenantName: "asc" },
      }),
      prisma.jobs.findMany({
        where: searchWhere,
        distinct: ["location"],
        select: { location: true },
        orderBy: { location: "asc" },
      }),
      prisma.jobs.findMany({
        where: searchWhere,
        distinct: ["workplaceType"],
        select: { workplaceType: true },
        orderBy: { workplaceType: "asc" },
      }),
    ]);

    return NextResponse.json({
      paginatedResults,
      totalCount,
      page,
      pageSize,
      availableFilters: {
        companies: companyOptions
          .map((item) => item.tenantName)
          .filter(Boolean),
        locations: locationOptions.map((item) => item.location).filter(Boolean),
        workplaceTypes: workplaceTypeOptions
          .map((item) => item.workplaceType)
          .filter(Boolean),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar jobs" + error },
      { status: 500 }
    );
  }
}
