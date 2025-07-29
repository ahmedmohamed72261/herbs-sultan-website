# HerbaCure Frontend - API Integration

This frontend is now connected to the HerbaCure backend API deployed at `https://herbs-dashboard-backend.vercel.app/`.

## Features

### API Integration
- **Products**: Dynamically loads products from the backend API
- **Team Members**: Displays team members from the database
- **Certificates**: Shows certificates and certifications
- **Contact Form**: Sends messages to the backend
- **Contact Information**: Loads contact details from the API

### Pages Connected
1. **index.html** - Home page with dynamic gallery and featured products
2. **gallery.html** - Gallery page with API-loaded content
3. **team.html** - Team page with dynamic team member loading
4. **certificates.html** - Certificates page with API integration
5. **contact.html** - Contact page with working contact form
6. **about.html** - About page with API integration

### API Service Features
- **Automatic fallback**: If API is unavailable, uses static content
- **Error handling**: Graceful error handling for API failures
- **Loading states**: Shows loading indicators while fetching data
- **Form validation**: Client-side validation for contact forms
- **Real-time updates**: Content updates automatically from the backend

## API Endpoints Used

### Public Endpoints
- `GET /api/products` - Get all products
- `GET /api/team` - Get team members
- `GET /api/certificates` - Get certificates
- `GET /api/contact` - Get contact information
- `POST /api/messages` - Send contact form messages
- `GET /api/health` - Health check

### Configuration
The API base URL is configured in `js/api-service.js`:
```javascript
const API_BASE_URL = 'https://herbs-dashboard-backend.vercel.app/api';
```

## How It Works

1. **Page Load**: When a page loads, the API service automatically detects the current page
2. **Data Fetching**: Relevant data is fetched from the backend API
3. **Dynamic Updates**: Page content is updated with real data
4. **Fallback**: If API fails, static content is displayed
5. **Form Handling**: Contact forms submit data to the backend

## Files Added/Modified

### New Files
- `js/api-service.js` - Main API integration service

### Modified Files
- All HTML files updated to include the API service script
- Existing JavaScript files work alongside the new API service

## Styling
- **No styles changed**: All existing CSS and styling remains intact
- **Responsive design**: All responsive features maintained
- **Animations**: All animations and effects preserved

## Usage

1. Open any HTML file in a web browser
2. The page will automatically connect to the backend API
3. If the API is available, dynamic content will load
4. If the API is unavailable, static content will display
5. Contact forms will submit to the backend when available

## Backend Requirements

The frontend expects the backend to be running at:
`https://herbs-dashboard-backend.vercel.app/`

Make sure the backend has CORS enabled for the frontend domain.

## Development

To modify the API integration:
1. Edit `js/api-service.js`
2. Update the `API_BASE_URL` if needed
3. Modify page-specific initializers in the `PageInitializers` object

## Production Deployment

1. Ensure the backend is deployed and accessible
2. Update the API_BASE_URL in `js/api-service.js` if needed
3. Deploy the frontend files to your web server
4. Test all pages to ensure API connectivity

## Support

For issues with the API integration, check:
1. Browser console for error messages
2. Network tab to see API requests
3. Backend API health endpoint: `/api/health`