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
