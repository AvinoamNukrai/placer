# Big Box Stores Analytics Dashboard

A full-stack analytics application that provides insights into Big Box Store Point of Interest (POI) data with filtering, pagination, and smart search capabilities.

## 🎯 Project Overview

This application reads a dataset of Big Box Stores and presents insights in a dashboard-style report. It features a Node.js/Express backend API, a React frontend with TypeScript, and SQLite database management using `sql.js` for cross-platform compatibility.

## 🏗️ Architecture

### Tech Stack
- **Backend**: Node.js, Express.js, TypeScript
- **Frontend**: React, Vite, TypeScript, React Query
- **Database**: SQLite with `sql.js` (WebAssembly)
- **Data Processing**: CSV parsing with type coercion
- **Validation**: Zod schema validation
- **Styling**: Custom CSS with modern design

### Project Structure
```
placer/
├── data/                          # Data files and database
│   ├── Bigbox Stores Metrics.csv  # Source CSV data
│   ├── bigbox.sqlite             # Generated SQLite database
│   └── schema.sql                # Database schema definition
├── scripts/                       # Database build scripts
│   ├── build_db.ts               # CSV to SQLite ingestion script
│   └── test_db.ts                # Database integrity test script
├── backend/                       # Express.js API server
│   ├── src/
│   │   ├── app.ts                # Express app configuration
│   │   ├── server.ts             # Server entry point
│   │   ├── db/                   # Database client and utilities
│   │   └── modules/              # API route modules
│   │       ├── pois/             # POI data endpoints
│   │       ├── summary/          # Summary statistics endpoints
│   │       └── options/          # Filter options endpoints
│   └── package.json              # Backend dependencies
├── frontend/                      # React frontend application
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # Page components
│   │   ├── services/             # API service layer
│   │   ├── ui/                   # UI components
│   │   └── styles.css            # Global styles
│   └── package.json              # Frontend dependencies
└── package.json                   # Root project scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd placer
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend && npm install
   
   # Install frontend dependencies
   cd ../frontend && npm install
   ```

3. **Build the database**
   ```bash
   # From root directory
   npm run dev:db
   ```

4. **Start the backend**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will start on http://localhost:4000

5. **Start the frontend**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will start on http://localhost:5173

## 📊 Features

### Core Dashboard
- **POI Table**: Paginated table showing store information
- **Filters**: Chain name, DMA, category, city, state, open/closed status
- **Summary Statistics**: Total venues and foot traffic counts
- **Pagination**: Navigate through large datasets efficiently

### Smart Search
- **Natural Language Processing**: Type questions in plain English
- **Intelligent Filtering**: Automatically applies relevant filters based on search query
- **Keyword Recognition**: Identifies store names, locations, and status

### Data Management
- **CSV Ingestion**: Automated data loading from CSV files
- **Type Coercion**: Automatic data type conversion and validation
- **Database Views**: Normalized data presentation for frontend consumption

## 🔧 API Endpoints

### Health Check
- `GET /api/health` - Server status

### POI Data
- `GET /api/pois` - Get paginated POI data with filtering
  - Query params: `page`, `limit`, `chain_name`, `dma`, `category`, `city`, `state`, `is_open`, `sort_by`, `sort_dir`

### Summary Statistics
- `GET /api/summary` - Get aggregated statistics for filtered data
  - Query params: Same as POI endpoint

### Filter Options
- `GET /api/options` - Get available filter values
  - Returns: `chain_names`, `dmas`, `categories`

## 🗄️ Database Schema

### Venues Table
```sql
CREATE TABLE venues (
  entity_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  foot_traffic INTEGER NOT NULL DEFAULT 0,
  chain_name TEXT,
  sub_category TEXT,
  dma INTEGER,
  city TEXT,
  state_code TEXT,
  date_closed TEXT
);
```

### Venues View
```sql
CREATE VIEW venues_view AS
SELECT
  entity_id, name, chain_name,
  sub_category AS category,
  dma, city, state_code AS state,
  foot_traffic AS visits,
  CASE WHEN date_closed IS NULL OR date_closed = '' THEN 1 ELSE 0 END AS is_open
FROM venues;
```

## 🛠️ Development

### Available Scripts

#### Root Directory
- `npm run dev:db` - Build database from CSV
- `npm run test:db` - Test database integrity

#### Backend
- `npm run dev` - Start development server with hot reload

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Database Management
The application uses `sql.js` (SQLite compiled to WebAssembly) for cross-platform compatibility. This approach:
- Avoids native compilation issues
- Provides consistent SQLite functionality
- Loads database into memory for fast queries
- Supports complex SQL operations

### Data Flow
1. **CSV Ingestion**: `scripts/build_db.ts` reads CSV and creates SQLite database
2. **Backend Loading**: Database loaded into memory at server startup
3. **API Queries**: Dynamic SQL generation based on filter parameters
4. **Frontend Display**: React components render data with pagination and filtering

## 🎨 UI Components

### Core Components
- **DashboardPage**: Main application container
- **FiltersPanel**: Filter controls with search/reset buttons
- **PoisTable**: Data table with pagination
- **SummaryStrip**: Statistics display
- **SmartSearch**: Natural language search input
- **Pagination**: Page navigation controls

### Design Features
- **Light Theme**: Clean, modern interface
- **Responsive Layout**: Works on desktop and mobile
- **Interactive Elements**: Hover effects and smooth transitions
- **Consistent Styling**: Unified color scheme and typography

## 🔍 Filtering & Search

### Filter Types
- **Chain Name**: Dropdown with available store chains
- **DMA**: Designated Market Area selection
- **Category**: Store category filtering
- **City**: Text input for city names
- **State**: Text input for state codes
- **Status**: Open/closed/any toggle

### Smart Search Examples
- "Show me all Walmart stores in Texas"
- "Find closed stores in California"
- "Big Lots locations in New York"
- "Open Amazon stores"

## 📈 Performance Considerations

### Database Optimization
- **In-Memory Loading**: Fast query response times
- **Indexed Queries**: Efficient data retrieval
- **View Abstraction**: Simplified data access patterns

### Frontend Performance
- **React Query**: Intelligent caching and background updates
- **Pagination**: Load only visible data
- **Debounced Search**: Reduce unnecessary API calls

## 🚨 Troubleshooting

### Common Issues

#### Database Build Fails
```bash
# Ensure you're in the root directory
cd /path/to/placer
npm run dev:db
```

#### Backend Port Already in Use
```bash
# Check what's using port 4000
lsof -nP -iTCP:4000 -sTCP:LISTEN

# Kill the process if needed
kill -9 <PID>
```

#### Frontend Not Loading
```bash
# Restart both servers
# Backend
cd backend && npm run dev

# Frontend (in new terminal)
cd frontend && npm run dev
```

### Debug Mode
Enable detailed logging by setting environment variables:
```bash
DEBUG=* npm run dev  # Backend
DEBUG=vite:* npm run dev  # Frontend
```

## 🔮 Future Enhancements

### Planned Features
- **Real-time Updates**: WebSocket integration for live data
- **Advanced Analytics**: Charts and trend analysis
- **Export Functionality**: CSV/PDF report generation
- **User Authentication**: Role-based access control
- **Geospatial Search**: Location-based filtering

### Scalability Improvements
- **Database Sharding**: Distribute data across multiple databases
- **Caching Layer**: Redis integration for performance
- **Load Balancing**: Multiple backend instances
- **Microservices**: Break down into smaller services

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or issues:
- Create an issue in the repository
- Check the troubleshooting section above
- Review the API documentation

---

**Built with ❤️ using modern web technologies**
