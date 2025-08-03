# BeamCut Optimization Engine

## Overview

BeamCut is a sophisticated cutting stock optimization system that solves the classic cutting stock problem using advanced algorithms like Column Generation and Linear Programming. The application helps users find the most efficient way to cut materials from master rolls to meet specific beam requirements while minimizing waste, cost, or the number of rolls used.

The system provides a comprehensive web interface for inputting cutting requirements, selecting optimization algorithms, and visualizing results with detailed cutting patterns and performance metrics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development practices
- **UI Library**: Radix UI components with shadcn/ui for consistent, accessible interface elements
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for robust form handling
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js web framework
- **Language**: TypeScript for type safety across the full stack
- **API Design**: RESTful endpoints with JSON communication
- **Optimization Engine**: Python subprocess execution for complex mathematical algorithms
- **Algorithm Implementation**: PuLP (Python Linear Programming) for solving optimization problems
- **Data Storage**: In-memory storage with interface abstraction for future database integration

### Database Design
- **Schema Definition**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Tables**: 
  - `beam_requirements`: Stores individual cutting requirements with length, quantity, and priority
  - `optimization_jobs`: Tracks optimization requests, parameters, results, and execution metadata
- **Data Types**: JSON fields for complex nested data like cutting patterns and algorithm results

### Authentication and Authorization
- Currently implemented as a single-user system without authentication
- Session management infrastructure present via connect-pg-simple for future multi-user support

### Algorithm Architecture
- **Primary Algorithm**: Column Generation for solving cutting stock problems optimally
- **Alternative Algorithms**: First Fit Decreasing, Best Fit Decreasing, and Hybrid approaches
- **Optimization Goals**: Support for minimizing waste, rolls, cost, or balanced optimization
- **Performance Tracking**: Detailed metrics on execution time, memory usage, iterations, and convergence

### Data Flow
1. User inputs cutting requirements through React form components
2. Frontend validates data using Zod schemas and submits to Express API
3. Backend creates optimization job record and spawns Python optimization process
4. Python solver runs mathematical optimization and returns results
5. Results are processed, stored, and returned to frontend for visualization
6. Real-time progress updates and algorithm step tracking throughout the process

### Error Handling
- Comprehensive error boundaries in React components
- API error handling with structured error responses
- Python subprocess error capture and reporting
- Toast notifications for user feedback on operations

## External Dependencies

### Core Technologies
- **React 18**: Frontend framework with concurrent features
- **Express.js**: Backend web framework for Node.js
- **TypeScript**: Type system for JavaScript providing compile-time type checking
- **Vite**: Build tool and development server with hot module replacement

### Database and ORM
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL support
- **@neondatabase/serverless**: PostgreSQL driver optimized for serverless environments
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI and Design System
- **Radix UI**: Unstyled, accessible UI primitives for React
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library with consistent design language
- **shadcn/ui**: Pre-built component library built on Radix UI and Tailwind

### Form Handling and Validation
- **React Hook Form**: Performant forms library with minimal re-renders
- **Zod**: TypeScript-first schema validation library
- **@hookform/resolvers**: Integration layer between React Hook Form and validation libraries

### State Management and Data Fetching
- **TanStack Query**: Data synchronization for React with caching, background updates, and optimistic updates
- **Wouter**: Minimalist routing library for React applications

### Optimization Engine
- **Python 3**: Runtime for mathematical optimization algorithms
- **PuLP**: Linear programming library for Python supporting multiple solvers
- **NumPy/SciPy**: (Implied) Scientific computing libraries for numerical operations

### Development and Build Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: Tool for transforming CSS with plugins
- **Autoprefixer**: PostCSS plugin for adding vendor prefixes automatically

### Replit Integration
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay for Replit environment
- **@replit/vite-plugin-cartographer**: Development tooling for Replit projects

The architecture emphasizes type safety, performance, and maintainability while providing a robust foundation for solving complex optimization problems with an intuitive user interface.