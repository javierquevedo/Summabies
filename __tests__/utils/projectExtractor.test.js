const { extractProjects, hasProjectTag, normalizeProjectName } = require('../../src/utils/projectExtractor');

describe('projectExtractor', () => {
  describe('extractProjects', () => {
    test('should extract a single project from a message', () => {
      const text = '[ProjectA] This is a test message';
      expect(extractProjects(text)).toEqual(['ProjectA']);
    });

    test('should extract multiple projects from a message', () => {
      const text = '[ProjectA] [ProjectB] This is a test message';
      expect(extractProjects(text)).toEqual(['ProjectA', 'ProjectB']);
    });

    test('should extract multiple projects from a message with text in between', () => {
      const text = '[ProjectA] This is a test message [ProjectB]';
      expect(extractProjects(text)).toEqual(['ProjectA', 'ProjectB']);
    });

    test('should return an empty array if no project is found', () => {
      const text = 'This is a test message';
      expect(extractProjects(text)).toEqual([]);
    });

    test('should handle empty string', () => {
      const text = '';
      expect(extractProjects(text)).toEqual([]);
    });

    test('should handle null or undefined', () => {
      expect(extractProjects(null)).toEqual([]);
      expect(extractProjects(undefined)).toEqual([]);
    });
  });

  describe('hasProjectTag', () => {
    test('should return true if a project tag is present', () => {
      const text = '[ProjectA] This is a test message';
      expect(hasProjectTag(text)).toBe(true);
    });

    test('should return true if multiple project tags are present', () => {
      const text = '[ProjectA] [ProjectB] This is a test message';
      expect(hasProjectTag(text)).toBe(true);
    });

    test('should return false if no project tag is present', () => {
      const text = 'This is a test message';
      expect(hasProjectTag(text)).toBe(false);
    });
  });

  describe('normalizeProjectName', () => {
    test('should trim whitespace', () => {
      const projectName = '  ProjectA  ';
      expect(normalizeProjectName(projectName)).toBe('ProjectA');
    });

    test('should remove extra spaces', () => {
      const projectName = 'Project  A';
      expect(normalizeProjectName(projectName)).toBe('Project A');
    });

    test('should handle empty string', () => {
      const projectName = '';
      expect(normalizeProjectName(projectName)).toBe('');
    });
  });
});
