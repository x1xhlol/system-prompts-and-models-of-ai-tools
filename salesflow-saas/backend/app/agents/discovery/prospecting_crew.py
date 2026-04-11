import os
import json
import logging
from typing import Dict, Any

try:
    from crewai import Agent, Task, Crew, Process
    from langchain_anthropic import ChatAnthropic
    CREWAI_AVAILABLE = True
except ImportError:
    CREWAI_AVAILABLE = False

from app.agents.memory_layer import empire_memory

logger = logging.getLogger("dealix.prospecting_crew")


class ProspectingCrewRunner:
    """
    Layer 2: Specialized CrewAI Squad for deeply researching and qualifying leads.
    """
    def __init__(self):
        self.llm = self._init_llm()

    def _init_llm(self):
        if not CREWAI_AVAILABLE:
            return None
        # Default to Claude 3 Haiku for speed/cost, Opus/Sonnet if needed for complexity
        api_key = os.getenv("ANTHROPIC_API_KEY", "")
        if not api_key:
            # Fallback to GROQ if Anthropic is not available, though langchain_anthropic specifically requires Anthropic
            # We will return None and the Crew will fail gracefully or we handle it.
            return None
            
        try:
            return ChatAnthropic(
                model="claude-3-haiku-20240307", 
                temperature=0.4,
                anthropic_api_key=api_key
            )
        except Exception as e:
            logger.error(f"Failed to initialize ChatAnthropic: {e}")
            return None

    def run_enrichment(self, lead_data: Dict) -> Dict:
        """
        Executes the Crew to enrich a lead.
        """
        company_name = lead_data.get("name", "Unknown Company")
        sector = lead_data.get("category", "")
        city = lead_data.get("city", "")

        if not CREWAI_AVAILABLE or not self.llm:
            logger.warning("CrewAI or Anthropic LLM not available. Returning empty enrichment.")
            return {}

        # 1. Inject Mem0 Self-Healing Memory
        mem_context = empire_memory.get_context(company_name, context_type="discovery")

        # 2. Define Agents
        intent_detector = Agent(
            role="Enterprise Intent Detector",
            goal=f"Analyze intent signals for {company_name} to see if they are ready to buy AI automation services.",
            backstory="You are a brilliant data analyst who spots buying signals across public footprints.",
            verbose=False,
            allow_delegation=False,
            llm=self.llm
        )

        researcher = Agent(
            role="Enterprise Account Researcher",
            goal=f"Deeply research {company_name} (Sector: {sector}, City: {city}) and extract key pain points and budget markers.",
            backstory="You are an elite B2B SDR with a 99% accuracy rate. You look for inefficiencies.",
            verbose=False,
            allow_delegation=False,
            llm=self.llm
        )

        personalizer = Agent(
            role="Multi-Channel Personalizer",
            goal="Craft the perfect outreach strategy and opener based on research and existing memory context.",
            backstory="You are a persuasive copywriter mastering enterprise psychology. You write to C-levels.",
            verbose=False,
            allow_delegation=False,
            llm=self.llm
        )

        # 3. Define Tasks
        task1 = Task(
            description=f"Analyze {company_name}. Is there growth or struggle? Return a short summary.",
            agent=intent_detector,
            expected_output="A short paragraph on company growth and potential intent."
        )

        task2 = Task(
            description=f"Extract pain points for {company_name} given previous insights. Memory Context: {mem_context}",
            agent=researcher,
            expected_output="A bulleted list of 3 major pain points assuming they lack AI automation.",
            context=[task1]
        )

        task3 = Task(
            description=f"Write a highly personalized 2-sentence opener for WhatsApp/Email addressed to the CEO of {company_name}. Use the pain points extracted.",
            agent=personalizer,
            expected_output="A compelling personalized message opener.",
            context=[task2]
        )

        # 4. Run the Crew
        try:
            crew = Crew(
                agents=[intent_detector, researcher, personalizer],
                tasks=[task1, task2, task3],
                process=Process.sequential
            )
            result = crew.kickoff()
            
            final_output = str(result)
            
            # Store in Episodic Memory
            empire_memory.add_insight(
                company_name=company_name, 
                insight=f"Generated Personalized Opener: {final_output}"
            )
            
            return {
                "personalized_opener": final_output,
                "crew_enrichment_success": True
            }
        except Exception as e:
            logger.error(f"CrewAI execution failed: {e}")
            return {"crew_enrichment_error": str(e)}

