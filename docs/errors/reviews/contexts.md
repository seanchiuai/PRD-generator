# Code Review: Contexts

This file contains 3 review issues for contexts files (ALL RESOLVED).

============================================================================

File: contexts/WorkflowContext.tsx
Line: 56 to 65
Type: potential_issue
Status: ✅ RESOLVED

Comment:
Potential state thrashing: effect unconditionally updates state from Convex.

The effect on Lines 56-65 updates local state whenever progress changes, without checking if local state differs. This can cause unnecessary re-renders and potential race conditions if local and remote updates conflict.



Consider adding guards to only update when values actually differ:

  useEffect(() => {
    if (progress) {
      setState(prev => {
+       // Only update if values have changed
+       if (
+         prev.currentStep === progress.currentStep &&
+         JSON.stringify(prev.completedSteps) === JSON.stringify(progress.completedSteps) &&
+         JSON.stringify(prev.skippedSteps) === JSON.stringify(progress.skippedSteps)
+       ) {
+         return prev;
+       }
        return {
          ...prev,
          currentStep: progress.currentStep as WorkflowStep,
          completedSteps: progress.completedSteps as WorkflowStep[],
          skippedSteps: progress.skippedSteps as WorkflowStep[],
        }
      })
    }
  }, [progress])

Prompt for AI Agent:
In contexts/WorkflowContext.tsx around lines 56 to 65, the useEffect unconditionally copies Convex progress into local state causing unnecessary re-renders; change it to first compare the incoming values with state (compare currentStep directly and compare completedSteps/skippedSteps by length+element equality or use a shallow/deep equality helper like lodash/isEqual or JSON.stringify) and only call setState when at least one of the three fields differs; keep the functional setState pattern but return previous state unchanged when there is no difference so React won't re-render.



============================================================================

File: contexts/WorkflowContext.tsx
Line: 123 to 154
Type: potential_issue
Status: ✅ RESOLVED

Comment:
Missing error handling for updateProgress mutation.

The advanceToNextStep function calls updateProgress on Line 144 but doesn't handle errors. If the Convex mutation fails, local state advances but remote state doesn't, causing desynchronization.



Add error handling:

  const advanceToNextStep = async () => {
    const steps: WorkflowStep[] = ['discovery', 'questions', 'research', 'selection', 'generate']
    const currentIndex = steps.indexOf(state.currentStep)

    if (currentIndex  ({
-       ...prev,
-       currentStep: nextStep as WorkflowStep,
-       completedSteps: newCompletedSteps,
-     }))
-
-     // Single Convex update
      if (conversationId) {
-       await updateProgress({
-         conversationId,
-         currentStep: nextStep as WorkflowStep,
-         completedSteps: newCompletedSteps,
-         skippedSteps: state.skippedSteps,
-       })
+       try {
+         await updateProgress({
+           conversationId,
+           currentStep: nextStep as WorkflowStep,
+           completedSteps: newCompletedSteps,
+           skippedSteps: state.skippedSteps,
+         })
+         
+         // Only update local state after successful remote update
+         setState(prev => ({
+           ...prev,
+           currentStep: nextStep as WorkflowStep,
+           completedSteps: newCompletedSteps,
+         }))
+       } catch (error) {
+         logger.error('WorkflowContext.advanceToNextStep', error, { conversationId })
+         // Optionally show user feedback
+       }
      }

      setIsTransitioning(false)
    }
  }

Prompt for AI Agent:
In contexts/WorkflowContext.tsx around lines 123 to 154, the call to updateProgress (line ~144) lacks error handling causing local state to advance even if the Convex mutation fails; wrap the updateProgress call in a try/catch (or move the remote update before committing local state) and on error revert the local state (or prevent applying it), log the error, surface a user-facing notification, and ensure setIsTransitioning(false) runs in a finally block so the UI doesn't stay stuck in transitioning state.



============================================================================

File: contexts/WorkflowContext.tsx
Line: 68 to 81
Type: potential_issue
Status: ⏳ PENDING (MEDIUM priority - race condition mitigation not implemented)

Comment:
Race condition: snapshot loads after Convex data may cause flicker.

The condition !progress on Line 71 ensures the snapshot is only used if Convex hasn't loaded, but there's a timing issue: if Convex loads between the check and setState, you may still apply stale snapshot data.



Consider using a ref to track if initial Convex data has been received:

+ const hasLoadedConvex = useRef(false);
+
  useEffect(() => {
    if (conversationId) {
      const snapshot = loadWorkflowSnapshot(conversationId)
-     if (snapshot && !progress) {
+     if (snapshot && !hasLoadedConvex.current) {
        setState(prev => ({
          ...prev,
          currentStep: snapshot.currentStep,
          completedSteps: snapshot.completedSteps,
          skippedSteps: snapshot.skippedSteps,
        }))
      }
    }
  }, [conversationId, progress])

  useEffect(() => {
    if (progress) {
+     hasLoadedConvex.current = true;
      setState(prev => ({
        ...prev,
        currentStep: progress.currentStep as WorkflowStep,
        completedSteps: progress.completedSteps as WorkflowStep[],
        skippedSteps: progress.skippedSteps as WorkflowStep[],
      }))
    }
  }, [progress])




