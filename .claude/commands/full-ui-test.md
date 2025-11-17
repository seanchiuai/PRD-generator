---
description: Test the entire user-flow and all functionalities for errors.
allowed-tools: Bash, Edit
argument-hint: []
---

# Command: /full-ui-test

run `npm run dev` and use playwright to test the app. When log-in is needed, STOP and ask the human (me) to do it.
After I said I'm done, continue to test all functionalities of the app and fix any errors that come up. Do the minimal just enough to test all functionalities.
After test is complete, list all any errors found and md files created. Store groups of errors (for different functionalities) in the `/docs/errors` folder as seperate files.

Notes:
- If you encounter an action you cannot do, STOP and ask the human (me) to do it. After I said I'm done, continue testing.
- Do not create any error logs (not even a summary) if no errors are found.
- Do not close the playwright testing window after completion.

