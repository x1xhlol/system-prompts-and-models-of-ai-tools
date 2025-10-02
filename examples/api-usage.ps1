# Example: Consuming the AI Tools API with PowerShell
#
# This script demonstrates various ways to interact with the
# system-prompts-and-models-of-ai-tools API endpoints.

# Simple API client class
class AIToolsAPI {
    [string]$ApiBase

    AIToolsAPI([string]$basePath = "api") {
        $this.ApiBase = $basePath
    }

    [object] LoadJSON([string]$filename) {
        $filePath = Join-Path $this.ApiBase $filename
        $content = Get-Content -Path $filePath -Raw
        return $content | ConvertFrom-Json
    }

    [object] GetAllTools() {
        return $this.LoadJSON("index.json")
    }

    [object] GetTool([string]$slug) {
        return $this.LoadJSON("tools/$slug.json")
    }

    [object] GetByType() {
        return $this.LoadJSON("by-type.json")
    }

    [object] GetByPricing() {
        return $this.LoadJSON("by-pricing.json")
    }

    [object] GetFeatures() {
        return $this.LoadJSON("features.json")
    }

    [object] GetStatistics() {
        return $this.LoadJSON("statistics.json")
    }

    [array] Search([string]$query) {
        $searchData = $this.LoadJSON("search.json")
        $queryLower = $query.ToLower()
        
        $results = @()
        foreach ($tool in $searchData.index) {
            $keywords = ($tool.keywords -join " ").ToLower()
            $name = $tool.name.ToLower()
            $desc = $tool.description.ToLower()
            
            if ($keywords -like "*$queryLower*" -or 
                $name -like "*$queryLower*" -or 
                $desc -like "*$queryLower*") {
                $results += $tool
            }
        }
        
        return $results
    }
}

function Main {
    Write-Host "🚀 AI Tools API - PowerShell Examples`n" -ForegroundColor Cyan
    Write-Host ("=" * 60) -ForegroundColor Gray

    $api = [AIToolsAPI]::new()

    # Example 1: Get all tools
    Write-Host "`n📊 Example 1: Get All Tools" -ForegroundColor Yellow
    Write-Host ("-" * 60) -ForegroundColor Gray
    $allTools = $api.GetAllTools()
    Write-Host "Total tools: $($allTools.tools.Count)"
    Write-Host "Generated: $($allTools.generated)"
    Write-Host "`nFirst 3 tools:"
    $allTools.tools[0..2] | ForEach-Object {
        Write-Host "  - $($_.name) ($($_.type)) - $($_.pricing)"
    }

    # Example 2: Get a specific tool
    Write-Host "`n🎯 Example 2: Get Specific Tool (Cursor)" -ForegroundColor Yellow
    Write-Host ("-" * 60) -ForegroundColor Gray
    $cursor = $api.GetTool("cursor")
    Write-Host "Name: $($cursor.name)"
    Write-Host "Type: $($cursor.type)"
    Write-Host "Description: $($cursor.description)"
    Write-Host "Features: $(($cursor.features[0..4] -join ', '))..."
    Write-Host "Models: $(($cursor.models[0..2] -join ', '))..."

    # Example 3: Get tools by type
    Write-Host "`n📁 Example 3: Get Tools by Type" -ForegroundColor Yellow
    Write-Host ("-" * 60) -ForegroundColor Gray
    $byType = $api.GetByType()
    $byType.by_type.PSObject.Properties | ForEach-Object {
        $type = $_.Name
        $tools = $_.Value
        Write-Host "$type`: $($tools.Count) tools"
        $examples = ($tools[0..2] | ForEach-Object { $_.name }) -join ", "
        Write-Host "  Examples: $examples"
    }

    # Example 4: Get tools by pricing
    Write-Host "`n💰 Example 4: Get Tools by Pricing" -ForegroundColor Yellow
    Write-Host ("-" * 60) -ForegroundColor Gray
    $byPricing = $api.GetByPricing()
    $byPricing.by_pricing.PSObject.Properties | ForEach-Object {
        $pricing = $_.Name
        $tools = $_.Value
        Write-Host "$pricing`: $($tools.Count) tools"
    }

    # Example 5: Get feature matrix
    Write-Host "`n🔧 Example 5: Feature Adoption Matrix" -ForegroundColor Yellow
    Write-Host ("-" * 60) -ForegroundColor Gray
    $features = $api.GetFeatures()
    $featureCount = ($features.features.PSObject.Properties | Measure-Object).Count
    Write-Host "Total features tracked: $featureCount"
    Write-Host "`nMost common features:"
    $features.features.PSObject.Properties | Select-Object -First 5 | ForEach-Object {
        $name = $_.Name
        $data = $_.Value
        $adoptionRate = ($data.count / $allTools.tools.Count) * 100
        Write-Host "  - $name`: $($data.count) tools ($([math]::Round($adoptionRate, 1))%)"
    }

    # Example 6: Get statistics
    Write-Host "`n📈 Example 6: Repository Statistics" -ForegroundColor Yellow
    Write-Host ("-" * 60) -ForegroundColor Gray
    $stats = $api.GetStatistics()
    Write-Host "Total tools: $($stats.total_tools)"
    Write-Host "Total features: $($stats.total_features)"
    Write-Host "Total models: $($stats.total_models)"
    Write-Host "`nMost common type: $($stats.most_common_type.type) ($($stats.most_common_type.count) tools)"
    Write-Host "Most common pricing: $($stats.most_common_pricing.pricing) ($($stats.most_common_pricing.count) tools)"
    Write-Host "`nTop 3 features:"
    $stats.most_common_features[0..2] | ForEach-Object {
        Write-Host "  - $($_.feature): $($_.count) tools"
    }

    # Example 7: Search functionality
    Write-Host "`n🔍 Example 7: Search for 'agent' tools" -ForegroundColor Yellow
    Write-Host ("-" * 60) -ForegroundColor Gray
    $searchResults = $api.Search("agent")
    Write-Host "Found $($searchResults.Count) tools matching 'agent':"
    $searchResults[0..4] | ForEach-Object {
        Write-Host "  - $($_.name) ($($_.type))"
    }

    # Example 8: Find tools with specific features
    Write-Host "`n🎨 Example 8: Find Tools with 'Code Generation'" -ForegroundColor Yellow
    Write-Host ("-" * 60) -ForegroundColor Gray
    $toolsWithCodeGen = $allTools.tools | Where-Object { 
        $_.features -contains "Code generation" 
    }
    Write-Host "Found $($toolsWithCodeGen.Count) tools with code generation:"
    $toolsWithCodeGen[0..4] | ForEach-Object {
        Write-Host "  - $($_.name)"
    }

    # Example 9: Find free tools
    Write-Host "`n💵 Example 9: Find Free Tools" -ForegroundColor Yellow
    Write-Host ("-" * 60) -ForegroundColor Gray
    $freeTools = $allTools.tools | Where-Object { $_.pricing -eq "free" }
    Write-Host "Found $($freeTools.Count) free tools:"
    $freeTools | ForEach-Object {
        Write-Host "  - $($_.name) ($($_.type))"
    }

    # Example 10: Compare two tools
    Write-Host "`n⚖️  Example 10: Compare Cursor vs GitHub Copilot" -ForegroundColor Yellow
    Write-Host ("-" * 60) -ForegroundColor Gray
    $copilot = $api.GetTool("github-copilot")

    Write-Host "`n$($cursor.name):"
    Write-Host "  Type: $($cursor.type)"
    Write-Host "  Pricing: $($cursor.pricing)"
    Write-Host "  Features: $($cursor.features.Count) total"
    Write-Host "  Models: $($cursor.models.Count) total"

    Write-Host "`n$($copilot.name):"
    Write-Host "  Type: $($copilot.type)"
    Write-Host "  Pricing: $($copilot.pricing)"
    Write-Host "  Features: $($copilot.features.Count) total"
    Write-Host "  Models: $($copilot.models.Count) total"

    # Find unique features
    $cursorFeatures = [System.Collections.Generic.HashSet[string]]::new($cursor.features)
    $copilotFeatures = [System.Collections.Generic.HashSet[string]]::new($copilot.features)
    
    $uniqueCursor = $cursor.features | Where-Object { -not $copilotFeatures.Contains($_) }
    $uniqueCopilot = $copilot.features | Where-Object { -not $cursorFeatures.Contains($_) }
    $shared = $cursor.features | Where-Object { $copilotFeatures.Contains($_) }

    Write-Host "`nShared features: $($shared.Count)"
    Write-Host "Unique to Cursor: $($uniqueCursor.Count)"
    if ($uniqueCursor.Count -gt 0) {
        Write-Host "  Examples: $(($uniqueCursor[0..2] -join ', '))"
    }
    Write-Host "Unique to Copilot: $($uniqueCopilot.Count)"
    if ($uniqueCopilot.Count -gt 0) {
        Write-Host "  Examples: $(($uniqueCopilot[0..2] -join ', '))"
    }

    Write-Host "`n$("=" * 60)" -ForegroundColor Gray
    Write-Host "✅ Examples completed!" -ForegroundColor Green
    Write-Host "`nFor more information, see: api/README.md"
}

# Run examples
Main
