import axios from "axios";
import { Prisma } from "@prisma/client";
import { prisma } from "../../../../prisma/client";
import { isTechJobTitle, slugify } from "@/utils/utils";
import { Job } from "@/types";

type TenantConfig = {
  XTenant: string;
};

type TenantPayload = {
  tenantName?: string;
  jobsPage?: Job[];
};

type UpsertTask = {
  tenant: string;
  promise: Promise<{ action: "created" | "updated" }>;
};

type FailureStage = "fetch" | "payload" | "upsert" | "email";

type FailureLogEntry = {
  tenant: string;
  stage: FailureStage;
  reason: string;
  details?: string;
};

type TenantFailure = {
  tenant: string;
  reason: string;
};

// export const config = {
//   runtime: "nodejs",
//   schedule: "0 0 * * *",
// };

async function persistFailureLogs(runId: string, logs: FailureLogEntry[]) {
  if (logs.length === 0) {
    return;
  }

  await Promise.all(
    logs.map((log) =>
      prisma.$executeRaw(
        Prisma.sql`
          INSERT INTO CronFailureLog (id, runId, tenant, stage, reason, details, createdAt)
          VALUES (
            ${crypto.randomUUID()},
            ${runId},
            ${log.tenant},
            ${log.stage},
            ${log.reason},
            ${log.details ?? null},
            NOW(3)
          )
        `,
      ),
    ),
  );
}

async function sendCronSummaryTelegram({
  processedTenants,
  successfulFetches,
  createdCount,
  updatedCount,
  fetchFailures,
  invalidPayloads,
  upsertFailures,
  skippedNonTechJobs,
}: {
  processedTenants: number;
  successfulFetches: number;
  createdCount: number;
  updatedCount: number;
  fetchFailures: TenantFailure[];
  invalidPayloads: TenantFailure[];
  upsertFailures: TenantFailure[];
  skippedNonTechJobs: number;
}) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return {
      sent: false,
      reason: "Configuracao do Telegram incompleta",
    };
  }

  const totalFailures =
    fetchFailures.length + invalidPayloads.length + upsertFailures.length;
  const failureLines = [
    ...fetchFailures.map(
      (failure) => `- Fetch | ${failure.tenant}: ${failure.reason}`,
    ),
    ...invalidPayloads.map(
      (failure) => `- Payload | ${failure.tenant}: ${failure.reason}`,
    ),
    ...upsertFailures.map(
      (failure) => `- Upsert | ${failure.tenant}: ${failure.reason}`,
    ),
  ];
  const visibleFailureLines = failureLines.slice(0, 8);

  const text = [
    "Busca de vagas finalizada",
    "",
    "Resumo",
    `- Empresas processadas: ${processedTenants}`,
    `- Empresas com retorno valido: ${successfulFetches}`,
    `- Novas vagas adicionadas: ${createdCount}`,
    `- Vagas ja existentes atualizadas: ${updatedCount}`,
    `- Vagas ignoradas por filtro de TI: ${skippedNonTechJobs}`,
    `- Falhas totais: ${totalFailures}`,
    "",
    "Acesse o portal",
    "https://search-jobs-ecru.vercel.app/",
    "",
    totalFailures > 0 ? "Falhas encontradas" : "Nenhuma falha registrada.",
    ...visibleFailureLines,
    failureLines.length > visibleFailureLines.length
      ? `... e mais ${failureLines.length - visibleFailureLines.length} falha(s)`
      : "",
  ].join("\n");

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha ao enviar notificacao para o Telegram: ${errorText}`);
  }

  return {
    sent: true,
  };
}

export async function GET() {
  const urlApi = process.env.API_URL || "";
  const runId = crypto.randomUUID();
 const tenants: TenantConfig[] = [
  { XTenant: "alice" },
  { XTenant: "programmers" },
  { XTenant: "growdev" },
  { XTenant: "frameworkdigital" },
  { XTenant: "trinca" },
  { XTenant: "objective" },
  { XTenant: "iconit" },
  { XTenant: "townsq" },
  { XTenant: "kobe" },
  { XTenant: "grupotaking" },
  { XTenant: "tinnova" },
  { XTenant: "vinta" },
  { XTenant: "idwall" },
  { XTenant: "gx2" },
  { XTenant: "edge" },
  { XTenant: "facilitapay" },
  { XTenant: "bionexo" },
  { XTenant: "cerc" },
  { XTenant: "infleet" },
  { XTenant: "medway" },
  { XTenant: "shapedigital" },
  { XTenant: "talentx" },
  { XTenant: "coaktion" },
  { XTenant: "zappts" },
  { XTenant: "kamino" },
  { XTenant: "sharepeoplehub" },
  { XTenant: "transfero" },
  { XTenant: "nomadglobal" },
  { XTenant: "olist" },
  { XTenant: "contabilizei" },
  { XTenant: "loft" },
  { XTenant: "nubank" },
  { XTenant: "creditas" },
  { XTenant: "ifood" },
  { XTenant: "stone" },
  { XTenant: "turbi" },
  { XTenant: "kanastra" },
  { XTenant: "qive" },
  { XTenant: "zallpy" },
  { XTenant: "ecore" },
  { XTenant: "aprix" },
  { XTenant: "luby" },
  { XTenant: "brivia" },
  { XTenant: "linx" },
  { XTenant: "listo" },
  { XTenant: "celero" },
  { XTenant: "neogrid" },
  { XTenant: "zenvia" },
  { XTenant: "kiwify" },
  { XTenant: "appmax" },
  { XTenant: "ateliware" },
  { XTenant: "bycoders" },
  { XTenant: "nexaas" },
  { XTenant: "rankmyapp" },
  { XTenant: "superlogica" },
  { XTenant: "tegra" },
  { XTenant: "bemobi" }
];

  if (!urlApi) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "API_URL nao configurada",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    const fetchResults = await Promise.allSettled(
      tenants.map(async (tenant) => {
        const response = await axios.get<TenantPayload>(urlApi, {
          headers: {
            "X-Tenant": tenant.XTenant,
          },
        });

        return {
          tenant: tenant.XTenant,
          data: response.data,
        };
      }),
    );

    console.log(`Consultas realizadas em ${new Date().toLocaleString()}`);

    const fetchFailures = fetchResults
      .map((result, index) => {
        if (result.status === "fulfilled") {
          return null;
        }

        return {
          tenant: tenants[index].XTenant,
          reason:
            result.reason instanceof Error
              ? result.reason.message
              : String(result.reason),
        };
      })
      .filter((failure): failure is TenantFailure => failure !== null);

    await persistFailureLogs(
      runId,
      fetchFailures.map((failure) => ({
        tenant: failure.tenant,
        stage: "fetch" as const,
        reason: failure.reason,
      })),
    );

    const fulfilledResponses = fetchResults
      .filter(
        (
          result,
        ): result is PromiseFulfilledResult<{
          tenant: string;
          data: TenantPayload;
        }> => result.status === "fulfilled",
      )
      .map((result) => result.value);

    const invalidPayloads: TenantFailure[] = [];
    const skippedNonTechJobs: Array<{
      tenant: string;
      jobId: string;
      displayName: string;
    }> = [];
    const upsertTasks: UpsertTask[] = [];

    for (const response of fulfilledResponses) {
      const data = response.data;

      if (!data || !Array.isArray(data.jobsPage)) {
        invalidPayloads.push({
          tenant: response.tenant,
          reason: "Estrutura de dados invalida: jobsPage nao e um array",
        });
        continue;
      }

      const tenantName = data.tenantName || response.tenant;
      const techJobs = data.jobsPage.filter((jobData) => {
        const isTech = isTechJobTitle(jobData.displayName);

        if (!isTech) {
          skippedNonTechJobs.push({
            tenant: response.tenant,
            jobId: jobData.jobId,
            displayName: jobData.displayName,
          });
        }

        return isTech;
      });

      const existingJobs = await prisma.jobs.findMany({
        where: {
          jobId: {
            in: techJobs.map((jobData) => jobData.jobId),
          },
        },
        select: {
          jobId: true,
        },
      });

      const existingJobIds = new Set(existingJobs.map((job) => job.jobId));

      for (const jobData of techJobs) {
        const { jobId, displayName, workplaceType, location } = jobData;
        const action = existingJobIds.has(jobId) ? "updated" : "created";

        const link = `https://${tenantName}.inhire.app/vagas/${jobId}/${slugify(
          displayName,
        )}`;

        const job = {
          link,
          displayName,
          workplaceType,
          location,
          tenantName,
        };

        upsertTasks.push({
          tenant: response.tenant,
          promise: prisma.jobs.upsert({
            where: { jobId },
            update: job,
            create: { jobId, ...job },
          }).then(() => ({ action })),
        });
      }
    }

    const upsertResults = await Promise.allSettled(
      upsertTasks.map((task) => task.promise),
    );

    const upsertFailures = upsertResults
      .map((result, index) => {
        if (result.status === "fulfilled") {
          return null;
        }

        return {
          tenant: upsertTasks[index].tenant,
          reason:
            result.reason instanceof Error
              ? result.reason.message
              : String(result.reason),
        };
      })
      .filter((failure): failure is TenantFailure => failure !== null);

    await persistFailureLogs(
      runId,
      invalidPayloads.map((failure) => ({
        tenant: failure.tenant,
        stage: "payload" as const,
        reason: failure.reason,
      })),
    );

    await persistFailureLogs(
      runId,
      upsertFailures.map((failure) => ({
        tenant: failure.tenant,
        stage: "upsert" as const,
        reason: failure.reason,
      })),
    );

    if (fetchFailures.length > 0) {
      console.error("Falhas no fetch por tenant:", fetchFailures);
    }

    if (invalidPayloads.length > 0) {
      console.error("Payloads invalidos por tenant:", invalidPayloads);
    }

    if (upsertFailures.length > 0) {
      console.error("Falhas de upsert por tenant:", upsertFailures);
    }

    if (skippedNonTechJobs.length > 0) {
      console.log(
        "Vagas ignoradas por nao parecerem de TI:",
        skippedNonTechJobs,
      );
    }

    const successfulFetches =
      fulfilledResponses.length - invalidPayloads.length;
    const successfulUpserts = upsertResults.filter(
      (result) => result.status === "fulfilled",
    ).length;
    const createdCount = upsertResults.filter(
      (result) => result.status === "fulfilled" && result.value.action === "created",
    ).length;
    const updatedCount = upsertResults.filter(
      (result) => result.status === "fulfilled" && result.value.action === "updated",
    ).length;

    const telegramResult = await sendCronSummaryTelegram({
      processedTenants: tenants.length,
      successfulFetches,
      createdCount,
      updatedCount,
      fetchFailures,
      invalidPayloads,
      upsertFailures,
      skippedNonTechJobs: skippedNonTechJobs.length,
    }).catch(async (error) => {
      const reason = error instanceof Error ? error.message : String(error);

      await persistFailureLogs(runId, [
        {
          tenant: "system",
          stage: "email",
          reason,
        },
      ]);

      return {
        sent: false,
        reason,
      };
    });

    return new Response(
      JSON.stringify({
        success: fetchFailures.length === 0 && invalidPayloads.length === 0,
        runId,
        processedTenants: tenants.length,
        successfulFetches,
        fetchFailures,
        invalidPayloads,
        skippedNonTechJobs: skippedNonTechJobs.length,
        attemptedUpserts: upsertTasks.length,
        successfulUpserts,
        createdCount,
        updatedCount,
        upsertFailures,
        telegram: telegramResult,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Erro inesperado ao processar o cron:", error);
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
