from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from metrics_collector import StorageMetricsCollector
import os

app = Flask(__name__, static_folder='../frontend')
CORS(app)

# Initialize metrics collector
collector = StorageMetricsCollector()

@app.route('/')
def index():
    """Serve the main dashboard page"""
    return send_from_directory('../frontend', 'index.html')

@app.route('/api/metrics')
def get_metrics():
    """Get all storage metrics"""
    try:
        metrics = collector.get_all_metrics()
        return jsonify(metrics)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/partitions')
def get_partitions():
    """Get disk partition information"""
    try:
        partitions = collector.get_disk_partitions()
        return jsonify(partitions)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/io-stats')
def get_io_stats():
    """Get I/O statistics"""
    try:
        io_stats = collector.get_io_stats()
        return jsonify(io_stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/smart')
def get_smart():
    """Get SMART data for disks"""
    try:
        smart_data = collector.get_smart_data()
        return jsonify(smart_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/system-info')
def get_system_info():
    """Get system information"""
    try:
        system_info = collector.get_system_info()
        return jsonify(system_info)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files"""
    return send_from_directory('../frontend', path)

if __name__ == '__main__':
    print("Starting Storage Dashboard Server...")
    print("Access the dashboard at: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
