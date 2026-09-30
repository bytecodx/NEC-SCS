export function generateAchievementId(departmentCode: string = "CSE", sequence: number = 1): string {
  const year = new Date().getFullYear();
  const dept = departmentCode.toUpperCase().slice(0, 4);
  const seqStr = sequence.toString().padStart(6, "0");
  return `ACH-${year}-${dept}-${seqStr}`;
}
