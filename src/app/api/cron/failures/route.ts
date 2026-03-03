import { Prisma } from "@prisma/client";
import { prisma } from "../../../../../prisma/client";

type FailureSummaryRow = {
  tenant: string;
  stage: string;
  total: bigint | number;
  lastFailureAt: Date | string;
  lastRunId: string;
};

type FailureDetailRow = {
  id: string;
  runId: string;
  tenant: string;
  stage: string;
  reason: string;
  details: string | null;
  createdAt: Date | string;
};

function toNumber(value: bigint | number) {
  return typeof value === "bigint" ? Number(value) : value;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stage = searchParams.get("stage");
  const tenant = searchParams.get("tenant");
  const runId = searchParams.get("runId");
  const includeDetails = searchParams.get("includeDetails") === "true";
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);

  const conditions: Prisma.Sql[] = [];

  if (stage) {
    conditions.push(Prisma.sql`stage = ${stage}`);
  }

  if (tenant) {
    conditions.push(Prisma.sql`tenant = ${tenant}`);
  }

  if (runId) {
    conditions.push(Prisma.sql`runId = ${runId}`);
  }

  const whereClause =
    conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`
      : Prisma.empty;

  try {
    const summaryRows = await prisma.$queryRaw<FailureSummaryRow[]>(
      Prisma.sql`
        SELECT
          tenant,
          stage,
          COUNT(*) as total,
          MAX(createdAt) as lastFailureAt,
          SUBSTRING_INDEX(
            GROUP_CONCAT(runId ORDER BY createdAt DESC SEPARATOR ','),
            ',',
            1
          ) as lastRunId
        FROM CronFailureLog
        ${whereClause}
        GROUP BY tenant, stage
        ORDER BY lastFailureAt DESC
        LIMIT ${limit}
      `,
    );

    const detailRows = includeDetails
      ? await prisma.$queryRaw<FailureDetailRow[]>(
          Prisma.sql`
            SELECT
              id,
              runId,
              tenant,
              stage,
              reason,
              details,
              createdAt
            FROM CronFailureLog
            ${whereClause}
            ORDER BY createdAt DESC
            LIMIT ${limit}
          `,
        )
      : [];

    return new Response(
      JSON.stringify({
        success: true,
        filters: {
          stage,
          tenant,
          runId,
          limit,
          includeDetails,
        },
        summary: summaryRows.map((row) => ({
          tenant: row.tenant,
          stage: row.stage,
          total: toNumber(row.total),
          lastFailureAt: row.lastFailureAt,
          lastRunId: row.lastRunId,
        })),
        details: detailRows,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
