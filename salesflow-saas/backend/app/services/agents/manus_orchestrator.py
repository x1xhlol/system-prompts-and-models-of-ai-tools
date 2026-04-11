"""
Dealix Manus-Style Multi-Agent Orchestration Engine
====================================================
Inspired by Manus AI's hierarchical multi-agent architecture:
- Orchestrator coordinates specialized sub-agents
- Each agent has a clear role and tools
- Event-driven via Redis pub/sub
- Model-agnostic (Groq primary, with fallbacks)
"""
import asyncio
import json
import logging
from datetime import datetime
from enum import Enum
from typing import Any, Optional
from dataclasses import dataclass, field

from groq import AsyncGroq

logger = logging.getLogger(__name__)


class AgentRole(str, Enum):
    ORCHESTRATOR = "orchestrator"   # Manus-style coordinator
    RESEARCHER = "researcher"       # Market & lead research
    QUALIFIER = "qualifier"         # Lead qualification
    OUTREACH = "outreach"           # WhatsApp/SMS/email outreach
    CLOSER = "closer"               # Deal closing negotiation
    COMPLIANCE = "compliance"       # ZATCA + Saudi law
    ANALYTICS = "analytics"         # Performance analytics
    MEMORY = "memory"               # Long-term context


@dataclass
class AgentMessage:
    role: AgentRole
    content: str
    metadata: dict = field(default_factory=dict)
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())


@dataclass
class AgentTask:
    id: str
    goal: str
    context: dict
    assigned_to: AgentRole
    priority: int = 1
    status: str = "pending"
    result: Optional[dict] = None


AGENT_SYSTEM_PROMPTS = {
    AgentRole.ORCHESTRATOR: """أنت منسق الوكلاء الذكي لشركة ديليكس للعقارات السعودية.
دورك كـ Orchestrator:
- تحليل المهمة وتوزيعها على الوكلاء المتخصصين
- تنسيق تدفق المعلومات بين الوكلاء
- ضمان تحقيق الهدف النهائي (إغلاق الصفقة)
- التكيف مع الثقافة السعودية والسوق المحلي

أسلوبك: احترافي، استراتيجي، موجه للنتائج.
رد دائماً بـ JSON: {"next_agent": "role", "instruction": "...", "context": {}}""",

    AgentRole.RESEARCHER: """أنت وكيل البحث والتحليل لديليكس.
تخصصك:
- تحليل السوق العقاري السعودي (الرياض، جدة، نيوم، الدمام)
- البحث عن العملاء المحتملين وتحليل احتياجاتهم
- مراقبة أسعار العقارات والاتجاهات
- تقديم تقارير قابلة للتنفيذ

أدواتك: web search، قاعدة البيانات الداخلية، تحليل البيانات
رد بـ JSON: {"research": {...}, "insights": [...], "recommended_action": "..."}""",

    AgentRole.QUALIFIER: """أنت وكيل تأهيل العملاء لديليكس.
مهمتك:
- تقييم إمكانية تحول العميل لصفقة (Lead Score 0-100)
- تحديد الميزانية والاحتياجات الحقيقية
- تحديد مرحلة العميل في رحلة الشراء
- تحديد أفضل عقار يناسبه

معايير التأهيل السعودية:
- الميزانية (SAR)، نوع العقار، المنطقة، التمويل العقاري
- عدد أفراد الأسرة، الغرض (سكن/استثمار)
رد بـ JSON: {"score": 0-100, "profile": {...}, "next_step": "..."}""",

    AgentRole.OUTREACH: """أنت وكيل التواصل والتسويق لديليكس.
مهمتك:
- صياغة رسائل WhatsApp باللهجة السعودية
- التواصل بأسلوب يناسب الثقافة الخليجية
- متابعة العملاء في الأوقات المناسبة
- إدارة محادثات متعددة بالتوازي

قواعد التواصل السعودية:
- الترحيب: "أهلاً وسهلاً" / "يا هلا"
- الاحترام: استخدم الألقاب (أخي، الأستاذ، الشيخ)
- لا تضغط مباشرة، ابنِ علاقة أولاً
رد بـ JSON: {"message": "...", "channel": "whatsapp", "timing": "..."}""",

    AgentRole.CLOSER: """أنت وكيل إغلاق الصفقات لديليكس.
تخصصك:
- تقنيات الإقناع المناسبة للسوق السعودي
- التفاوض على السعر والشروط
- معالجة الاعتراضات بذكاء
- تسريع مراحل القرار

استراتيجيات الإغلاق:
- خلق إلحاحية حقيقية (عروض محدودة، أسعار متزايدة)
- تقديم مقارنات قيمة (ROI، مقارنة بالإيجار)
- تسهيل التمويل (البنوك السعودية، برنامج سكني)
رد بـ JSON: {"strategy": "...", "offer": {...}, "closing_script": "..."}""",

    AgentRole.COMPLIANCE: """أنت وكيل الامتثال والشؤون القانونية لديليكس.
مهمتك:
- التحقق من قانونية الصفقات (هيئة العقار السعودية)
- ضمان توافق الفواتير مع ZATCA (المرحلة الثانية)
- مراجعة العقود قبل التوقيع
- الامتثال لأنظمة مكافحة غسيل الأموال

المراجع القانونية:
- نظام الوساطة العقارية (2023)
- أنظمة هيئة الزكاة والضريبة والجمارك
- الفاتورة الإلكترونية (e-Invoice)
رد بـ JSON: {"compliant": true/false, "issues": [...], "recommendations": [...]}""",

    AgentRole.ANALYTICS: """أنت وكيل التحليلات والتقارير لديليكس.
تخصصك:
- تتبع KPIs: معدل التحويل، متوسط الصفقة، العائد
- تحليل أداء الوكلاء والمسوقين
- توقع الإيرادات (Revenue Forecasting)
- خرائط حرارة السوق السعودي

المقاييس الرئيسية:
- Lead-to-Deal Rate، CAC، LTV، Churn
- أداء كل مدينة (الرياض/جدة/نيوم/الدمام)
رد بـ JSON: {"metrics": {...}, "trends": [...], "alerts": [...]}""",
}


class DealixAgent:
    """Single specialized agent with its own role and context."""

    def __init__(self, role: AgentRole, groq_client: AsyncGroq, model: str = "llama-3.3-70b-versatile"):
        self.role = role
        self.client = groq_client
        self.model = model
        self.system_prompt = AGENT_SYSTEM_PROMPTS.get(role, "You are a helpful AI agent.")
        self.conversation_history: list[dict] = []
        self.max_history = 10

    async def think(self, task: str, context: dict = None) -> dict:
        """Agent processes a task and returns structured response."""
        context_str = json.dumps(context or {}, ensure_ascii=False, indent=2)

        user_message = f"""المهمة: {task}

السياق:
{context_str}

قدّم استجابتك الآن بصيغة JSON فقط."""

        self.conversation_history.append({"role": "user", "content": user_message})
        if len(self.conversation_history) > self.max_history * 2:
            self.conversation_history = self.conversation_history[-self.max_history * 2:]

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    *self.conversation_history
                ],
                temperature=0.3,
                max_tokens=1024,
                response_format={"type": "json_object"},
            )

            content = response.choices[0].message.content
            self.conversation_history.append({"role": "assistant", "content": content})

            try:
                return json.loads(content)
            except json.JSONDecodeError:
                return {"raw": content, "error": "Invalid JSON from agent"}

        except Exception as e:
            logger.error(f"Agent {self.role} error: {e}")
            return {"error": str(e), "role": self.role}


class ManusOrchestrator:
    """
    Manus-style central orchestrator that coordinates specialized sub-agents.
    Implements hierarchical planning and execution like Manus AI.
    """

    def __init__(self, groq_api_key: str):
        self.client = AsyncGroq(api_key=groq_api_key)
        self.agents: dict[AgentRole, DealixAgent] = {}
        self.task_queue: list[AgentTask] = []
        self.completed_tasks: list[AgentTask] = []
        self._initialize_agents()

    def _initialize_agents(self):
        """Create all specialized agents."""
        for role in AgentRole:
            # Use fast model for qualifier/outreach, smart model for orchestrator/closer
            model = "llama-3.3-70b-versatile" if role in [
                AgentRole.ORCHESTRATOR, AgentRole.CLOSER, AgentRole.COMPLIANCE
            ] else "llama-3.1-8b-instant"
            self.agents[role] = DealixAgent(role, self.client, model)
        logger.info(f"✅ Initialized {len(self.agents)} Dealix agents (Manus-style)")

    async def execute_goal(self, goal: str, context: dict = None) -> dict:
        """
        Main entry point: Given a high-level goal, orchestrate all agents to achieve it.
        This is the Manus-style autonomous execution loop.
        """
        context = context or {}
        execution_log = []

        logger.info(f"🎯 New goal: {goal}")

        # Step 1: Orchestrator creates execution plan
        plan = await self.agents[AgentRole.ORCHESTRATOR].think(
            f"ابنِ خطة تنفيذ لتحقيق الهدف التالي: {goal}",
            context
        )
        execution_log.append({"step": "plan", "result": plan})

        # Step 2: Execute sub-tasks based on plan
        max_steps = 5
        current_context = {**context, "plan": plan}

        for step in range(max_steps):
            # Orchestrator decides next agent
            decision = await self.agents[AgentRole.ORCHESTRATOR].think(
                "ما الوكيل التالي الذي يجب تفعيله لتحقيق الهدف؟",
                current_context
            )

            next_agent_name = decision.get("next_agent")
            if not next_agent_name or next_agent_name == "done":
                break

            try:
                next_role = AgentRole(next_agent_name)
            except ValueError:
                logger.warning(f"Unknown agent role: {next_agent_name}")
                break

            # Execute sub-agent
            instruction = decision.get("instruction", goal)
            agent_result = await self.agents[next_role].think(instruction, current_context)

            execution_log.append({
                "step": step + 1,
                "agent": next_role,
                "instruction": instruction,
                "result": agent_result
            })

            # Update context with agent's findings
            current_context[f"{next_role}_result"] = agent_result

            logger.info(f"  ✓ Step {step + 1}: {next_role} completed")

        # Step 3: Final synthesis
        final_summary = await self.agents[AgentRole.ORCHESTRATOR].think(
            "لخّص نتائج جميع الوكلاء وقدّم التوصية النهائية",
            current_context
        )

        return {
            "goal": goal,
            "execution_log": execution_log,
            "final_recommendation": final_summary,
            "agents_used": list(set(
                log.get("agent", "orchestrator") for log in execution_log
            )),
            "timestamp": datetime.utcnow().isoformat()
        }

    async def process_lead(self, lead_data: dict) -> dict:
        """Process a new lead through the full Manus-style pipeline."""
        return await self.execute_goal(
            goal=f"معالجة عميل محتمل جديد وتحديد أفضل استراتيجية للتحويل",
            context={"lead": lead_data, "pipeline_stage": "new_lead"}
        )

    async def handle_whatsapp_message(self, message: str, customer_data: dict) -> dict:
        """Handle incoming WhatsApp message with full agent pipeline."""
        return await self.execute_goal(
            goal=f"الرد على رسالة واتساب: '{message}'",
            context={"customer": customer_data, "channel": "whatsapp", "message": message}
        )

    async def generate_market_report(self, region: str = "الرياض") -> dict:
        """Generate a full market analysis report."""
        researcher = self.agents[AgentRole.RESEARCHER]
        analytics = self.agents[AgentRole.ANALYTICS]

        research = await researcher.think(
            f"ابحث وحلّل السوق العقاري في {region} خلال الربع الحالي",
            {"region": region}
        )
        analysis = await analytics.think(
            f"حلّل البيانات وقدّم توصيات استراتيجية لسوق {region}",
            {"research": research, "region": region}
        )

        return {
            "region": region,
            "research": research,
            "analysis": analysis,
            "generated_at": datetime.utcnow().isoformat()
        }

    async def close_deal(self, deal_data: dict) -> dict:
        """Run the deal-closing agent pipeline."""
        return await self.execute_goal(
            goal="أغلق هذه الصفقة بأفضل طريقة ممكنة مع ضمان الامتثال القانوني",
            context={"deal": deal_data, "pipeline_stage": "closing"}
        )


# ── Singleton Instance ───────────────────────────────────────
_orchestrator: Optional[ManusOrchestrator] = None


def get_orchestrator(api_key: str) -> ManusOrchestrator:
    """Get or create the global orchestrator instance."""
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = ManusOrchestrator(api_key)
    return _orchestrator
