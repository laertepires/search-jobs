import { NextResponse } from "next/server";
import { prisma } from "../../../../prisma/client";

function parseListParam(value: string | null) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeLocationPart(value: string) {
  return value
    .replace(/^state of\s+/i, "")
    .replace(/^federal district$/i, "DF")
    .replace(/^brasil$/i, "Brazil")
    .trim();
}

function normalizeCountry(value: string) {
  const normalized = value.trim().toLowerCase();

  if (normalized === "br" || normalized === "brazil" || normalized === "brasil") {
    return "Brasil";
  }

  return value.trim();
}

function buildLocationLabel(location: string) {
  const parts = location
    .split(",")
    .map((part) => normalizeLocationPart(part.trim()))
    .filter(Boolean);

  if (parts.length === 0) {
    return location;
  }

  const country = normalizeCountry(parts[parts.length - 1]);
  const remainingParts = parts.slice(0, -1);
  const uniqueParts = Array.from(new Set(remainingParts));

  if (uniqueParts.length === 0) {
    return country;
  }

  return [...uniqueParts, country].join(", ");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const companies = parseListParam(searchParams.get("companies"));
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

  const locationOptions = await prisma.jobs.findMany({
    where: searchWhere,
    distinct: ["location"],
    select: { location: true },
    orderBy: { location: "asc" },
  });

  const locationsMap = locationOptions.reduce<Map<string, string[]>>((accumulator, item) => {
    if (!item.location) {
      return accumulator;
    }

    const label = buildLocationLabel(item.location);
    const currentValues = accumulator.get(label) || [];
    currentValues.push(item.location);
    accumulator.set(label, currentValues);
    return accumulator;
  }, new Map());

  const selectedLocations = parseListParam(searchParams.get("locations"));
  const rawSelectedLocations = selectedLocations.flatMap(
    (location) => locationsMap.get(location) || [],
  );

  const where = {
    ...searchWhere,
    ...(companies.length > 0
      ? {
          tenantName: {
            in: companies,
          },
        }
      : {}),
    ...(rawSelectedLocations.length > 0
      ? {
          location: {
            in: rawSelectedLocations,
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
          OR: [
            {
              sourcePublishedAt: {
                gte: publishedAfter,
              },
            },
            {
              sourcePublishedAt: null,
              createdAt: {
                gte: publishedAfter,
              },
            },
          ],
        }
      : {}),
  };

  try {
    const [
      paginatedResults,
      totalCount,
      companyOptions,
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
        locations: Array.from(locationsMap.keys()).sort((a, b) =>
          a.localeCompare(b, "pt-BR"),
        ),
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
