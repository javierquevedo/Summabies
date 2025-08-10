const MessageStore = require('../../src/services/messageStore');

// Mock the logger to avoid console output during tests
jest.mock('../../src/utils/logger', () => ({
  logReceived: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

describe('MessageStore', () => {
  let messageStore;

  beforeEach(() => {
    // Create a fresh instance before each test
    messageStore = new MessageStore();
  });

  afterEach(() => {
    // Clean up after each test
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should initialize with empty project messages', () => {
      expect(messageStore.projectMessages).toEqual({});
    });
  });

  describe('storeMessage', () => {
    test('should store a message for a new project', () => {
      const project = 'TestProject';
      const message = {
        user: 'U1234567890',
        text: 'Test message',
        ts: '1234567890.123'
      };

      messageStore.storeMessage(project, message);

      expect(messageStore.projectMessages[project]).toHaveLength(1);
      expect(messageStore.projectMessages[project][0]).toEqual({
        user: message.user,
        text: message.text,
        ts: message.ts
      });
    });

    test('should store multiple messages for the same project', () => {
      const project = 'TestProject';
      const message1 = {
        user: 'U1234567890',
        text: 'First message',
        ts: '1234567890.123'
      };
      const message2 = {
        user: 'U0987654321',
        text: 'Second message',
        ts: '1234567890.456'
      };

      messageStore.storeMessage(project, message1);
      messageStore.storeMessage(project, message2);

      expect(messageStore.projectMessages[project]).toHaveLength(2);
      expect(messageStore.projectMessages[project][0]).toEqual({
        user: message1.user,
        text: message1.text,
        ts: message1.ts
      });
      expect(messageStore.projectMessages[project][1]).toEqual({
        user: message2.user,
        text: message2.text,
        ts: message2.ts
      });
    });

    test('should store messages for different projects independently', () => {
      const project1 = 'ProjectA';
      const project2 = 'ProjectB';
      const message1 = {
        user: 'U1234567890',
        text: 'Project A message',
        ts: '1234567890.123'
      };
      const message2 = {
        user: 'U0987654321',
        text: 'Project B message',
        ts: '1234567890.456'
      };

      messageStore.storeMessage(project1, message1);
      messageStore.storeMessage(project2, message2);

      expect(messageStore.projectMessages[project1]).toHaveLength(1);
      expect(messageStore.projectMessages[project2]).toHaveLength(1);
      expect(messageStore.projectMessages[project1][0].text).toBe('Project A message');
      expect(messageStore.projectMessages[project2][0].text).toBe('Project B message');
    });

    test('should handle empty or null project names', () => {
      const message = {
        user: 'U1234567890',
        text: 'Test message',
        ts: '1234567890.123'
      };

      // These should not throw errors
      expect(() => messageStore.storeMessage('', message)).not.toThrow();
      expect(() => messageStore.storeMessage(null, message)).not.toThrow();
      expect(() => messageStore.storeMessage(undefined, message)).not.toThrow();
    });

    test('should handle malformed message objects gracefully', () => {
      const project = 'TestProject';
      
      // Missing properties should not cause errors
      expect(() => messageStore.storeMessage(project, {})).not.toThrow();
      expect(() => messageStore.storeMessage(project, { user: 'U123' })).not.toThrow();
      expect(() => messageStore.storeMessage(project, { text: 'Hello' })).not.toThrow();
    });
  });

  describe('getProjectMessages', () => {
    test('should return empty array for non-existent project', () => {
      const result = messageStore.getProjectMessages('NonExistentProject');
      expect(result).toEqual([]);
    });

    test('should return all messages for existing project', () => {
      const project = 'TestProject';
      const messages = [
        { user: 'U1234567890', text: 'Message 1', ts: '1234567890.123' },
        { user: 'U0987654321', text: 'Message 2', ts: '1234567890.456' }
      ];

      messages.forEach(msg => messageStore.storeMessage(project, msg));

      const result = messageStore.getProjectMessages(project);
      expect(result).toHaveLength(2);
      expect(result).toEqual(expect.arrayContaining([
        { user: 'U1234567890', text: 'Message 1', ts: '1234567890.123' },
        { user: 'U0987654321', text: 'Message 2', ts: '1234567890.456' }
      ]));
    });

    test('should return a copy, not the original array', () => {
      const project = 'TestProject';
      const message = { user: 'U1234567890', text: 'Test message', ts: '1234567890.123' };
      
      messageStore.storeMessage(project, message);
      const result = messageStore.getProjectMessages(project);
      
      // Modifying the result should not affect the original
      result.push({ user: 'U999', text: 'Modified', ts: '9999999999.999' });
      
      expect(messageStore.getProjectMessages(project)).toHaveLength(1);
      expect(result).toHaveLength(2);
    });
  });

  describe('hasMessages', () => {
    test('should return false for non-existent project', () => {
      expect(messageStore.hasMessages('NonExistentProject')).toBe(false);
    });

    test('should return false for project with no messages', () => {
      const project = 'EmptyProject';
      messageStore.projectMessages[project] = [];
      
      expect(messageStore.hasMessages(project)).toBe(false);
    });

    test('should return true for project with messages', () => {
      const project = 'TestProject';
      const message = { user: 'U1234567890', text: 'Test message', ts: '1234567890.123' };
      
      messageStore.storeMessage(project, message);
      
      expect(messageStore.hasMessages(project)).toBe(true);
    });
  });

  describe('getProjectsWithMessages', () => {
    test('should return empty array when no projects have messages', () => {
      expect(messageStore.getProjectsWithMessages()).toEqual([]);
    });

    test('should return only projects that have messages', () => {
      const project1 = 'ProjectA';
      const project2 = 'ProjectB';
      const project3 = 'ProjectC';
      
      // Project A has messages
      messageStore.storeMessage(project1, { user: 'U123', text: 'Message', ts: '1234567890.123' });
      
      // Project B has messages
      messageStore.storeMessage(project2, { user: 'U456', text: 'Message', ts: '1234567890.456' });
      
      // Project C has no messages (empty array)
      messageStore.projectMessages[project3] = [];
      
      const result = messageStore.getProjectsWithMessages();
      
      expect(result).toContain(project1);
      expect(result).toContain(project2);
      expect(result).not.toContain(project3);
      expect(result).toHaveLength(2);
    });

    test('should return projects in alphabetical order', () => {
      const project1 = 'Zebra';
      const project2 = 'Alpha';
      const project3 = 'Beta';
      
      messageStore.storeMessage(project1, { user: 'U123', text: 'Message', ts: '1234567890.123' });
      messageStore.storeMessage(project2, { user: 'U456', text: 'Message', ts: '1234567890.456' });
      messageStore.storeMessage(project3, { user: 'U789', text: 'Message', ts: '1234567890.789' });
      
      const result = messageStore.getProjectsWithMessages();
      
      expect(result).toEqual(['Alpha', 'Beta', 'Zebra']);
    });
  });

  describe('clearProjectMessages', () => {
    test('should clear messages for existing project', () => {
      const project = 'TestProject';
      const message = { user: 'U1234567890', text: 'Test message', ts: '1234567890.123' };
      
      messageStore.storeMessage(project, message);
      expect(messageStore.hasMessages(project)).toBe(true);
      
      messageStore.clearProjectMessages(project);
      expect(messageStore.hasMessages(project)).toBe(false);
      expect(messageStore.getProjectMessages(project)).toEqual([]);
    });

    test('should handle clearing non-existent project gracefully', () => {
      expect(() => messageStore.clearProjectMessages('NonExistentProject')).not.toThrow();
    });

    test('should maintain project key after clearing', () => {
      const project = 'TestProject';
      const message = { user: 'U1234567890', text: 'Test message', ts: '1234567890.123' };
      
      messageStore.storeMessage(project, message);
      messageStore.clearProjectMessages(project);
      
      expect(messageStore.projectMessages).toHaveProperty(project);
      expect(messageStore.projectMessages[project]).toEqual([]);
    });
  });

  describe('getMessageCount', () => {
    test('should return 0 for non-existent project', () => {
      expect(messageStore.getMessageCount('NonExistentProject')).toBe(0);
    });

    test('should return 0 for project with no messages', () => {
      const project = 'EmptyProject';
      messageStore.projectMessages[project] = [];
      
      expect(messageStore.getMessageCount(project)).toBe(0);
    });

    test('should return correct count for project with messages', () => {
      const project = 'TestProject';
      const messages = [
        { user: 'U1234567890', text: 'Message 1', ts: '1234567890.123' },
        { user: 'U0987654321', text: 'Message 2', ts: '1234567890.456' },
        { user: 'U1111111111', text: 'Message 3', ts: '1234567890.789' }
      ];

      messages.forEach(msg => messageStore.storeMessage(project, msg));
      
      expect(messageStore.getMessageCount(project)).toBe(3);
    });
  });

  describe('getAllData', () => {
    test('should return copy of all data', () => {
      const project1 = 'ProjectA';
      const project2 = 'ProjectB';
      
      messageStore.storeMessage(project1, { user: 'U123', text: 'Message A', ts: '1234567890.123' });
      messageStore.storeMessage(project2, { user: 'U456', text: 'Message B', ts: '1234567890.456' });
      
      const allData = messageStore.getAllData();
      
      expect(allData).toEqual(messageStore.projectMessages);
      expect(allData).not.toBe(messageStore.projectMessages); // Should be a copy
      
      // Modifying the copy should not affect the original
      allData[project1] = [];
      expect(messageStore.hasMessages(project1)).toBe(true);
    });

    test('should return empty object when no data exists', () => {
      expect(messageStore.getAllData()).toEqual({});
    });
  });

  describe('clearAll', () => {
    test('should clear all project messages', () => {
      const project1 = 'ProjectA';
      const project2 = 'ProjectB';
      
      messageStore.storeMessage(project1, { user: 'U123', text: 'Message A', ts: '1234567890.123' });
      messageStore.storeMessage(project2, { user: 'U456', text: 'Message B', ts: '1234567890.456' });
      
      expect(messageStore.getProjectsWithMessages()).toHaveLength(2);
      
      messageStore.clearAll();
      
      expect(messageStore.getProjectsWithMessages()).toHaveLength(0);
      expect(messageStore.projectMessages).toEqual({});
    });

    test('should work when no data exists', () => {
      expect(() => messageStore.clearAll()).not.toThrow();
      expect(messageStore.projectMessages).toEqual({});
    });
  });

  describe('Integration scenarios', () => {
    test('should handle complete workflow: store, retrieve, clear, verify', () => {
      const project = 'WorkflowProject';
      
      // 1. Store messages
      const message1 = { user: 'U123', text: 'First message', ts: '1234567890.123' };
      const message2 = { user: 'U456', text: 'Second message', ts: '1234567890.456' };
      
      messageStore.storeMessage(project, message1);
      messageStore.storeMessage(project, message2);
      
      // 2. Verify storage
      expect(messageStore.hasMessages(project)).toBe(true);
      expect(messageStore.getMessageCount(project)).toBe(2);
      expect(messageStore.getProjectMessages(project)).toHaveLength(2);
      
      // 3. Clear messages
      messageStore.clearProjectMessages(project);
      
      // 4. Verify clearing
      expect(messageStore.hasMessages(project)).toBe(false);
      expect(messageStore.getMessageCount(project)).toBe(0);
      expect(messageStore.getProjectMessages(project)).toEqual([]);
      
      // 5. Verify project still exists in structure
      expect(messageStore.projectMessages).toHaveProperty(project);
    });

    test('should handle multiple projects with different message counts', () => {
      const projects = ['ProjectA', 'ProjectB', 'ProjectC'];
      const messageCounts = [3, 1, 0]; // ProjectC intentionally has 0 messages
      
      // Setup projects with different message counts
      projects.forEach((project, index) => {
        for (let i = 0; i < messageCounts[index]; i++) {
          messageStore.storeMessage(project, {
            user: `U${i}`,
            text: `Message ${i + 1} for ${project}`,
            ts: `1234567890.${i}`
          });
        }
      });
      
      // Verify counts
      expect(messageStore.getMessageCount('ProjectA')).toBe(3);
      expect(messageStore.getMessageCount('ProjectB')).toBe(1);
      expect(messageStore.getMessageCount('ProjectC')).toBe(0);
      
      // Verify projects with messages
      const projectsWithMessages = messageStore.getProjectsWithMessages();
      expect(projectsWithMessages).toContain('ProjectA');
      expect(projectsWithMessages).toContain('ProjectB');
      expect(projectsWithMessages).not.toContain('ProjectC');
      expect(projectsWithMessages).toHaveLength(2);
    });
  });
});
