@{
    Name = "System Tools"
    Version = "1.0"
    Description = "Provides system utility commands for the AI agent"
    Author = "AI Agent Team"
    Commands = @(
        @{
            Name = "Get-SystemStatus"
            Description = "Get comprehensive system status information"
            Function = {
                param([hashtable]$Parameters)
                
                $status = @{
                    ComputerName = $env:COMPUTERNAME
                    OS = (Get-ComputerInfo).WindowsProductName
                    Version = (Get-ComputerInfo).WindowsVersion
                    Uptime = (Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
                    CPU = (Get-CimInstance Win32_Processor).Name
                    Memory = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)
                    DiskSpace = Get-WmiObject Win32_LogicalDisk | ForEach-Object {
                        [math]::Round($_.Size / 1GB, 2)
                    }
                    FreeSpace = Get-WmiObject Win32_LogicalDisk | ForEach-Object {
                        [math]::Round($_.FreeSpace / 1GB, 2)
                    }
                }
                
                return "System Status:`n" +
                       "Computer: $($status.ComputerName)`n" +
                       "OS: $($status.OS) $($status.Version)`n" +
                       "Uptime: $($status.Uptime.Days) days, $($status.Uptime.Hours) hours`n" +
                       "CPU: $($status.CPU)`n" +
                       "Memory: $($status.Memory) GB`n" +
                       "Disk Space: $($status.DiskSpace) GB`n" +
                       "Free Space: $($status.FreeSpace) GB"
            }
        },
        @{
            Name = "Get-NetworkInfo"
            Description = "Get network configuration and status"
            Function = {
                param([hashtable]$Parameters)
                
                $network = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }
                $ipConfig = Get-NetIPAddress | Where-Object { $_.AddressFamily -eq "IPv4" }
                
                $result = "Network Information:`n"
                foreach ($adapter in $network) {
                    $ip = $ipConfig | Where-Object { $_.InterfaceIndex -eq $adapter.InterfaceIndex }
                    $result += "Adapter: $($adapter.Name)`n"
                    $result += "Status: $($adapter.Status)`n"
                    $result += "IP: $($ip.IPAddress)`n"
                    $result += "Speed: $($adapter.LinkSpeed)`n`n"
                }
                
                return $result
            }
        },
        @{
            Name = "Get-ServiceStatus"
            Description = "Get status of important Windows services"
            Function = {
                param([hashtable]$Parameters)
                
                $services = @("spooler", "themes", "wsearch", "wuauserv", "bits")
                $result = "Service Status:`n"
                
                foreach ($service in $services) {
                    try {
                        $svc = Get-Service -Name $service -ErrorAction Stop
                        $status = $svc.Status
                        $color = if ($status -eq "Running") { "Green" } else { "Red" }
                        $result += "$service`: $status`n"
                    }
                    catch {
                        $result += "$service`: Not Found`n"
                    }
                }
                
                return $result
            }
        },
        @{
            Name = "Get-ProcessInfo"
            Description = "Get detailed information about running processes"
            Function = {
                param([hashtable]$Parameters)
                
                $processes = Get-Process | Sort-Object CPU -Descending | Select-Object -First 10
                $result = "Top 10 Processes by CPU:`n"
                
                foreach ($process in $processes) {
                    $cpu = [math]::Round($process.CPU, 2)
                    $memory = [math]::Round($process.WorkingSet / 1MB, 2)
                    $result += "$($process.Name): CPU=$cpu, Memory=${memory}MB`n"
                }
                
                return $result
            }
        },
        @{
            Name = "Test-Connectivity"
            Description = "Test network connectivity to common services"
            Function = {
                param([hashtable]$Parameters)
                
                $hosts = @("8.8.8.8", "1.1.1.1", "google.com", "microsoft.com")
                $result = "Connectivity Test:`n"
                
                foreach ($host in $hosts) {
                    try {
                        $ping = Test-Connection -ComputerName $host -Count 1 -Quiet
                        $status = if ($ping) { "OK" } else { "FAILED" }
                        $result += "$host`: $status`n"
                    }
                    catch {
                        $result += "$host`: ERROR`n"
                    }
                }
                
                return $result
            }
        }
    )
} 