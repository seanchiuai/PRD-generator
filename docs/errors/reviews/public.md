# Code Review: Public

This file contains 2 review issues for public files.

============================================================================

File: public/fonts/mona-sans.css
Line: 23 to 40
Type: potential_issue

Comment:
Add generic font-family fallback for resilience.

All utility classes should include a generic font-family fallback (e.g., sans-serif) to ensure text remains readable if Mona Sans fails to load from the CDN.



Apply this diff to add fallbacks to all utility classes:

 / Mona Sans Utility Classes for Different Variations /
-.font-mona-extralight { font-family: 'Mona Sans'; font-variation-settings: 'wght' 200, 'wdth' 100; }
-.font-mona-light { font-family: 'Mona Sans'; font-variation-settings: 'wght' 300, 'wdth' 100; }
-.font-mona-regular { font-family: 'Mona Sans'; font-variation-settings: 'wght' 400, 'wdth' 100; }
-.font-mona-medium { font-family: 'Mona Sans'; font-variation-settings: 'wght' 500, 'wdth' 100; }
-.font-mona-semibold { font-family: 'Mona Sans'; font-variation-settings: 'wght' 600, 'wdth' 100; }
-.font-mona-bold { font-family: 'Mona Sans'; font-variation-settings: 'wght' 700, 'wdth' 100; }
-.font-mona-extrabold { font-family: 'Mona Sans'; font-variation-settings: 'wght' 800, 'wdth' 100; }
-.font-mona-black { font-family: 'Mona Sans'; font-variation-settings: 'wght' 900, 'wdth' 100; }
+.font-mona-extralight { font-family: 'Mona Sans', sans-serif; font-variation-settings: 'wght' 200, 'wdth' 100; }
+.font-mona-light { font-family: 'Mona Sans', sans-serif; font-variation-settings: 'wght' 300, 'wdth' 100; }
+.font-mona-regular { font-family: 'Mona Sans', sans-serif; font-variation-settings: 'wght' 400, 'wdth' 100; }
+.font-mona-medium { font-family: 'Mona Sans', sans-serif; font-variation-settings: 'wght' 500, 'wdth' 100; }
+.font-mona-semibold { font-family: 'Mona Sans', sans-serif; font-variation-settings: 'wght' 600, 'wdth' 100; }
+.font-mona-bold { font-family: 'Mona Sans', sans-serif; font-variation-settings: 'wght' 700, 'wdth' 100; }
+.font-mona-extrabold { font-family: 'Mona Sans', sans-serif; font-variation-settings: 'wght' 800, 'wdth' 100; }
+.font-mona-black { font-family: 'Mona Sans', sans-serif; font-variation-settings: 'wght' 900, 'wdth' 100; }
 
 / Width variations /
-.font-mona-narrow { font-family: 'Mona Sans'; font-variation-settings: 'wght' 400, 'wdth' 75; }
-.font-mona-wide { font-family: 'Mona Sans'; font-variation-settings: 'wght' 400, 'wdth' 125; }
+.font-mona-narrow { font-family: 'Mona Sans', sans-serif; font-variation-settings: 'wght' 400, 'wdth' 75; }
+.font-mona-wide { font-family: 'Mona Sans', sans-serif; font-variation-settings: 'wght' 400, 'wdth' 125; }
 
 / Combined variations for specific use cases /
-.font-mona-heading { font-family: 'Mona Sans'; font-variation-settings: 'wght' 700, 'wdth' 105; }
-.font-mona-subheading { font-family: 'Mona Sans'; font-variation-settings: 'wght' 600, 'wdth' 102; }
-.font-mona-caption { font-family: 'Mona Sans'; font-variation-settings: 'wght' 500, 'wdth' 95; }
-.font-mona-display { font-family: 'Mona Sans'; font-variation-settings: 'wght' 800, 'wdth' 110; }
+.font-mona-heading { font-family: 'Mona Sans', sans-serif; font-variation-settings: 'wght' 700, 'wdth' 105; }
+.font-mona-subheading { font-family: 'Mona Sans', sans-serif; font-variation-settings: 'wght' 600, 'wdth' 102; }
+.font-mona-caption { font-family: 'Mona Sans', sans-serif; font-variation-settings: 'wght' 500, 'wdth' 95; }
+.font-mona-display { font-family: 'Mona Sans', sans-serif; font-variation-settings: 'wght' 800, 'wdth' 110; }

Prompt for AI Agent:
In public/fonts/mona-sans.css around lines 23 to 40, each utility class sets font-family to 'Mona Sans' but lacks a generic fallback; update every rule to include a fallback list such as 'Mona Sans', sans-serif (or a broader fallback stack like 'Mona Sans', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif) so text remains readable if the font fails to load—apply this change to all classes in the block (extralight through display).



============================================================================

File: public/fonts/mona-sans.css
Line: 2 to 10
Type: nitpick

Comment:
Consider self-hosting fonts instead of using CDN.

Loading fonts from a CDN (jsdelivr) introduces external dependencies that could impact reliability and performance. Consider:

1. Performance: Self-hosted fonts eliminate DNS lookup and can leverage HTTP/2 multiplexing
2. Privacy: Some regions or users may block CDN requests
3. Reliability: No dependency on external service availability



To self-host:
1. Download the font files from the GitHub Mona Sans repository
2. Place them in public/fonts/
3. Update the src URLs to relative paths:

 @font-face {
   font-family: 'Mona Sans';
-  src: url('https://cdn.jsdelivr.net/npm/@github/mona-sans@1.0.0/fonts/variable/Mona-Sans.woff2') format('woff2-variations');
+  src: url('/fonts/Mona-Sans.woff2') format('woff2-variations');
   font-weight: 200 900;

Prompt for AI Agent:
In public/fonts/mona-sans.css around lines 2 to 10, the stylesheet currently references Mona Sans via jsdelivr; replace that external CDN dependency by downloading the required font files (variable .woff2 and any fallback formats) into the repo under public/fonts/, update the src URLs to relative paths (e.g., ./fonts/…) preserving the existing font-face properties (font-weight range, font-stretch, font-display, font-style and font-variation-settings), and verify the paths build correctly and are served by the static server; ensure you check licensing and include any required font-license file alongside the assets.



