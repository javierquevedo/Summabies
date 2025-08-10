const { extractProject, hasProjectTag, normalizeProjectName } = require('../../src/utils/projectExtractor');

describe('ProjectExtractor', () => {
  describe('extractProject', () => {
    test('should extract project name from valid format', () => {
      const text = '[Frontend] Working on dashboard components';
      const result = extractProject(text);
      expect(result).toBe('Frontend');
    });

    test('should extract project name with spaces', () => {
      const text = '[Mobile App] Implementing push notifications';
      const result = extractProject(text);
      expect(result).toBe('Mobile App');
    });

    test('should extract project name with special characters', () => {
      const text = '[API-v2] Adding authentication endpoints';
      const result = extractProject(text);
      expect(result).toBe('API-v2');
    });

    test('should extract project name with numbers', () => {
      const text = '[Project-2024] Planning Q1 goals';
      const result = extractProject(text);
      expect(result).toBe('Project-2024');
    });

    test('should return null for text without project tag', () => {
      const text = 'Just a regular message without project tag';
      const result = extractProject(text);
      expect(result).toBeNull();
    });

    test('should return null for text with project tag in middle', () => {
      const text = 'Working on [Backend] features today';
      const result = extractProject(text);
      expect(result).toBeNull();
    });

    test('should return null for text with project tag at end', () => {
      const text = 'Completed the task [Frontend]';
      const result = extractProject(text);
      expect(result).toBeNull();
    });

    test('should return null for empty string', () => {
      const text = '';
      const result = extractProject(text);
      expect(result).toBeNull();
    });

    test('should return null for null input', () => {
      const text = null;
      const result = extractProject(text);
      expect(result).toBeNull();
    });

    test('should return null for undefined input', () => {
      const text = undefined;
      const result = extractProject(text);
      expect(result).toBeNull();
    });

    test('should return null for non-string input', () => {
      const text = 123;
      const result = extractProject(text);
      expect(result).toBeNull();
    });

    test('should handle project name with only brackets', () => {
      const text = '[] Empty project name';
      const result = extractProject(text);
      expect(result).toBeNull();
    });

    test('should handle project name with only spaces', () => {
      const text = '[   ] Project with spaces only';
      const result = extractProject(text);
      expect(result).toBeNull();
    });

    test('should extract project name with trailing spaces', () => {
      const text = '[  Backend  ] Database optimization';
      const result = extractProject(text);
      expect(result).toBe('  Backend  ');
    });
  });

  describe('hasProjectTag', () => {
    test('should return true for text with valid project tag', () => {
      const text = '[Design] Creating mockups';
      const result = hasProjectTag(text);
      expect(result).toBe(true);
    });

    test('should return false for text without project tag', () => {
      const text = 'Regular message without brackets';
      const result = hasProjectTag(text);
      expect(result).toBe(false);
    });

    test('should return false for empty string', () => {
      const text = '';
      const result = hasProjectTag(text);
      expect(result).toBe(false);
    });

    test('should return false for null input', () => {
      const text = null;
      const result = hasProjectTag(text);
      expect(result).toBe(false);
    });

    test('should return false for undefined input', () => {
      const text = undefined;
      const result = hasProjectTag(text);
      expect(result).toBe(false);
    });

    test('should return false for non-string input', () => {
      const text = 123;
      const result = hasProjectTag(text);
      expect(result).toBe(false);
    });
  });

  describe('normalizeProjectName', () => {
    test('should normalize project name with extra spaces', () => {
      const projectName = '  Frontend  ';
      const result = normalizeProjectName(projectName);
      expect(result).toBe('Frontend');
    });

    test('should normalize project name with multiple spaces', () => {
      const projectName = 'Mobile    App';
      const result = normalizeProjectName(projectName);
      expect(result).toBe('Mobile App');
    });

    test('should handle empty string', () => {
      const projectName = '';
      const result = normalizeProjectName(projectName);
      expect(result).toBe('');
    });

    test('should handle null input', () => {
      const projectName = null;
      const result = normalizeProjectName(projectName);
      expect(result).toBe('');
    });

    test('should handle undefined input', () => {
      const projectName = undefined;
      const result = normalizeProjectName(projectName);
      expect(result).toBe('');
    });

    test('should handle project name with tabs and newlines', () => {
      const projectName = '\tBackend\nAPI\t';
      const result = normalizeProjectName(projectName);
      expect(result).toBe('Backend API');
    });

    test('should preserve single spaces between words', () => {
      const projectName = 'Data Science';
      const result = normalizeProjectName(projectName);
      expect(result).toBe('Data Science');
    });

    test('should handle project name with no spaces', () => {
      const projectName = 'Frontend';
      const result = normalizeProjectName(projectName);
      expect(result).toBe('Frontend');
    });
  });

  describe('Integration scenarios', () => {
    test('should work together for typical use case', () => {
      const text = '[  Backend API  ] Implementing authentication';
      
      const extracted = extractProject(text);
      const hasTag = hasProjectTag(text);
      const normalized = normalizeProjectName(extracted);
      
      expect(extracted).toBe('  Backend API  ');
      expect(hasTag).toBe(true);
      expect(normalized).toBe('Backend API');
    });

    test('should handle edge case with empty brackets', () => {
      const text = '[] Empty project';
      
      const extracted = extractProject(text);
      const hasTag = hasProjectTag(text);
      const normalized = normalizeProjectName(extracted);
      
      expect(extracted).toBeNull();
      expect(hasTag).toBe(false);
      expect(normalized).toBe('');
    });
  });
});
