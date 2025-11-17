 ============================================================================
    File: docs/icon-usage.md
    Line: 7 to 10
    Type: potential_issue

    Comment:
    Add blank line before code block.

    Markdown linting requires blank lines around fenced code blocks. Line 7 should have a blank line before the
    code block starts.



     Installation:
    +
     bash
     npm install lucide-react

    Prompt for AI Agent:
    In docs/icon-usage.md around lines 7 to 10, there is a fenced code block starting on line 7 that is not
    preceded by a blank line which violates Markdown linting; add a single blank line immediately before the
    triple-backtick line so the code fence is separated from the preceding text, then save and re-run the linter.



    ============================================================================
    File: docs/icon-usage.md
    Line: 521
    Type: potential_issue

    Comment:
    Format bare URL as markdown link.

    Bare URLs should be wrapped in markdown link syntax for consistency and proper rendering.



    -https://lucide.dev/icons/
    +https://lucide.dev/icons/

    Prompt for AI Agent:
    In docs/icon-usage.md around line 521, a bare URL "https://lucide.dev/icons/" is used; replace it with markdown
     link syntax by wrapping the URL in text (e.g., use a descriptive link label like Lucide icons) so the link
    renders consistently and follows project formatting.



    ============================================================================
    File: public/fonts/mona-sans.css
    Line: 22 to 40
    Type: nitpick

    Comment:
    Consider using CSS custom properties to reduce duplication.

    The utility classes repeat font-family and structured font-variation-settings extensively. Using CSS custom
    properties would improve maintainability and reduce the file size.


    Example using CSS custom properties:

    :root {
      --mona-sans-family: 'Mona Sans';
    }

    .font-mona-extralight { font-family: var(--mona-sans-family); font-variation-settings: 'wght' 200, 'wdth' 100;
    }
    .font-mona-light { font-family: var(--mona-sans-family); font-variation-settings: 'wght' 300, 'wdth' 100; }
    / ... etc /


    Alternatively, if using a CSS preprocessor (SCSS/Less), a mixin would be even cleaner:

    @mixin mona-variation($weight, $width) {
      font-family: 'Mona Sans';
      font-variation-settings: 'wght' #{$weight}, 'wdth' #{$width};
    }

    .font-mona-extralight { @include mona-variation(200, 100); }
    .font-mona-light { @include mona-variation(300, 100); }
    / ... etc /

    Prompt for AI Agent:
    public/fonts/mona-sans.css lines 22-40: the utility classes repeatedly redeclare the same font-family and
    similar font-variation-settings; update the file to define CSS custom properties (e.g. --mona-sans-family and
    either per-class --mona-wght/--mona-wdth or a combined --mona-variation) at :root and then refactor each
    .font-mona-* class to use font-family: var(--mona-sans-family) and font-variation-settings:
    var(--mona-variation) or composed from var(--mona-wght) and var(--mona-wdth), so common values are centralized
    and duplication removed.



    ============================================================================
    File: docs/icon-usage.md
    Line: 12
    Type: potential_issue

    Comment:
    Format bare URL as markdown link.

    Bare URLs should be wrapped in markdown link syntax for consistency and proper rendering.



    -Documentation: https://lucide.dev/
    +Documentation: lucide.dev

    Prompt for AI Agent:
    In docs/icon-usage.md around line 12, the bare URL "https://lucide.dev/" is used; replace it with a markdown
    link using descriptive link text (e.g., "Lucide") and the URL as the link target so the reference renders
    consistently and accessibly in docs.



    ============================================================================
    File: public/fonts/mona-sans.css
    Line: 23 to 34
    Type: potential_issue

    Comment:
    Add font-family: 'Mona Sans'; to utility classes.

    The utility classes define font-variation-settings but lack the explicit font-family declaration. Without it,
    the variation settings will not be applied to Mona Sans—they'll apply to the element's inherited font-family,
    rendering these classes ineffective.

    Apply this diff to fix all utility classes:

    -.font-mona-extralight { font-variation-settings: 'wght' 200, 'wdth' 100; }
    -.font-mona-light { font-variation-settings: 'wght' 300, 'wdth' 100; }
    -.font-mona-regular { font-variation-settings: 'wght' 400, 'wdth' 100; }
    -.font-mona-medium { font-variation-settings: 'wght' 500, 'wdth' 100; }
    -.font-mona-semibold { font-variation-settings: 'wght' 600, 'wdth' 100; }
    -.font-mona-bold { font-variation-settings: 'wght' 700, 'wdth' 100; }
    -.font-mona-extrabold { font-variation-settings: 'wght' 800, 'wdth' 100; }
    -.font-mona-black { font-variation-settings: 'wght' 900, 'wdth' 100; }
    +.font-mona-extralight { font-family: 'Mona Sans'; font-variation-settings: 'wght' 200, 'wdth' 100; }
    +.font-mona-light { font-family: 'Mona Sans'; font-variation-settings: 'wght' 300, 'wdth' 100; }
    +.font-mona-regular { font-family: 'Mona Sans'; font-variation-settings: 'wght' 400, 'wdth' 100; }
    +.font-mona-medium { font-family: 'Mona Sans'; font-variation-settings: 'wght' 500, 'wdth' 100; }
    +.font-mona-semibold { font-family: 'Mona Sans'; font-variation-settings: 'wght' 600, 'wdth' 100; }
    +.font-mona-bold { font-family: 'Mona Sans'; font-variation-settings: 'wght' 700, 'wdth' 100; }
    +.font-mona-extrabold { font-family: 'Mona Sans'; font-variation-settings: 'wght' 800, 'wdth' 100; }
    +.font-mona-black { font-family: 'Mona Sans'; font-variation-settings: 'wght' 900, 'wdth' 100; }

    -.font-mona-narrow { font-variation-settings: 'wght' 400, 'wdth' 75; }
    -.font-mona-wide { font-variation-settings: 'wght' 400, 'wdth' 125; }
    +.font-mona-narrow { font-family: 'Mona Sans'; font-variation-settings: 'wght' 400, 'wdth' 75; }
    +.font-mona-wide { font-family: 'Mona Sans'; font-variation-settings: 'wght' 400, 'wdth' 125; }

    Prompt for AI Agent:
    In public/fonts/mona-sans.css around lines 23 to 34 the utility classes set font-variation-settings but do not
    declare font-family, so the variations won't apply to Mona Sans; update each utility class in this block to
    include font-family: 'Mona Sans'; alongside the existing font-variation-settings so the variations are applied
    to the intended font.



    ============================================================================
    File: public/fonts/mona-sans.css
    Line: 36 to 40
    Type: potential_issue

    Comment:
    Add font-family: 'Mona Sans'; to preset classes.

    Same issue as the other utility classes: the preset classes lack the font-family declaration.

    Apply this diff:

    -.font-mona-heading { font-variation-settings: 'wght' 700, 'wdth' 105; } / Bold + slightly wide for headings /
    -.font-mona-subheading { font-variation-settings: 'wght' 600, 'wdth' 102; } / Semibold + slightly wide /
    -.font-mona-caption { font-variation-settings: 'wght' 500, 'wdth' 95; } / Medium + slightly narrow /
    -.font-mona-display { font-variation-settings: 'wght' 800, 'wdth' 110; } / Extrabold + wide for display text /
    +.font-mona-heading { font-family: 'Mona Sans'; font-variation-settings: 'wght' 700, 'wdth' 105; }
    +.font-mona-subheading { font-family: 'Mona Sans'; font-variation-settings: 'wght' 600, 'wdth' 102; }
    +.font-mona-caption { font-family: 'Mona Sans'; font-variation-settings: 'wght' 500, 'wdth' 95; }
    +.font-mona-display { font-family: 'Mona Sans'; font-variation-settings: 'wght' 800, 'wdth' 110; }

    Prompt for AI Agent:
    In public/fonts/mona-sans.css around lines 36 to 40, the preset utility classes (.font-mona-heading,
    .font-mona-subheading, .font-mona-caption, .font-mona-display) set only font-variation-settings and are missing
     the font-family declaration; add font-family: 'Mona Sans'; to each of these classes so they explicitly apply
    the Mona Sans font along with their variation settings.



    ============================================================================
    File: hooks/use-mobile.ts
    Line: 6
    Type: potential_issue

    Comment:
    Hydration mismatch risk: initial state causes incorrect first render.

    The initial state is undefined, but line 18 returns !!undefined which evaluates to false during the first
    render before useEffect executes. This means the hook will incorrectly return false even if the viewport is
    mobile, potentially causing a flash of wrong content. In SSR scenarios, this creates a hydration mismatch
    because the server always renders false while the client may compute a different value.



    Consider initializing state by checking window safely:

    -  const [isMobile, setIsMobile] = React.useState(undefined)
    +  const [isMobile, setIsMobile] = React.useState(
    +    typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT : undefined
    +  )


    And update the return to handle undefined explicitly:

    -  return !!isMobile
    +  return isMobile ?? false



    Also applies to: 18-18

    Prompt for AI Agent:
    In hooks/use-mobile.ts around line 6 (and return at line 18), the hook initializes isMobile to undefined which
    causes a falsey value to be returned on first render and can trigger SSR hydration mismatches; modify the
    initialization to compute the initial value safely when window is available (e.g. set initial state using
    typeof window !== 'undefined' ? window.matchMedia(...) : fallback) so the client’s first render matches the
    computed mobile state, and update the return to avoid coercing undefined to false (explicitly handle undefined
    or use nullish coalescing to return a deterministic boolean or a server-safe fallback).



    ============================================================================
    File: components/ui/label.tsx
    Line: 16
    Type: nitpick

    Comment:
    Note: Flex layout assumes specific use case.

    The flex items-center gap-2 classes assume the label will contain multiple elements (e.g., icon + text). For
    simple text-only labels, this introduces unnecessary flex layout. Consider whether this default is appropriate
    for all use cases in your design system.

    Prompt for AI Agent:
    In components/ui/label.tsx around line 16, the default class list always applies "flex items-center gap-2"
    which forces a flex layout even for plain text labels; change the component to avoid a forced flex layout by
    removing those classes from the default and instead conditionally applying "flex items-center gap-2" (or
    "inline-flex items-center gap-2") only when a new boolean prop (e.g., hasIcon or withLeading/trailingElement)
    is true, or expose a layout/variant prop so callers can opt into the flex spacing when needed.



    ============================================================================
    File: hooks/use-mobile.ts
    Line: 9 to 14
    Type: nitpick

    Comment:
    Redundant logic: use mql.matches instead of window.innerWidth.

    The code creates a MediaQueryList object but doesn't use its .matches property. Instead, it redundantly checks
    window.innerWidth  {
         const mql = window.matchMedia((max-width: ${MOBILE_BREAKPOINT - 1}px))
         const onChange = () => {
    -      setIsMobile(window.innerWidth  mql.removeEventListener("change", onChange)
       }, [])

    Prompt for AI Agent:
    In hooks/use-mobile.ts around lines 9 to 14, the MediaQueryList mql is created but the code redundantly reads
    window.innerWidth to set state; replace those checks with mql.matches to use the media query result directly.
    Modify the onChange handler to call setIsMobile(mql.matches) and initialize state with setIsMobile(mql.matches)
     so the state reflects the defined media query consistently, and keep the existing addEventListener call as-is
    (no other behavioral changes).



    ============================================================================
    File: components/ui/label.tsx
    Line: 16
    Type: potential_issue

    Comment:
    Consider removing select-none for better UX.

    The select-none class prevents users from selecting and copying label text, which may hinder accessibility and
    user experience. Users often need to copy field labels for reference or documentation purposes.



    Apply this diff to remove the class:

    -        "flex items-center gap-2 text-sm leading-none font-medium select-none
    group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50
    peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
    +        "flex items-center gap-2 text-sm leading-none font-medium
    group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50
    peer-disabled:cursor-not-allowed peer-disabled:opacity-50",

    Prompt for AI Agent:
    In components/ui/label.tsx around line 16, the class list includes "select-none" which prevents users from
    selecting and copying label text; remove the "select-none" token from that class string so the label becomes
    selectable while keeping the other utility classes intact (ensure spacing/commas in the string remain correct
    after removal).



    ============================================================================
    File: components/ui/label.tsx
    Line: 8 to 22
    Type: potential_issue

    Comment:
    Add React.forwardRef to support ref forwarding.

    The Label component should forward refs to enable programmatic focus management and imperative access to the
    underlying DOM element. This is important for form control associations and accessibility patterns.



    Apply this diff to add ref forwarding:

    -function Label({
    +const Label = React.forwardRef,
    +  React.ComponentPropsWithoutRef
    +>(({
       className,
       ...props
    -}: React.ComponentProps) {
    +}, ref) => {
       return (

       )
    -}
    +})
    +Label.displayName = "Label"

    Prompt for AI Agent:
    In components/ui/label.tsx around lines 8 to 22, the Label component does not forward refs which prevents
    imperative access and focus management; change the function to use React.forwardRef, accept a ref parameter
    typed to the underlying DOM element (HTMLLabelElement or the appropriate element type from
    LabelPrimitive.Root), pass that ref through to LabelPrimitive.Root, and export/set a displayName (e.g.,
    Label.displayName = "Label") to preserve debugging names.


