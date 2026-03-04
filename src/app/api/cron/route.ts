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

type GreenhouseJobPost = {
  id: number;
  title: string;
  location?: string | null;
  absolute_url: string;
  published_at?: string;
  department?: {
    name?: string;
  } | null;
};

type GreenhouseResponse = {
  jobPosts?: {
    page: number;
    total_pages: number;
    data: GreenhouseJobPost[];
  };
};

type WorkableLocation = {
  country?: string;
  city?: string;
  region?: string | null;
};

type WorkableJobPost = {
  id: number;
  shortcode: string;
  title: string;
  remote?: boolean;
  location?: WorkableLocation | null;
  state?: string;
  workplace?: string | null;
  published?: string;
};

type WorkableResponse = {
  total?: number;
  results?: WorkableJobPost[];
  nextPage?: string;
};

type WorkablePublicCompany = {
  title?: string;
};

type WorkablePublicLocation = {
  city?: string | null;
  subregion?: string | null;
  countryName?: string | null;
};

type WorkablePublicJobPost = {
  id: string;
  title: string;
  state?: string;
  url: string;
  created?: string;
  workplace?: string | null;
  company?: WorkablePublicCompany | null;
  location?: WorkablePublicLocation | null;
};

type WorkablePublicResponse = {
  totalSize?: number;
  nextPageToken?: string;
  jobs?: WorkablePublicJobPost[];
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

type NormalizedJob = {
  jobId: string;
  displayName: string;
  workplaceType?: string | null;
  location: string;
  link: string;
  publishedAt?: string | Date;
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

function inferWorkplaceType(location?: string | null) {
  const normalizedLocation = (location || "").toLowerCase();

  if (normalizedLocation.includes("remoto") || normalizedLocation.includes("remote")) {
    return "Remote";
  }

  if (normalizedLocation.includes("híbrido") || normalizedLocation.includes("hibrido")) {
    return "Hybrid";
  }

  if (normalizedLocation.includes("hybrid")) {
    return "Hybrid";
  }

  return "On-site";
}

function isPublishedWithinDays(dateValue?: string | Date, days = 30) {
  if (!dateValue) {
    return true;
  }

  const publishedAt = dateValue instanceof Date ? dateValue : new Date(dateValue);

  if (Number.isNaN(publishedAt.getTime())) {
    return true;
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return publishedAt >= cutoffDate;
}

async function createUpsertTasks(
  tenant: string,
  tenantName: string,
  jobs: NormalizedJob[],
) {
  const existingJobs = await prisma.jobs.findMany({
    where: {
      jobId: {
        in: jobs.map((job) => job.jobId),
      },
    },
    select: {
      jobId: true,
    },
  });

  const existingJobIds = new Set(existingJobs.map((job) => job.jobId));

  return jobs.map<UpsertTask>((job) => {
    const action = existingJobIds.has(job.jobId) ? "updated" : "created";
    const payload = {
      link: job.link,
      displayName: job.displayName,
      workplaceType: job.workplaceType,
      location: job.location,
      tenantName,
    };

    return {
      tenant,
      promise: prisma.jobs
        .upsert({
          where: { jobId: job.jobId },
          update: payload,
          create: { jobId: job.jobId, ...payload },
        })
        .then(() => ({ action })),
    };
  });
}

async function fetchGreenhouseJobs() {
  const tenant = "greenhouse:linx";
  const tenantName = "Linx";
  const departmentId = "4070828003";
  const baseUrl = "https://job-boards.greenhouse.io/linx/";

  const fetchPage = async (page: number) => {
    const response = await axios.get<GreenhouseResponse>(baseUrl, {
      params: {
        "departments[]": departmentId,
        page,
        _data: "routes/$url_token",
      },
    });

    return response.data;
  };

  const firstPage = await fetchPage(1);

  if (!firstPage.jobPosts || !Array.isArray(firstPage.jobPosts.data)) {
    throw new Error("Estrutura de dados invalida da Greenhouse");
  }

  const totalPages = Math.max(firstPage.jobPosts.total_pages || 1, 1);
  const remainingPages =
    totalPages > 1
      ? await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, index) => fetchPage(index + 2)),
        )
      : [];

  const allPosts = [
    ...firstPage.jobPosts.data,
    ...remainingPages.flatMap((page) => page.jobPosts?.data || []),
  ];

  const jobs = allPosts
    .filter((post) => post.department?.name === "Engenharia & Tecnologia")
    .map<NormalizedJob>((post) => ({
      jobId: `greenhouse-linx-${post.id}`,
      displayName: post.title,
      workplaceType: inferWorkplaceType(post.location),
      location: post.location || "Local nao informado",
      link: post.absolute_url,
      publishedAt: post.published_at,
    }));

  return {
    tenant,
    tenantName,
    jobs,
  };
}

function formatWorkableLocation(location?: WorkableLocation | null) {
  if (!location) {
    return "Local nao informado";
  }

  return [location.city, location.region, location.country].filter(Boolean).join(", ")
    || "Local nao informado";
}

function formatWorkablePublicLocation(location?: WorkablePublicLocation | null) {
  if (!location) {
    return "Local nao informado";
  }

  return [location.city, location.subregion, location.countryName]
    .filter(Boolean)
    .join(", ") || "Local nao informado";
}

async function fetchWorkableJobs() {
  const tenant = "workable:jobrack";
  const tenantName = "JobRack";
  const url = "https://apply.workable.com/api/v3/accounts/jobrack/jobs";

  const fetchPage = async (token?: string) => {
    const payload = {
      query: "",
      ...(token ? { token } : {}),
      department: [],
      location: [],
      workplace: [],
      worktype: [],
    };

    const response = await axios.post<WorkableResponse>(url, payload, {
      headers: {
        accept: "application/json, text/plain, */*",
        "content-type": "application/json",
      },
    });

    return response.data;
  };

  const jobs: WorkableJobPost[] = [];
  let nextToken: string | undefined;

  do {
    const data = await fetchPage(nextToken);

    if (!Array.isArray(data.results)) {
      throw new Error("Estrutura de dados invalida da Workable");
    }

    jobs.push(...data.results);
    nextToken = data.nextPage || undefined;
  } while (nextToken);

  const techJobs = jobs.filter(
    (job) => job.state === "published" && isTechJobTitle(job.title),
  );

  return {
    tenant,
    tenantName,
    jobs: techJobs.map<NormalizedJob>((job) => ({
      jobId: `workable-jobrack-${job.id}`,
      displayName: job.title,
      workplaceType:
        job.workplace === "remote"
          ? "Remote"
          : job.remote
            ? "Remote"
            : inferWorkplaceType(formatWorkableLocation(job.location)),
      location: formatWorkableLocation(job.location),
      link: `https://apply.workable.com/j/${job.shortcode}`,
      publishedAt: job.published,
    })),
  };
}

async function fetchWorkablePublicJobs() {
  const tenant = "workable:global-brazil";
  const baseUrl = "https://jobs.workable.com/api/v1/jobs";

  const fetchPage = async (pageToken?: string) => {
    const response = await axios.get<WorkablePublicResponse>(baseUrl, {
      params: {
        location: "Brazil",
        day_range: 1,
        ...(pageToken ? { pageToken } : {}),
      },
    });

    return response.data;
  };

  const jobs: WorkablePublicJobPost[] = [];
  let nextPageToken: string | undefined;

  do {
    const data = await fetchPage(nextPageToken);

    if (!Array.isArray(data.jobs)) {
      throw new Error("Estrutura de dados invalida da Workable publica");
    }

    jobs.push(...data.jobs);
    nextPageToken = data.nextPageToken || undefined;
  } while (nextPageToken);

  const techJobs = jobs.filter(
    (job) => job.state === "published" && isTechJobTitle(job.title),
  );

  const uniqueJobsByLink = new Map<string, WorkablePublicJobPost>();

  for (const job of techJobs) {
    const existingJob = uniqueJobsByLink.get(job.url);

    if (!existingJob) {
      uniqueJobsByLink.set(job.url, job);
      continue;
    }

    const existingCreatedAt = existingJob.created
      ? new Date(existingJob.created).getTime()
      : 0;
    const currentCreatedAt = job.created ? new Date(job.created).getTime() : 0;

    if (currentCreatedAt > existingCreatedAt) {
      uniqueJobsByLink.set(job.url, job);
    }
  }

  return {
    tenant,
    jobs: Array.from(uniqueJobsByLink.values()).map((job) => ({
      tenantName: job.company?.title?.trim() || "Workable",
      normalizedJob: {
        jobId: `workable-global-${job.id}`,
        displayName: job.title,
        workplaceType: inferWorkplaceType(job.workplace),
        location: formatWorkablePublicLocation(job.location),
        link: job.url,
        publishedAt: job.created,
      },
    })),
  };
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
  skippedOldJobs,
}: {
  processedTenants: number;
  successfulFetches: number;
  createdCount: number;
  updatedCount: number;
  fetchFailures: TenantFailure[];
  invalidPayloads: TenantFailure[];
  upsertFailures: TenantFailure[];
  skippedNonTechJobs: number;
  skippedOldJobs: number;
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
    `- Vagas ignoradas por serem antigas: ${skippedOldJobs}`,
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

export async function GET(request: Request) {
  const urlApi = process.env.API_URL || "";
  const runId = crypto.randomUUID();
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source") || "all";
  const batch = Math.max(Number(searchParams.get("batch")) || 1, 1);
  const batchSize = Math.max(Number(searchParams.get("batchSize")) || 15, 1);
  const shouldNotify =
    searchParams.get("notify") === "true" || searchParams.get("notify") === "1";
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
    { XTenant: "bemobi" },
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
    const batchStart = (batch - 1) * batchSize;
    const selectedTenants = tenants.slice(batchStart, batchStart + batchSize);
    const shouldRunInhire = source === "all" || source === "inhire";
    const shouldRunGreenhouse = source === "all" || source === "greenhouse";
    const shouldRunWorkableJobrack = source === "all" || source === "workable-jobrack";
    const shouldRunWorkablePublic = source === "all" || source === "workable-public";

    const fetchResults = shouldRunInhire
      ? await Promise.allSettled(
          selectedTenants.map(async (tenant) => {
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
        )
      : [];

    if (shouldRunInhire) {
      console.log(`Consultas realizadas em ${new Date().toLocaleString()}`);
    }

    const fetchFailures = fetchResults
      .map((result, index) => {
        if (result.status === "fulfilled") {
          return null;
        }

        return {
          tenant: selectedTenants[index].XTenant,
          reason:
            result.reason instanceof Error
              ? result.reason.message
              : String(result.reason),
        };
      })
      .filter((failure): failure is TenantFailure => failure !== null);

    if (fetchFailures.length > 0) {
      await persistFailureLogs(
        runId,
        fetchFailures.map((failure) => ({
          tenant: failure.tenant,
          stage: "fetch" as const,
          reason: failure.reason,
        })),
      );
    }

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
    const skippedOldJobs: Array<{
      tenant: string;
      jobId: string;
      displayName: string;
      publishedAt?: string | Date;
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

      const normalizedJobs = techJobs.map<NormalizedJob>((jobData) => ({
        jobId: jobData.jobId,
        displayName: jobData.displayName,
        workplaceType: jobData.workplaceType,
        location: jobData.location,
        link: `https://${tenantName}.inhire.app/vagas/${jobData.jobId}/${slugify(
          jobData.displayName,
        )}`,
        publishedAt: jobData.createdAt,
      }));

      const recentJobs = normalizedJobs.filter((jobData) => {
        const isRecent = isPublishedWithinDays(jobData.publishedAt);

        if (!isRecent) {
          skippedOldJobs.push({
            tenant: response.tenant,
            jobId: jobData.jobId,
            displayName: jobData.displayName,
            publishedAt: jobData.publishedAt,
          });
        }

        return isRecent;
      });

      upsertTasks.push(
        ...(await createUpsertTasks(response.tenant, tenantName, recentJobs)),
      );
    }

    if (shouldRunGreenhouse) {
      try {
        const greenhouseSource = await fetchGreenhouseJobs();
        const recentGreenhouseJobs = greenhouseSource.jobs.filter((jobData) => {
          const isRecent = isPublishedWithinDays(jobData.publishedAt);

          if (!isRecent) {
            skippedOldJobs.push({
              tenant: greenhouseSource.tenant,
              jobId: jobData.jobId,
              displayName: jobData.displayName,
              publishedAt: jobData.publishedAt,
            });
          }

          return isRecent;
        });

        upsertTasks.push(
          ...(await createUpsertTasks(
            greenhouseSource.tenant,
            greenhouseSource.tenantName,
            recentGreenhouseJobs,
          )),
        );
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        fetchFailures.push({
          tenant: "greenhouse:linx",
          reason,
        });

        await persistFailureLogs(runId, [
          {
            tenant: "greenhouse:linx",
            stage: "fetch",
            reason,
          },
        ]);
      }
    }

    if (shouldRunWorkableJobrack) {
      try {
        const workableSource = await fetchWorkableJobs();
        const recentWorkableJobs = workableSource.jobs.filter((jobData) => {
          const isRecent = isPublishedWithinDays(jobData.publishedAt);

          if (!isRecent) {
            skippedOldJobs.push({
              tenant: workableSource.tenant,
              jobId: jobData.jobId,
              displayName: jobData.displayName,
              publishedAt: jobData.publishedAt,
            });
          }

          return isRecent;
        });

        upsertTasks.push(
          ...(await createUpsertTasks(
            workableSource.tenant,
            workableSource.tenantName,
            recentWorkableJobs,
          )),
        );
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        fetchFailures.push({
          tenant: "workable:jobrack",
          reason,
        });

        await persistFailureLogs(runId, [
          {
            tenant: "workable:jobrack",
            stage: "fetch",
            reason,
          },
        ]);
      }
    }

    if (shouldRunWorkablePublic) {
      try {
        const workablePublicSource = await fetchWorkablePublicJobs();
        const recentWorkablePublicJobs = workablePublicSource.jobs.filter((jobData) => {
          const isRecent = isPublishedWithinDays(jobData.normalizedJob.publishedAt);

          if (!isRecent) {
            skippedOldJobs.push({
              tenant: workablePublicSource.tenant,
              jobId: jobData.normalizedJob.jobId,
              displayName: jobData.normalizedJob.displayName,
              publishedAt: jobData.normalizedJob.publishedAt,
            });
          }

          return isRecent;
        });

        const jobsByTenant = recentWorkablePublicJobs.reduce<
          Map<string, NormalizedJob[]>
        >((accumulator, jobData) => {
          const tenantJobs = accumulator.get(jobData.tenantName) || [];
          tenantJobs.push(jobData.normalizedJob);
          accumulator.set(jobData.tenantName, tenantJobs);
          return accumulator;
        }, new Map());

        for (const [tenantName, jobs] of jobsByTenant) {
          upsertTasks.push(
            ...(await createUpsertTasks(
              workablePublicSource.tenant,
              tenantName,
              jobs,
            )),
          );
        }
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        fetchFailures.push({
          tenant: "workable:global-brazil",
          reason,
        });

        await persistFailureLogs(runId, [
          {
            tenant: "workable:global-brazil",
            stage: "fetch",
            reason,
          },
        ]);
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

    if (skippedOldJobs.length > 0) {
      console.log("Vagas ignoradas por serem antigas:", skippedOldJobs);
    }

    const processedTenants =
      (shouldRunInhire ? selectedTenants.length : 0) +
      (shouldRunGreenhouse ? 1 : 0) +
      (shouldRunWorkableJobrack ? 1 : 0) +
      (shouldRunWorkablePublic ? 1 : 0);
    const successfulFetches =
      fulfilledResponses.length -
      invalidPayloads.length +
      (shouldRunGreenhouse
        ? fetchFailures.some((failure) => failure.tenant === "greenhouse:linx")
          ? 0
          : 1
        : 0) +
      (shouldRunWorkableJobrack
        ? fetchFailures.some((failure) => failure.tenant === "workable:jobrack")
          ? 0
          : 1
        : 0) +
      (shouldRunWorkablePublic
        ? fetchFailures.some((failure) => failure.tenant === "workable:global-brazil")
          ? 0
          : 1
        : 0);
    const successfulUpserts = upsertResults.filter(
      (result) => result.status === "fulfilled",
    ).length;
    const createdCount = upsertResults.filter(
      (result) => result.status === "fulfilled" && result.value.action === "created",
    ).length;
    const updatedCount = upsertResults.filter(
      (result) => result.status === "fulfilled" && result.value.action === "updated",
    ).length;

    const telegramResult = shouldNotify
      ? await sendCronSummaryTelegram({
          processedTenants,
          successfulFetches,
          createdCount,
          updatedCount,
          fetchFailures,
          invalidPayloads,
          upsertFailures,
          skippedNonTechJobs: skippedNonTechJobs.length,
          skippedOldJobs: skippedOldJobs.length,
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
        })
      : {
          sent: false,
          reason: "Notificacao desativada para esta execucao",
        };

    return new Response(
      JSON.stringify({
        success: fetchFailures.length === 0 && invalidPayloads.length === 0,
        runId,
        source,
        batch,
        batchSize,
        processedTenants,
        successfulFetches,
        fetchFailures,
        invalidPayloads,
        skippedNonTechJobs: skippedNonTechJobs.length,
        skippedOldJobs: skippedOldJobs.length,
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
