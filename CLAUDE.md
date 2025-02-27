# SMN-Site Commands and Guidelines

## Project Commands
- **View Site**: Open index.html in a browser
- **Deploy**: Upload files to Cloudflare Pages (manual process)

## Development Style Guidelines

### HTML
- Use semantic HTML5 elements
- Follow BEM-like naming: `block__element--modifier`
- Include accessibility attributes (ARIA roles, screen-reader text)
- Use inline SVG for icons

### CSS
- Mobile-first responsive design
- Use CSS variables for theming
- Comment sections clearly
- Modular component-based organization

### JavaScript
- Use IIFE pattern for encapsulation
- Prefer const/let over var
- Use ES6 features (arrow functions, template literals)
- Implement progressive enhancement
- Handle errors with try/catch blocks

### Forms
- Implement client-side validation
- Provide clear error messaging
- Include loading states for submissions

### File Naming
- Use kebab-case for filenames (e.g., `curriculo-form.js`)
- Organize by feature/component