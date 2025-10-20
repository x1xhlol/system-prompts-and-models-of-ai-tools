import psutil
import time
import platform
from datetime import datetime

class StorageMetricsCollector:
    """Collects comprehensive storage device metrics"""

    def __init__(self):
        self.previous_io = {}
        self.last_update = time.time()

    def get_disk_partitions(self):
        """Get all disk partitions with their details"""
        partitions = []
        for partition in psutil.disk_partitions(all=False):
            try:
                usage = psutil.disk_usage(partition.mountpoint)
                partitions.append({
                    'device': partition.device,
                    'mountpoint': partition.mountpoint,
                    'fstype': partition.fstype,
                    'total': usage.total,
                    'used': usage.used,
                    'free': usage.free,
                    'percent': usage.percent,
                    'total_gb': round(usage.total / (1024**3), 2),
                    'used_gb': round(usage.used / (1024**3), 2),
                    'free_gb': round(usage.free / (1024**3), 2)
                })
            except PermissionError:
                continue
        return partitions

    def get_io_stats(self):
        """Get I/O statistics for all disks"""
        current_time = time.time()
        time_delta = current_time - self.last_update

        io_counters = psutil.disk_io_counters(perdisk=True)
        stats = []

        for disk_name, counter in io_counters.items():
            disk_stats = {
                'disk': disk_name,
                'read_count': counter.read_count,
                'write_count': counter.write_count,
                'read_bytes': counter.read_bytes,
                'write_bytes': counter.write_bytes,
                'read_mb': round(counter.read_bytes / (1024**2), 2),
                'write_mb': round(counter.write_bytes / (1024**2), 2),
                'read_time': counter.read_time,
                'write_time': counter.write_time,
            }

            # Calculate rates if we have previous data
            if disk_name in self.previous_io and time_delta > 0:
                prev = self.previous_io[disk_name]
                disk_stats['read_speed_mbps'] = round(
                    (counter.read_bytes - prev['read_bytes']) / (1024**2) / time_delta, 2
                )
                disk_stats['write_speed_mbps'] = round(
                    (counter.write_bytes - prev['write_bytes']) / (1024**2) / time_delta, 2
                )
                disk_stats['iops_read'] = round(
                    (counter.read_count - prev['read_count']) / time_delta, 2
                )
                disk_stats['iops_write'] = round(
                    (counter.write_count - prev['write_count']) / time_delta, 2
                )
            else:
                disk_stats['read_speed_mbps'] = 0
                disk_stats['write_speed_mbps'] = 0
                disk_stats['iops_read'] = 0
                disk_stats['iops_write'] = 0

            self.previous_io[disk_name] = {
                'read_bytes': counter.read_bytes,
                'write_bytes': counter.write_bytes,
                'read_count': counter.read_count,
                'write_count': counter.write_count
            }

            stats.append(disk_stats)

        self.last_update = current_time
        return stats

    def get_smart_data(self):
        """Get SMART data for disks (requires root/admin privileges)"""
        smart_data = []
        try:
            from pySMART import DeviceList
            devlist = DeviceList()
            for device in devlist.devices:
                if device:
                    smart_info = {
                        'name': device.name,
                        'model': device.model,
                        'serial': device.serial,
                        'capacity': device.capacity,
                        'temperature': device.temperature,
                        'health': device.assessment,
                        'power_on_hours': None,
                        'power_cycle_count': None
                    }

                    # Extract specific SMART attributes
                    if device.attributes:
                        for attr in device.attributes:
                            if attr and hasattr(attr, 'name'):
                                if 'Power_On_Hours' in attr.name:
                                    smart_info['power_on_hours'] = attr.raw
                                elif 'Power_Cycle_Count' in attr.name:
                                    smart_info['power_cycle_count'] = attr.raw

                    smart_data.append(smart_info)
        except Exception as e:
            # SMART data requires elevated privileges, return empty if not available
            return {'error': str(e), 'message': 'SMART data requires root/admin privileges'}

        return smart_data

    def get_system_info(self):
        """Get general system information"""
        boot_time = datetime.fromtimestamp(psutil.boot_time())
        uptime = datetime.now() - boot_time

        return {
            'platform': platform.system(),
            'platform_release': platform.release(),
            'platform_version': platform.version(),
            'architecture': platform.machine(),
            'hostname': platform.node(),
            'boot_time': boot_time.strftime("%Y-%m-%d %H:%M:%S"),
            'uptime_days': uptime.days,
            'uptime_hours': uptime.seconds // 3600,
            'uptime_minutes': (uptime.seconds % 3600) // 60
        }

    def get_all_metrics(self):
        """Get all storage metrics in one call"""
        return {
            'timestamp': datetime.now().isoformat(),
            'system_info': self.get_system_info(),
            'partitions': self.get_disk_partitions(),
            'io_stats': self.get_io_stats(),
            'smart_data': self.get_smart_data()
        }
