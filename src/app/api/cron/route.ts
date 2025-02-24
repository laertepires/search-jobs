import axios from "axios";
import { prisma } from "../../../../prisma/client";
import { slugify } from "@/utils/utils";
import { Job } from "@/types";

export const config = {
  runtime: "nodejs",
  schedule: "0 */8 * * *",
};

export async function GET() {
  const urlApi = process.env.API_URL || '';
  const urls = [
    {
      XTenant: "lyncas",
    },
    {
      XTenant: "indicium",
    },
    {
      XTenant: "tqi",
    },
    {
      XTenant: "intera",
    },
  ];

  try {
    const responses = await Promise.all(
      urls.map((url) =>
        axios.get(urlApi, {
          headers: {
            "X-Tenant": url.XTenant,
          },
        })
      )
    );

    console.log(`Consultas realizadas em ${new Date().toLocaleString()}`);

    const upsertPromises = responses.flatMap((response) => {
      const data = response.data;
      console.log("Dados recebidos:", data);

      if (!data || !Array.isArray(data.jobsPage)) {
        throw new Error("Estrutura de dados inválida: jobsPage não é um array");
      }

      return data.jobsPage.map((jobData: Job) => {
        const { jobId, displayName, workplaceType, location } = jobData;
        const link = `https://${
          data.tenantName
        }.inhire.app/vagas/${jobId}/${slugify(displayName)}`;

        const job = {
          link,
          displayName,
          workplaceType,
          location,
          tenantName: data.tenantName,
        };

        return prisma.jobs.upsert({
          where: { jobId },
          update: job,
          create: { jobId, ...job },
        });
      });
    });

    const results = await Promise.allSettled(upsertPromises);
    const rejected = results.filter((result) => result.status === "rejected");
    if (rejected.length > 0) {
      console.error("Alguns jobs falharam ao ser processados:", rejected);
    }

    return new Response(
      JSON.stringify({
        success: true,
        processedUrls: urls.length,
        upsertedJobs: upsertPromises.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro ao processar as requisições:", error);
    return new Response(
      JSON.stringify({ success: false, error: error }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
