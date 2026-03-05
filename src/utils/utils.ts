import { isValid } from "date-fns";

const saoPauloDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function getSaoPauloDateKey(date: Date) {
  return saoPauloDateFormatter.format(date);
}

function getSaoPauloDayDifference(date: Date) {
  const targetDate = getSaoPauloDateKey(date);
  const currentDate = getSaoPauloDateKey(new Date());

  const targetUtcMidnight = new Date(`${targetDate}T00:00:00Z`).getTime();
  const currentUtcMidnight = new Date(`${currentDate}T00:00:00Z`).getTime();

  return Math.round((currentUtcMidnight - targetUtcMidnight) / 86400000);
}

/**
 * Formata uma data para uma string descritiva relativa à data atual.
 *
 * Se a data informada for hoje, retorna "Postado hoje".
 * Caso contrário, calcula quantos dias se passaram e retorna no formato "1 dia atrás" ou "N dias atrás".
 *
 * @param {string | Date} createdAt - A data a ser formatada.
 * @returns {string} - A data formatada.
 */
export function formatDate(createdAt: string | Date) {
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);

  if (!isValid(date)) {
    return "Data inválida";
  }

  const diffDays = getSaoPauloDayDifference(date);

  if (diffDays <= 0) {
    return "hoje";
  }

  if (diffDays === 1) return "ontem";
  return `${diffDays} dias atrás`;
}

/**
 * Formata o link removendo espaços e caracteres especiaos
 *
 * @param {string} text - Texto a ser formatado.
 * @returns {string} - o link formatado.
 */

export function slugify(text: string) {
  text = text.replace(/[\[\]]/g, "");
  return text.toLowerCase().trim().replace(/\s+/g, "-");
}

export function normalizeText(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const techKeywords = [
  "software",
  "developer",
  "desenvolvedor",
  "desenvolvedora",
  "engenheiro de software",
  "engenheira de software",
  "frontend",
  "front-end",
  "backend",
  "back-end",
  "full stack",
  "fullstack",
  "mobile",
  "ios",
  "android",
  "react",
  "node",
  ".net",
  "dotnet",
  "java",
  "python",
  "golang",
  "php",
  "wordpress",
  "ruby",
  "qa",
  "quality assurance",
  "testes",
  "tester",
  "sre",
  "devops",
  "cloud",
  "dados",
  "data",
  "machine learning",
  "ia",
  "ai",
  "artificial intelligence",
  "inteligencia artificial",
  "analytics",
  "bi",
  "infra",
  "infraestrutura",
  "seguranca da informacao",
  "cyber",
  "security",
  "product manager",
  "produto digital",
  "ux",
  "ui",
  "design system",
  "site reliability",
  "arquiteto de software",
  "arquiteta de software",
  "tech lead",
  "programador",
  "programadora",
  "analista de sistemas",
  "analista de sistema",
  "analista de dados",
  "cientista de dados",
  "data engineer",
  "data scientist",
  "business intelligence",
  "engenheiro de dados",
  "engenheira de dados",
];

const nonTechKeywords = [
  "assistente administrativo",
  "administrativo",
  "juridico",
  "financeiro",
  "comercial",
  "vendas",
  "marketing",
  "cs",
  "customer success",
  "rh",
  "recrutador",
  "recruiter",
  "talent acquisition",
  "people",
  "pessoas e cultura",
  "contabil",
  "frota",
  "controle de acesso",
];

export function isTechJobTitle(title: string) {
  const normalizedTitle = ` ${normalizeText(title)} `;
  const hasTechKeyword = techKeywords.some((keyword) =>
    normalizedTitle.includes(` ${normalizeText(keyword)} `) ||
    normalizedTitle.includes(normalizeText(keyword))
  );

  if (!hasTechKeyword) {
    return false;
  }

  return !nonTechKeywords.some((keyword) =>
    normalizedTitle.includes(normalizeText(keyword))
  );
}
