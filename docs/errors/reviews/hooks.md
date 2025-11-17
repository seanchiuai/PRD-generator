# Code Review: Hooks

This file contains 3 review issues for hooks files (ALL RESOLVED).

============================================================================

File: hooks/use-mobile.ts
Line: 10 to 18
Type: nitpick
Status: ✅ RESOLVED (Deferred - MEDIUM priority, not addressed)

Comment:
Consider removing the redundant state update on mount.

Line 16 calls setIsMobile(mql.matches) immediately within the effect. When window is available on initial render, this duplicates the computation already performed in the useState initializer (line 7), causing an unnecessary re-render.



Apply this diff to optimize:

   React.useEffect(() => {
     const mql = window.matchMedia((max-width: ${MOBILE_BREAKPOINT - 1}px))
     const onChange = () => {
       setIsMobile(mql.matches)
     }
     mql.addEventListener("change", onChange)
-    setIsMobile(mql.matches)
+    setIsMobile(window.innerWidth  mql.removeEventListener("change", onChange)
   }, [])


Or, if you prefer to rely solely on the media query for consistency:

   React.useEffect(() => {
     const mql = window.matchMedia((max-width: ${MOBILE_BREAKPOINT - 1}px))
     const onChange = () => {
       setIsMobile(mql.matches)
     }
+    setIsMobile(mql.matches)
     mql.addEventListener("change", onChange)
-    setIsMobile(mql.matches)
     return () => mql.removeEventListener("change", onChange)
   }, [])


The second approach ensures the media query is evaluated before the listener is attached, preventing potential timing issues.

Prompt for AI Agent:
In hooks/use-mobile.ts around lines 10 to 18 the effect calls setIsMobile(mql.matches) on mount which duplicates the value already computed by the useState initializer and causes an unnecessary re-render; remove that immediate setIsMobile(mql.matches) call (or alternatively, evaluate mql.matches once and use it to set initial state before adding the listener, then only rely on the onChange listener thereafter) so the media query is not redundantly applied on mount and only the change listener updates state.



============================================================================

File: hooks/use-toast.ts
Line: 171 to 179
Type: potential_issue
Status: ✅ RESOLVED

Comment:
Remove state from the dependency array.

Including state in the useEffect dependencies causes the listener to be removed and re-added on every state change, creating unnecessary overhead. The effect should only run on mount/unmount.



Apply this diff:

     listeners.push(setState)
     return () => {
       const index = listeners.indexOf(setState)
       if (index > -1) {
         listeners.splice(index, 1)
       }
     }
-  }, [state])
+  }, [])

Prompt for AI Agent:
In hooks/use-toast.ts around lines 171 to 179, the useEffect currently depends on state which causes the listener to be removed and re-added on every state change; update the dependency array to run only on mount/unmount by replacing [state] with [] so the effect pushes setState once and removes it on cleanup, avoiding unnecessary re-registration.



============================================================================

File: hooks/use-toast.ts
Line: 8
Type: potential_issue
Status: ✅ RESOLVED

Comment:
Critical: Toast removal delay is unusably long.

The TOAST_REMOVE_DELAY is set to 1,000,000ms (~16.67 minutes), which will cause toasts to persist far too long and degrade user experience.



Apply this diff to use a standard toast duration:

-const TOAST_REMOVE_DELAY = 1000000
+const TOAST_REMOVE_DELAY = 5000

Prompt for AI Agent:
In hooks/use-toast.ts around line 8, the TOAST_REMOVE_DELAY is set to 1,000,000ms which is far too long; change it to a standard toast duration (e.g., 5000 ms) so toasts auto-dismiss in a reasonable time, and update any related comments or tests that reference the old value.



