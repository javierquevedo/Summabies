This pull request addresses a limitation in the message processing logic that prevented the app from correctly handling multiple project tags in a single Slack message. Previously, the system would only recognize the first project tag it encountered, ignoring any subsequent tags in the same message. This update ensures that all project tags are extracted and processed, allowing users to reference multiple projects in a single message.

**Changes Made**

- **Enhanced Project Extraction:** The `extractProject` function in `src/utils/projectExtractor.js` has been replaced with a more robust `extractProjects` function. This new implementation uses a global regular expression to identify and extract all occurrences of project tags (e.g., `[ProjectA]`, `[ProjectB]`) within a message, returning an array of all found projects.

- **Comprehensive Message Handling:** The message handler in `src/services/slackBot.js` has been updated to iterate through the array of projects returned by `extractProjects`. It now stores the message for each project, ensuring that a single message referencing multiple projects is correctly logged for all of them.

- **Improved Testing:** A new test file, `__tests__/utils/projectExtractor.test.js`, has been created to validate the new project extraction logic. These tests cover various scenarios, including single and multiple project tags, messages with no tags, and different message formats, to ensure the system behaves as expected.

By resolving this issue, the app now offers a more flexible and user-friendly experience, allowing for more complex and efficient communication within Slack. This change improves the app's ability to track and summarize project discussions, making it a more powerful tool for project management.