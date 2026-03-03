import { differenceInDays, isToday, isValid, isYesterday } from "date-fns";

/**
 * Formata uma data para uma string descritiva relativa à data atual.
 *
 * Se a data informada for hoje, retorna "Postado hoje".
 * Caso contrário, calcula quantos dias se passaram e retorna no formato "1 dia atrás" ou "N dias atrás".
 *
 * @param {string | Date} createdAt - A data a ser formatada.
 * @returns {string} - A data formatada.
 */
export function formatDate(createdAt: Date) {
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);

  if (!isValid(date)) {
    return "Data inválida";
  }

  const now = new Date();
  

  if (isToday(date)) {
    return "hoje";
  }

  const diffDays = differenceInDays(now, date);
  if (isYesterday(date)) return "ontem";
  return diffDays === 1 ? "1 dia atrás" : `${diffDays} dias atrás`;
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
  "ia ",
  "ai ",
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
