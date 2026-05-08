import { getTeamPositions } from './extractMetrics';

/**
 * Get department name from position title
 * Maps positions to departments based on team structure
 */
export function getDepartmentFromPosition(position: string): string {
  const positions = getTeamPositions();
  const canonicalPosition = positions.find(
    (p) => p.titleEn === position || p.title === position
  );

  if (!canonicalPosition) {
    // Default fallback
    return 'General';
  }

  // Map based on position title patterns
  const positionTitle = canonicalPosition.titleEn.toLowerCase();

  // Leadership positions
  if (
    positionTitle.includes('cto') ||
    positionTitle.includes('ceo') ||
    positionTitle.includes('head of') ||
    positionTitle.includes('manager') ||
    positionTitle.includes('lead')
  ) {
    if (positionTitle.includes('marketing')) {
      return 'Marketing';
    }
    if (positionTitle.includes('operation')) {
      return 'Operations';
    }
    if (positionTitle.includes('technical') || positionTitle.includes('cto')) {
      return 'Technology';
    }
    return 'Leadership';
  }

  // Technical positions
  if (
    positionTitle.includes('developer') ||
    positionTitle.includes('engineer') ||
    positionTitle.includes('programmer') ||
    positionTitle.includes('technical') ||
    positionTitle.includes('frontend') ||
    positionTitle.includes('backend') ||
    positionTitle.includes('full-stack') ||
    positionTitle.includes('devops') ||
    positionTitle.includes('qa') ||
    positionTitle.includes('ui/ux') ||
    positionTitle.includes('designer')
  ) {
    return 'Technology';
  }

  // Content positions
  if (
    positionTitle.includes('content') ||
    positionTitle.includes('writer') ||
    positionTitle.includes('editor') ||
    positionTitle.includes('copywriter') ||
    positionTitle.includes('translator')
  ) {
    return 'Content';
  }

  // Marketing positions
  if (
    positionTitle.includes('marketing') ||
    positionTitle.includes('seo') ||
    positionTitle.includes('social media') ||
    positionTitle.includes('digital marketing')
  ) {
    return 'Marketing';
  }

  // Operations positions
  if (
    positionTitle.includes('operation') ||
    positionTitle.includes('admin') ||
    positionTitle.includes('coordinator') ||
    positionTitle.includes('assistant')
  ) {
    return 'Operations';
  }

  // Sales positions
  if (positionTitle.includes('sales') || positionTitle.includes('business development')) {
    return 'Sales';
  }

  // Default
  return 'General';
}

/**
 * Get department name in Arabic
 */
export function getDepartmentFromPositionAr(position: string): string {
  const department = getDepartmentFromPosition(position);
  const departmentMap: Record<string, string> = {
    Technology: 'التقنية',
    Marketing: 'التسويق',
    Content: 'المحتوى',
    Operations: 'العمليات',
    Sales: 'المبيعات',
    Leadership: 'الإدارة',
    General: 'عام',
  };
  return departmentMap[department] || department;
}









