# MoodMusic Agent Instructions

## Project Structure

- **Frontend**: `frontend/` - React/Vite application
- **Backend**: `backend/` - Node.js/Express server
- **Assets**: `frontend/src/assets/` - Static files including logos
- **Styles**: `frontend/src/styles/` - CSS files with theme variables
- **Components**: `frontend/src/components/` - React components

## Key Commands

```bash
# Install dependencies
npm install
cd frontend && npm install

# Run development servers (requires concurrently)
npm run dev

# Build frontend
cd frontend && npm run build

# Start backend only
cd backend && npm start
```

## Development Workflow

1. **Logo Updates**: Place SVG files in `frontend/src/assets/` and import in components
2. **Styling**: Use CSS variables from `App.css` for consistent theming
3. **Navigation**: Logo component is in `Navigation.jsx` with styles in `Navigation.css`

## Theme Colors

- Primary: `#7c5ef0` (light) / `#9d85ff` (dark)
- Secondary: `#8e7dff`
- Accent: `#ff7eb3` (light) / `#ff98c7` (dark)
- Use CSS variables: `var(--primary-color)`, `var(--accent-color)`

## Logo Implementation

- SVG files should use the theme gradient: `#7c5ef0` to `#ff7eb3`
- Import SVG as React component: `import logo from '../assets/logo.svg'`
- Use in JSX: `<img src={logo} alt="MoodMusic Logo" className="logo-image" />`
- Style with CSS class `.logo-image` in `Navigation.css`

## Responsive Design

- Mobile breakpoints at 768px and 480px
- Logo sizes: 80px (desktop), 60px (tablet), 50px (mobile)
- Use media queries in `Navigation.css` for responsive adjustments