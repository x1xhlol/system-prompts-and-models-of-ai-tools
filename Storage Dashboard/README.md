# Storage Device Performance Dashboard

A comprehensive, real-time web-based dashboard for monitoring storage device performance metrics. Track disk usage, I/O performance, IOPS, SMART health data, and more with beautiful visualizations.

![Dashboard Preview](https://img.shields.io/badge/Status-Active-success)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green)

## Features

### Real-time Monitoring
- **Auto-refresh every 5 seconds** - Stay updated with the latest metrics
- **Live performance charts** - Visualize trends over time
- **Instant metrics** - See current performance at a glance

### Comprehensive Metrics

#### 1. System Information
- Platform and OS details
- System hostname
- Uptime statistics
- Boot time

#### 2. Disk Partitions & Usage
- All mounted partitions
- Total, used, and free space
- Usage percentage with visual progress bars
- File system type
- Mount points

#### 3. I/O Performance
- Read/Write speeds (MB/s)
- IOPS (Input/Output Operations Per Second)
- Total data read/written
- Real-time speed calculations
- Historical trend charts

#### 4. SMART Health Data
- Disk health status
- Temperature monitoring
- Power-on hours
- Power cycle count
- Model and serial information
- *Note: Requires root/admin privileges*

#### 5. Visual Analytics
- Interactive bar charts for current performance
- Line charts for historical trends
- Color-coded health indicators
- Responsive data tables

## Technology Stack

### Backend
- **Python 3.8+** - Core language
- **Flask 3.0.0** - Web framework
- **psutil 5.9.6** - System metrics collection
- **pySMART 1.3.0** - SMART data retrieval
- **Flask-CORS 4.0.0** - Cross-origin resource sharing

### Frontend
- **HTML5/CSS3** - Structure and styling
- **JavaScript (ES6+)** - Interactive functionality
- **Chart.js 4.4.0** - Data visualization
- **Modern responsive design** - Works on all devices

## Installation

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Step 1: Clone or Navigate to the Directory
```bash
cd "Storage Dashboard"
```

### Step 2: Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 3: Start the Backend Server
```bash
python app.py
```

The server will start on `http://localhost:5000`

### Step 4: Access the Dashboard
Open your web browser and navigate to:
```
http://localhost:5000
```

## Usage

### Dashboard Interface

1. **System Information Panel**
   - View OS details and system uptime
   - Located at the top of the dashboard

2. **Disk Partitions Section**
   - Each partition displayed as a card
   - Color-coded progress bars:
     - Blue: < 75% usage (healthy)
     - Orange: 75-90% usage (warning)
     - Red: > 90% usage (critical)

3. **I/O Performance Charts**
   - Bar charts show current read/write speeds and IOPS
   - View all disks simultaneously

4. **Detailed Statistics Table**
   - Comprehensive I/O metrics in tabular format
   - Sortable and easy to read

5. **SMART Health Section**
   - Individual cards for each storage device
   - Health status badges (Good/Warning/Bad)
   - Detailed device information

6. **Historical Performance**
   - Line charts track performance over time
   - Shows trends for the last 20 data points
   - Auto-updates every 5 seconds

### Manual Refresh
Click the "Refresh Now" button in the header to manually update all metrics.

## API Endpoints

The backend provides the following REST API endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/metrics` | GET | Get all metrics in one call |
| `/api/partitions` | GET | Get disk partition information |
| `/api/io-stats` | GET | Get I/O statistics |
| `/api/smart` | GET | Get SMART health data |
| `/api/system-info` | GET | Get system information |

### Example API Response

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "system_info": {
    "platform": "Linux",
    "hostname": "server-01",
    "uptime_days": 15,
    "uptime_hours": 6,
    "uptime_minutes": 23
  },
  "partitions": [
    {
      "device": "/dev/sda1",
      "mountpoint": "/",
      "fstype": "ext4",
      "total_gb": 500.0,
      "used_gb": 250.0,
      "free_gb": 250.0,
      "percent": 50.0
    }
  ],
  "io_stats": [
    {
      "disk": "sda",
      "read_speed_mbps": 45.2,
      "write_speed_mbps": 23.1,
      "iops_read": 1200,
      "iops_write": 800
    }
  ]
}
```

## Configuration

### Change Refresh Interval
Edit `frontend/dashboard.js`:
```javascript
const REFRESH_INTERVAL = 5000; // milliseconds (5 seconds)
```

### Change Historical Data Length
Edit `frontend/dashboard.js`:
```javascript
const HISTORY_LENGTH = 20; // number of data points
```

### Change Server Port
Edit `backend/app.py`:
```python
app.run(debug=True, host='0.0.0.0', port=5000)
```

## SMART Data Collection

SMART data provides valuable insights into disk health but requires elevated privileges:

### Linux
```bash
sudo python app.py
```

### Windows
Run Command Prompt or PowerShell as Administrator:
```bash
python app.py
```

### macOS
```bash
sudo python app.py
```

If SMART data is unavailable, the dashboard will display a message indicating that root/admin privileges are required.

## Troubleshooting

### Backend Won't Start
- Ensure Python 3.8+ is installed: `python --version`
- Verify all dependencies are installed: `pip install -r requirements.txt`
- Check if port 5000 is available

### No Data Displayed
- Ensure the backend server is running
- Check browser console for errors (F12)
- Verify the API URL in `dashboard.js` matches your backend

### SMART Data Not Available
- SMART data requires root/admin privileges
- Run the backend with elevated permissions
- Some virtual machines may not expose SMART data

### Charts Not Rendering
- Ensure you have internet connectivity (Chart.js loads from CDN)
- Check browser console for JavaScript errors
- Try clearing browser cache

## Security Considerations

- The dashboard runs on `0.0.0.0` (all interfaces) by default
- For production use, configure proper firewall rules
- Consider using HTTPS for secure connections
- Implement authentication for sensitive environments

## Development

### Project Structure
```
Storage Dashboard/
├── backend/
│   ├── app.py                 # Flask application
│   ├── metrics_collector.py   # Metrics collection logic
│   └── requirements.txt       # Python dependencies
└── frontend/
    ├── index.html             # Main dashboard page
    ├── styles.css             # Styling
    └── dashboard.js           # Frontend logic and charts
```

### Extending the Dashboard

#### Add New Metrics
1. Add collection method in `metrics_collector.py`
2. Create API endpoint in `app.py`
3. Update frontend to display the new data

#### Customize Appearance
- Modify `styles.css` to change colors and layout
- Update CSS variables in `:root` for theme changes

## Performance

- **Low overhead** - Minimal impact on system performance
- **Efficient polling** - Only collects data when needed
- **Optimized charts** - Smooth animations and updates
- **Responsive design** - Fast load times

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## License

This project is open source and available for personal and commercial use.

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review the API documentation
3. Examine browser console logs
4. Check backend server logs

## Future Enhancements

Planned features:
- [ ] Export metrics to CSV/JSON
- [ ] Email/SMS alerts for critical conditions
- [ ] Multi-server monitoring
- [ ] Historical data persistence
- [ ] Custom metric thresholds
- [ ] Network storage support
- [ ] Docker containerization

## Screenshots

The dashboard features:
- Dark theme optimized for monitoring
- Color-coded status indicators
- Real-time updating charts
- Responsive grid layouts
- Professional UI design

---

**Built with ❤️ for system administrators and monitoring enthusiasts**
