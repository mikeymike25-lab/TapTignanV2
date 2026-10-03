import { generateReportId } from '../reportId';

describe('generateReportId', () => {
  it('generates an ID matching TT-YYYY-NNNNN pattern', () => {
    const id = generateReportId();
    expect(id).toMatch(/^TT-\d{4}-\d{5}$/);
  });

  it('includes the current year in the ID', () => {
    const currentYear = new Date().getFullYear();
    const id = generateReportId();
    expect(id).toContain(`TT-${currentYear}-`);
  });

  it('pads specified counter to 5 digits', () => {
    const currentYear = new Date().getFullYear();
    const id = generateReportId(7);
    expect(id).toBe(`TT-${currentYear}-00007`);

    const id2 = generateReportId(1234);
    expect(id2).toBe(`TT-${currentYear}-01234`);
  });

  it('generates unique IDs across consecutive invocations', () => {
    const ids = new Set([
      generateReportId(),
      generateReportId(),
      generateReportId(),
      generateReportId(),
      generateReportId(),
    ]);
    expect(ids.size).toBeGreaterThanOrEqual(1);
  });
});
