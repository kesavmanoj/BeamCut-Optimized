# BeamCut - Cutting Stock Optimization Engine

A modern web application for solving cutting stock problems using advanced optimization algorithms. BeamCut helps minimize material waste by finding optimal cutting patterns for beams and master rolls using Column Generation techniques.

## 🚀 Features

### Core Optimization
- **Column Generation Algorithm**: Advanced mathematical optimization using linear programming
- **Multiple Algorithms**: Support for various cutting algorithms including First Fit Decreasing, Best Fit Decreasing, and Hybrid approaches
- **Real-time Visualization**: Interactive algorithm visualization showing step-by-step optimization process
- **Range Analysis**: Analyze optimal solutions across different master roll lengths

### Project Management
- **Project Organization**: Save and manage multiple optimization projects
- **Historical Data**: Track optimization results and performance metrics
- **Export Capabilities**: Export results and cutting patterns for production use

### User Experience
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- **Real-time Feedback**: Live progress updates and algorithm step visualization
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices
- **Intuitive Forms**: Easy-to-use interface for inputting beam requirements

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with Tailwind CSS
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for lightweight routing
- **Forms**: React Hook Form with Zod validation

### Backend (Node.js + Express)
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod schema validation
- **API**: RESTful API with TypeScript

### Optimization Engine (Python)
- **Algorithm**: Column Generation with Linear Programming
- **Solver**: PuLP (Python Linear Programming)
- **Process**: Spawned as child process from Node.js
- **Memory Management**: Optimized for large-scale problems

### Database Schema
```sql
-- Projects table for organization
projects (id, name, description, created_at, updated_at, last_optimization_id)

-- Optimization jobs for tracking
optimization_jobs (id, master_roll_length, material_cost, algorithm, 
                  optimization_goal, status, beam_requirements, results, 
                  execution_time, created_at, completed_at)

-- Beam requirements for individual beams
beam_requirements (id, length, quantity, priority, created_at)
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- Python 3.11+
- PostgreSQL database
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Beam-Cutting-Optimization
```

### 2. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
# or using uv (recommended)
uv sync
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/beamcut
PORT=5000
NODE_ENV=development
```

### 4. Database Setup
```bash
# Push database schema
npm run db:push
```

### 5. Start Development Server
```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:5000`

## 📖 Usage

### Basic Optimization
1. **Navigate to the Home page**
2. **Configure Optimization Parameters**:
   - Set master roll length
   - Choose optimization algorithm
   - Select optimization goal (minimize waste, rolls, cost, or balance all)
   - Add beam requirements (length, quantity, priority)

3. **Run Optimization**:
   - Click "Start Optimization"
   - Watch real-time algorithm visualization
   - Review results and cutting patterns

### Range Analysis
1. **Switch to Range Analysis tab**
2. **Set Range Parameters**:
   - Define master roll length range (min, max, step)
   - Configure beam requirements
   - Choose algorithm and optimization goal

3. **Analyze Results**:
   - View efficiency trends across different roll lengths
   - Identify optimal roll length for your requirements
   - Export analysis data

### Project Management
1. **Create New Project**:
   - Navigate to Projects page
   - Click "New Project"
   - Enter project name and description

2. **Save Optimization Results**:
   - After running optimization, save to project
   - Track historical performance
   - Compare different approaches

## 🔧 API Endpoints

### Optimization
- `POST /api/optimize` - Run single optimization
- `POST /api/optimize-range` - Run range analysis

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

## 🧮 Algorithms

### Column Generation
The primary algorithm uses advanced linear programming techniques:
1. **Initial Pattern Generation**: Creates basic cutting patterns
2. **Master Problem**: Solves linear programming relaxation
3. **Pricing Subproblem**: Solves knapsack problem to find new patterns
4. **Convergence**: Iterates until optimal solution is found
5. **Integer Solution**: Converts to integer solution for practical use

### Alternative Algorithms
- **First Fit Decreasing**: Simple greedy approach
- **Best Fit Decreasing**: Improved greedy with better space utilization
- **Hybrid**: Combines multiple approaches for balanced results

## 🎯 Optimization Goals

- **Minimize Waste**: Focus on reducing material waste percentage
- **Minimize Rolls**: Reduce the number of master rolls needed
- **Minimize Cost**: Optimize for lowest total material cost
- **Balance All**: Balance between waste, rolls, and cost

## 📊 Performance Metrics

The system tracks various performance indicators:
- **Efficiency**: Percentage of material used effectively
- **Waste Percentage**: Percentage of material wasted
- **Total Rolls**: Number of master rolls required
- **Execution Time**: Algorithm performance timing
- **Pattern Count**: Number of unique cutting patterns

## 🚀 Deployment

### Production Build
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables for Production
```env
DATABASE_URL=your_production_database_url
PORT=5000
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the algorithm visualization for understanding

## 🔮 Roadmap

- [ ] Advanced visualization with 3D cutting layouts
- [ ] Integration with CAD software
- [ ] Machine learning for pattern prediction
- [ ] Multi-material optimization
- [ ] Real-time collaboration features
- [ ] Mobile app development

---

**BeamCut** - Optimizing material usage, one cut at a time ✂️ 