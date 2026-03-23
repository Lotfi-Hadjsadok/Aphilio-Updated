<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Naming

Never use single-letter variable or parameter names (for example `c`, `o`, `i`, `f`, `e`, `s`, `n`, `t`, `r`, `g`, `b`, `h`, `p`, `m`, `d`, `k`, `w`). Prefer names that state intent: `event`, `index`, `context`, `section`, `record`, `text`, `match`, `resolve`, `heading`, `red`, `green`, `blue`, `pathname`, and so on. Apply the same rule to object property shorthand in inline data—use `stepNumber`, `title`, `description`, not one-letter keys.


## Responsiveness

Always ensure that all pages and UI components are fully responsive and accessible on different device sizes, including mobile, tablet, and desktop. Use fluid layouts, flexible containers, appropriate breakpoints, and relative units for sizing and spacing. Test all changes across multiple screen widths, and follow the design system’s guidelines for responsive behavior. Responsive styles and patterns should be handled with care both in markup and CSS (or utility classes), and avoid hard-coding fixed widths or heights unless necessary.