#!/usr/bin/env python3
"""
N8N AI Integration Processor
Processes n8n workflows and integrates them with brain technology
"""

import json
import os
import glob
from pathlib import Path
from typing import Dict, List, Any, Optional
import re
from datetime import datetime

class N8NWorkflowProcessor:
    def __init__(self, workflows_path: str = "../n8n-workflows/workflows"):
        self.workflows_path = Path(workflows_path)
        self.workflows = []
        self.brain_tech_version = "2025.07.31"
        self.neural_networks = {
            'pattern_recognition': NeuralPatternRecognition(),
            'workflow_generation': WorkflowGeneration(),
            'adaptive_learning': AdaptiveLearningSystem(),
            'brain_interface': BrainComputerInterface()
        }
        self.categories = {
            'ai_ml': ['OpenAI', 'Anthropic', 'Hugging Face', 'AI', 'ML', 'GPT', 'Claude'],
            'communication': ['Telegram', 'Discord', 'Slack', 'WhatsApp', 'Email', 'Gmail'],
            'data_processing': ['PostgreSQL', 'MySQL', 'Airtable', 'Google Sheets', 'Database'],
            'automation': ['Webhook', 'Schedule', 'Manual', 'Trigger', 'Automation'],
            'integration': ['HTTP', 'API', 'GraphQL', 'REST', 'Integration'],
            'social_media': ['LinkedIn', 'Twitter', 'Facebook', 'Instagram', 'Social'],
            'cloud_storage': ['Google Drive', 'Dropbox', 'OneDrive', 'Cloud Storage'],
            'project_management': ['Jira', 'Monday.com', 'Asana', 'Project Management'],
            'crm_sales': ['Salesforce', 'HubSpot', 'CRM', 'Sales'],
            'ecommerce': ['Shopify', 'WooCommerce', 'E-commerce', 'Retail']
        }

    def load_workflows(self) -> List[Dict]:
        """Load all n8n workflows from the workflows directory"""
        if not self.workflows_path.exists():
            print(f"❌ Workflows directory not found: {self.workflows_path}")
            return []

        workflow_files = list(self.workflows_path.glob("*.json"))
        print(f"📁 Found {len(workflow_files)} workflow files")

        processed_workflows = []
        for file_path in workflow_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    workflow_data = json.load(f)
                
                processed_workflow = self.process_workflow(workflow_data, file_path.name)
                if processed_workflow:
                    processed_workflows.append(processed_workflow)
                    
            except Exception as e:
                print(f"⚠️ Error processing {file_path.name}: {e}")

        self.workflows = processed_workflows
        print(f"✅ Successfully processed {len(self.workflows)} workflows")
        return processed_workflows

    def process_workflow(self, workflow_data: Dict, filename: str) -> Optional[Dict]:
        """Process a single workflow and extract relevant information"""
        try:
            # Extract basic workflow information
            workflow_info = {
                'id': self.extract_workflow_id(filename),
                'filename': filename,
                'name': self.extract_workflow_name(workflow_data, filename),
                'description': self.extract_description(workflow_data),
                'category': self.categorize_workflow(workflow_data, filename),
                'nodes': self.count_nodes(workflow_data),
                'trigger_type': self.detect_trigger_type(workflow_data),
                'complexity': self.assess_complexity(workflow_data),
                'integrations': self.extract_integrations(workflow_data),
                'active': self.is_workflow_active(workflow_data),
                'brain_tech_enabled': self.check_brain_tech_compatibility(workflow_data),
                'neural_patterns': self.analyze_neural_patterns(workflow_data),
                'created_at': datetime.now().isoformat(),
                'brain_tech_version': self.brain_tech_version
            }

            return workflow_info

        except Exception as e:
            print(f"⚠️ Error processing workflow {filename}: {e}")
            return None

    def extract_workflow_id(self, filename: str) -> int:
        """Extract workflow ID from filename"""
        match = re.search(r'(\d+)_', filename)
        return int(match.group(1)) if match else 0

    def extract_workflow_name(self, workflow_data: Dict, filename: str) -> str:
        """Extract a meaningful name from the workflow"""
        # Try to get name from workflow data
        if 'name' in workflow_data:
            return workflow_data['name']
        
        # Extract from filename
        name_parts = filename.replace('.json', '').split('_')
        if len(name_parts) > 1:
            # Remove the ID and create a readable name
            name_parts = name_parts[1:]
            return ' '.join(name_parts).title()
        
        return filename.replace('.json', '')

    def extract_description(self, workflow_data: Dict) -> str:
        """Extract description from workflow data"""
        if 'description' in workflow_data:
            return workflow_data['description']
        
        # Generate description based on nodes
        nodes = workflow_data.get('nodes', [])
        if nodes:
            node_types = [node.get('type', '') for node in nodes]
            unique_types = list(set(node_types))
            return f"Workflow with {len(nodes)} nodes including: {', '.join(unique_types[:3])}"
        
        return "N8N workflow automation"

    def categorize_workflow(self, workflow_data: Dict, filename: str) -> str:
        """Categorize workflow based on content and filename"""
        text_to_analyze = filename.lower() + ' ' + self.extract_description(workflow_data).lower()
        
        for category, keywords in self.categories.items():
            for keyword in keywords:
                if keyword.lower() in text_to_analyze:
                    return category
        
        return 'automation'  # Default category

    def count_nodes(self, workflow_data: Dict) -> int:
        """Count the number of nodes in the workflow"""
        nodes = workflow_data.get('nodes', [])
        return len(nodes)

    def detect_trigger_type(self, workflow_data: Dict) -> str:
        """Detect the trigger type of the workflow"""
        nodes = workflow_data.get('nodes', [])
        
        for node in nodes:
            node_type = node.get('type', '').lower()
            if 'webhook' in node_type:
                return 'Webhook'
            elif 'schedule' in node_type:
                return 'Scheduled'
            elif 'manual' in node_type:
                return 'Manual'
            elif 'trigger' in node_type:
                return 'Trigger'
        
        return 'Manual'  # Default trigger type

    def assess_complexity(self, workflow_data: Dict) -> str:
        """Assess workflow complexity based on node count and types"""
        node_count = self.count_nodes(workflow_data)
        
        if node_count <= 5:
            return 'Low'
        elif node_count <= 15:
            return 'Medium'
        else:
            return 'High'

    def extract_integrations(self, workflow_data: Dict) -> List[str]:
        """Extract integrations used in the workflow"""
        nodes = workflow_data.get('nodes', [])
        integrations = set()
        
        for node in nodes:
            node_type = node.get('type', '')
            if node_type:
                # Clean up node type name
                integration = node_type.replace('n8n-nodes-', '').replace('-', ' ').title()
                integrations.add(integration)
        
        return list(integrations)

    def is_workflow_active(self, workflow_data: Dict) -> bool:
        """Check if workflow is active"""
        return workflow_data.get('active', False)

    def check_brain_tech_compatibility(self, workflow_data: Dict) -> bool:
        """Check if workflow is compatible with brain technology"""
        description = self.extract_description(workflow_data).lower()
        brain_tech_keywords = ['ai', 'ml', 'neural', 'cognitive', 'brain', 'intelligence']
        
        return any(keyword in description for keyword in brain_tech_keywords)

    def analyze_neural_patterns(self, workflow_data: Dict) -> Dict:
        """Analyze neural patterns in the workflow"""
        nodes = workflow_data.get('nodes', [])
        patterns = {
            'decision_making': self.analyze_decision_patterns(nodes),
            'data_flow': self.analyze_data_flow_patterns(nodes),
            'automation_level': self.analyze_automation_level(nodes),
            'integration_complexity': self.analyze_integration_complexity(nodes)
        }
        return patterns

    def analyze_decision_patterns(self, nodes: List[Dict]) -> str:
        """Analyze decision-making patterns"""
        decision_nodes = [node for node in nodes if 'if' in node.get('type', '').lower() or 'switch' in node.get('type', '').lower()]
        
        if len(decision_nodes) > 3:
            return 'Complex Decision Tree'
        elif len(decision_nodes) > 1:
            return 'Multi-Path Decision'
        elif len(decision_nodes) == 1:
            return 'Simple Decision'
        else:
            return 'Linear Flow'

    def analyze_data_flow_patterns(self, nodes: List[Dict]) -> str:
        """Analyze data flow patterns"""
        data_nodes = [node for node in nodes if any(keyword in node.get('type', '').lower() for keyword in ['data', 'transform', 'aggregate'])]
        
        if len(data_nodes) > 5:
            return 'Complex Data Pipeline'
        elif len(data_nodes) > 2:
            return 'Multi-Stage Data Processing'
        else:
            return 'Simple Data Flow'

    def analyze_automation_level(self, nodes: List[Dict]) -> str:
        """Analyze automation level"""
        automation_nodes = [node for node in nodes if any(keyword in node.get('type', '').lower() for keyword in ['automation', 'trigger', 'webhook'])]
        
        if len(automation_nodes) > 3:
            return 'High Automation'
        elif len(automation_nodes) > 1:
            return 'Medium Automation'
        else:
            return 'Low Automation'

    def analyze_integration_complexity(self, nodes: List[Dict]) -> str:
        """Analyze integration complexity"""
        external_nodes = [node for node in nodes if any(keyword in node.get('type', '').lower() for keyword in ['http', 'api', 'webhook', 'external'])]
        
        if len(external_nodes) > 5:
            return 'Multi-Service Integration'
        elif len(external_nodes) > 2:
            return 'Multi-API Integration'
        else:
            return 'Simple Integration'

    def generate_brain_tech_enhancements(self) -> List[Dict]:
        """Generate brain technology enhanced workflows"""
        enhanced_workflows = []
        
        for workflow in self.workflows:
            if workflow['brain_tech_enabled']:
                enhanced_workflow = self.create_brain_tech_enhancement(workflow)
                enhanced_workflows.append(enhanced_workflow)
        
        return enhanced_workflows

    def create_brain_tech_enhancement(self, original_workflow: Dict) -> Dict:
        """Create a brain technology enhanced version of a workflow"""
        enhanced_workflow = original_workflow.copy()
        enhanced_workflow['id'] = f"brain_enhanced_{original_workflow['id']}"
        enhanced_workflow['name'] = f"Brain-Enhanced {original_workflow['name']}"
        enhanced_workflow['description'] = f"Neural network enhanced version of {original_workflow['name']} with adaptive learning capabilities"
        enhanced_workflow['category'] = 'ai_ml'
        enhanced_workflow['brain_tech_enabled'] = True
        enhanced_workflow['neural_enhancements'] = {
            'pattern_recognition': True,
            'adaptive_learning': True,
            'cognitive_mapping': True,
            'neural_optimization': True
        }
        
        return enhanced_workflow

    def export_processed_data(self, output_file: str = "n8n_processed_workflows.json"):
        """Export processed workflow data"""
        export_data = {
            'workflows': self.workflows,
            'brain_tech_version': self.brain_tech_version,
            'neural_networks': list(self.neural_networks.keys()),
            'categories': self.categories,
            'total_workflows': len(self.workflows),
            'brain_tech_enabled': len([w for w in self.workflows if w['brain_tech_enabled']]),
            'exported_at': datetime.now().isoformat()
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Exported processed data to {output_file}")

    def generate_statistics(self) -> Dict:
        """Generate comprehensive statistics"""
        stats = {
            'total_workflows': len(self.workflows),
            'active_workflows': len([w for w in self.workflows if w['active']]),
            'brain_tech_enabled': len([w for w in self.workflows if w['brain_tech_enabled']]),
            'average_nodes': sum(w['nodes'] for w in self.workflows) / len(self.workflows) if self.workflows else 0,
            'complexity_distribution': {},
            'category_distribution': {},
            'trigger_distribution': {},
            'integration_usage': {}
        }
        
        # Calculate distributions
        for workflow in self.workflows:
            # Complexity distribution
            complexity = workflow['complexity']
            stats['complexity_distribution'][complexity] = stats['complexity_distribution'].get(complexity, 0) + 1
            
            # Category distribution
            category = workflow['category']
            stats['category_distribution'][category] = stats['category_distribution'].get(category, 0) + 1
            
            # Trigger distribution
            trigger = workflow['trigger_type']
            stats['trigger_distribution'][trigger] = stats['trigger_distribution'].get(trigger, 0) + 1
            
            # Integration usage
            for integration in workflow['integrations']:
                stats['integration_usage'][integration] = stats['integration_usage'].get(integration, 0) + 1
        
        return stats

# Brain Technology Classes
class NeuralPatternRecognition:
    def __init__(self):
        self.type = 'convolutional'
        self.status = 'active'
        self.capabilities = ['pattern_detection', 'workflow_analysis', 'neural_mapping']

class WorkflowGeneration:
    def __init__(self):
        self.type = 'generative'
        self.status = 'active'
        self.capabilities = ['workflow_creation', 'ai_enhancement', 'neural_optimization']

class AdaptiveLearningSystem:
    def __init__(self):
        self.type = 'reinforcement'
        self.status = 'active'
        self.capabilities = ['real_time_adaptation', 'learning_optimization', 'performance_improvement']

class BrainComputerInterface:
    def __init__(self):
        self.type = 'neural_interface'
        self.status = 'active'
        self.capabilities = ['neural_connectivity', 'brain_tech_integration', 'cognitive_enhancement']

def main():
    """Main function to process n8n workflows"""
    print("🧠 N8N AI Integration Processor")
    print("=" * 50)
    
    # Initialize processor
    processor = N8NWorkflowProcessor()
    
    # Load and process workflows
    print("📁 Loading n8n workflows...")
    workflows = processor.load_workflows()
    
    if not workflows:
        print("❌ No workflows found or processed")
        return
    
    # Generate statistics
    print("📊 Generating statistics...")
    stats = processor.generate_statistics()
    
    print(f"\n📈 Workflow Statistics:")
    print(f"   Total Workflows: {stats['total_workflows']}")
    print(f"   Active Workflows: {stats['active_workflows']}")
    print(f"   Brain Tech Enabled: {stats['brain_tech_enabled']}")
    print(f"   Average Nodes: {stats['average_nodes']:.1f}")
    
    print(f"\n🏷️ Category Distribution:")
    for category, count in sorted(stats['category_distribution'].items(), key=lambda x: x[1], reverse=True):
        print(f"   {category}: {count}")
    
    print(f"\n🔧 Trigger Distribution:")
    for trigger, count in sorted(stats['trigger_distribution'].items(), key=lambda x: x[1], reverse=True):
        print(f"   {trigger}: {count}")
    
    print(f"\n🔗 Top Integrations:")
    top_integrations = sorted(stats['integration_usage'].items(), key=lambda x: x[1], reverse=True)[:10]
    for integration, count in top_integrations:
        print(f"   {integration}: {count}")
    
    # Generate brain tech enhancements
    print(f"\n🧠 Generating brain technology enhancements...")
    enhanced_workflows = processor.generate_brain_tech_enhancements()
    print(f"   Generated {len(enhanced_workflows)} brain-enhanced workflows")
    
    # Export processed data
    print(f"\n📤 Exporting processed data...")
    processor.export_processed_data()
    
    print(f"\n✅ N8N AI Integration processing completed!")
    print(f"   Processed workflows: {len(workflows)}")
    print(f"   Brain tech enhancements: {len(enhanced_workflows)}")

if __name__ == "__main__":
    main() 