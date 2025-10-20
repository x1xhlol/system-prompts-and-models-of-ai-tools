// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const REFRESH_INTERVAL = 5000; // 5 seconds
const HISTORY_LENGTH = 20; // Keep last 20 data points

// Global state
let charts = {};
let historicalData = {
    labels: [],
    readSpeeds: {},
    writeSpeeds: {},
    readIOPS: {},
    writeIOPS: {}
};

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    fetchAllData();
    startAutoRefresh();

    // Manual refresh button
    document.getElementById('refresh-btn').addEventListener('click', () => {
        fetchAllData();
    });
});

// Initialize all charts
function initializeCharts() {
    const chartConfig = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                labels: {
                    color: '#e2e8f0'
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#94a3b8'
                },
                grid: {
                    color: '#334155'
                }
            },
            x: {
                ticks: {
                    color: '#94a3b8'
                },
                grid: {
                    color: '#334155'
                }
            }
        }
    };

    // Speed Chart
    charts.speed = new Chart(document.getElementById('speed-chart'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Read Speed (MB/s)',
                    data: [],
                    backgroundColor: 'rgba(37, 99, 235, 0.8)',
                    borderColor: 'rgba(37, 99, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Write Speed (MB/s)',
                    data: [],
                    backgroundColor: 'rgba(6, 182, 212, 0.8)',
                    borderColor: 'rgba(6, 182, 212, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: chartConfig
    });

    // IOPS Chart
    charts.iops = new Chart(document.getElementById('iops-chart'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Read IOPS',
                    data: [],
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Write IOPS',
                    data: [],
                    backgroundColor: 'rgba(245, 158, 11, 0.8)',
                    borderColor: 'rgba(245, 158, 11, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: chartConfig
    });

    // Historical Speed Chart
    charts.historical = new Chart(document.getElementById('historical-chart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            ...chartConfig,
            elements: {
                line: {
                    tension: 0.4
                },
                point: {
                    radius: 3
                }
            }
        }
    });

    // Historical IOPS Chart
    charts.iopsTrend = new Chart(document.getElementById('iops-trend-chart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            ...chartConfig,
            elements: {
                line: {
                    tension: 0.4
                },
                point: {
                    radius: 3
                }
            }
        }
    });
}

// Fetch all data
async function fetchAllData() {
    try {
        const response = await fetch(`${API_BASE_URL}/metrics`);
        if (!response.ok) throw new Error('Failed to fetch metrics');

        const data = await response.json();

        updateSystemInfo(data.system_info);
        updatePartitions(data.partitions);
        updateIOStats(data.io_stats);
        updateSMARTData(data.smart_data);
        updateHistoricalData(data.io_stats);
        updateLastUpdateTime();
    } catch (error) {
        console.error('Error fetching data:', error);
        showError('Failed to fetch data from server. Make sure the backend is running.');
    }
}

// Update system information
function updateSystemInfo(info) {
    if (!info) return;

    document.getElementById('platform').textContent =
        `${info.platform} ${info.platform_release}`;
    document.getElementById('hostname').textContent = info.hostname;
    document.getElementById('uptime').textContent =
        `${info.uptime_days}d ${info.uptime_hours}h ${info.uptime_minutes}m`;
    document.getElementById('boot-time').textContent = info.boot_time;
}

// Update disk partitions
function updatePartitions(partitions) {
    if (!partitions || partitions.length === 0) {
        document.getElementById('partitions-container').innerHTML =
            '<div class="info-message">No partitions found</div>';
        return;
    }

    const container = document.getElementById('partitions-container');
    container.innerHTML = '';

    partitions.forEach(partition => {
        const card = document.createElement('div');
        card.className = 'partition-card';

        let progressClass = '';
        if (partition.percent >= 90) progressClass = 'danger';
        else if (partition.percent >= 75) progressClass = 'warning';

        card.innerHTML = `
            <div class="partition-header">
                <div class="partition-name">${partition.device}</div>
                <div class="partition-type">${partition.fstype}</div>
            </div>
            <div class="partition-info">
                <div class="partition-info-row">
                    <span class="label">Mount Point:</span>
                    <span class="value">${partition.mountpoint}</span>
                </div>
                <div class="partition-info-row">
                    <span class="label">Total:</span>
                    <span class="value">${partition.total_gb} GB</span>
                </div>
                <div class="partition-info-row">
                    <span class="label">Used:</span>
                    <span class="value">${partition.used_gb} GB</span>
                </div>
                <div class="partition-info-row">
                    <span class="label">Free:</span>
                    <span class="value">${partition.free_gb} GB</span>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill ${progressClass}" style="width: ${partition.percent}%">
                    ${partition.percent.toFixed(1)}%
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

// Update I/O statistics
function updateIOStats(ioStats) {
    if (!ioStats || ioStats.length === 0) {
        document.getElementById('io-stats-body').innerHTML =
            '<tr><td colspan="7" class="loading">No I/O data available</td></tr>';
        return;
    }

    // Update table
    const tbody = document.getElementById('io-stats-body');
    tbody.innerHTML = '';

    ioStats.forEach(stat => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${stat.disk}</strong></td>
            <td>${stat.read_speed_mbps.toFixed(2)} MB/s</td>
            <td>${stat.write_speed_mbps.toFixed(2)} MB/s</td>
            <td>${stat.iops_read.toFixed(0)}</td>
            <td>${stat.iops_write.toFixed(0)}</td>
            <td>${stat.read_mb.toFixed(2)} MB</td>
            <td>${stat.write_mb.toFixed(2)} MB</td>
        `;
        tbody.appendChild(row);
    });

    // Update bar charts
    const labels = ioStats.map(s => s.disk);
    const readSpeeds = ioStats.map(s => s.read_speed_mbps);
    const writeSpeeds = ioStats.map(s => s.write_speed_mbps);
    const readIOPS = ioStats.map(s => s.iops_read);
    const writeIOPS = ioStats.map(s => s.iops_write);

    charts.speed.data.labels = labels;
    charts.speed.data.datasets[0].data = readSpeeds;
    charts.speed.data.datasets[1].data = writeSpeeds;
    charts.speed.update();

    charts.iops.data.labels = labels;
    charts.iops.data.datasets[0].data = readIOPS;
    charts.iops.data.datasets[1].data = writeIOPS;
    charts.iops.update();
}

// Update SMART data
function updateSMARTData(smartData) {
    const container = document.getElementById('smart-container');

    if (!smartData || (Array.isArray(smartData) && smartData.length === 0)) {
        container.innerHTML =
            '<div class="info-message">No SMART data available (requires root/admin privileges)</div>';
        return;
    }

    if (smartData.error) {
        container.innerHTML =
            `<div class="info-message">SMART data unavailable: ${smartData.message}</div>`;
        return;
    }

    container.innerHTML = '';

    smartData.forEach(device => {
        const card = document.createElement('div');
        card.className = 'smart-card';

        let healthClass = 'good';
        let healthText = device.health || 'Unknown';
        if (healthText.toLowerCase().includes('fail')) healthClass = 'bad';
        else if (healthText.toLowerCase().includes('warn')) healthClass = 'warning';

        card.innerHTML = `
            <div class="smart-header">
                <div class="smart-model">${device.name}</div>
                <div class="health-badge ${healthClass}">${healthText}</div>
            </div>
            <div class="smart-details">
                <div class="smart-row">
                    <span class="label">Model:</span>
                    <span class="value">${device.model || 'N/A'}</span>
                </div>
                <div class="smart-row">
                    <span class="label">Serial:</span>
                    <span class="value">${device.serial || 'N/A'}</span>
                </div>
                <div class="smart-row">
                    <span class="label">Capacity:</span>
                    <span class="value">${device.capacity || 'N/A'}</span>
                </div>
                <div class="smart-row">
                    <span class="label">Temperature:</span>
                    <span class="value">${device.temperature ? device.temperature + '°C' : 'N/A'}</span>
                </div>
                <div class="smart-row">
                    <span class="label">Power On Hours:</span>
                    <span class="value">${device.power_on_hours || 'N/A'}</span>
                </div>
                <div class="smart-row">
                    <span class="label">Power Cycles:</span>
                    <span class="value">${device.power_cycle_count || 'N/A'}</span>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

// Update historical data
function updateHistoricalData(ioStats) {
    if (!ioStats || ioStats.length === 0) return;

    const now = new Date().toLocaleTimeString();
    historicalData.labels.push(now);

    ioStats.forEach(stat => {
        if (!historicalData.readSpeeds[stat.disk]) {
            historicalData.readSpeeds[stat.disk] = [];
            historicalData.writeSpeeds[stat.disk] = [];
            historicalData.readIOPS[stat.disk] = [];
            historicalData.writeIOPS[stat.disk] = [];
        }

        historicalData.readSpeeds[stat.disk].push(stat.read_speed_mbps);
        historicalData.writeSpeeds[stat.disk].push(stat.write_speed_mbps);
        historicalData.readIOPS[stat.disk].push(stat.iops_read);
        historicalData.writeIOPS[stat.disk].push(stat.iops_write);
    });

    // Keep only last N data points
    if (historicalData.labels.length > HISTORY_LENGTH) {
        historicalData.labels.shift();
        Object.keys(historicalData.readSpeeds).forEach(disk => {
            historicalData.readSpeeds[disk].shift();
            historicalData.writeSpeeds[disk].shift();
            historicalData.readIOPS[disk].shift();
            historicalData.writeIOPS[disk].shift();
        });
    }

    updateHistoricalCharts();
}

// Update historical charts
function updateHistoricalCharts() {
    const colors = [
        'rgba(37, 99, 235, 1)',
        'rgba(6, 182, 212, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(168, 85, 247, 1)'
    ];

    // Speed trend chart
    charts.historical.data.labels = historicalData.labels;
    charts.historical.data.datasets = [];

    let colorIndex = 0;
    Object.keys(historicalData.readSpeeds).forEach(disk => {
        charts.historical.data.datasets.push({
            label: `${disk} Read`,
            data: historicalData.readSpeeds[disk],
            borderColor: colors[colorIndex % colors.length],
            backgroundColor: colors[colorIndex % colors.length].replace('1)', '0.1)'),
            borderWidth: 2,
            fill: false
        });
        colorIndex++;
    });

    charts.historical.update();

    // IOPS trend chart
    charts.iopsTrend.data.labels = historicalData.labels;
    charts.iopsTrend.data.datasets = [];

    colorIndex = 0;
    Object.keys(historicalData.readIOPS).forEach(disk => {
        charts.iopsTrend.data.datasets.push({
            label: `${disk} Read IOPS`,
            data: historicalData.readIOPS[disk],
            borderColor: colors[colorIndex % colors.length],
            backgroundColor: colors[colorIndex % colors.length].replace('1)', '0.1)'),
            borderWidth: 2,
            fill: false
        });
        colorIndex++;
    });

    charts.iopsTrend.update();
}

// Update last update time
function updateLastUpdateTime() {
    const now = new Date();
    document.getElementById('last-update').textContent =
        `Last Update: ${now.toLocaleTimeString()}`;
}

// Start auto-refresh
function startAutoRefresh() {
    setInterval(fetchAllData, REFRESH_INTERVAL);
}

// Show error message
function showError(message) {
    console.error(message);
    // You could add a toast notification here
}
