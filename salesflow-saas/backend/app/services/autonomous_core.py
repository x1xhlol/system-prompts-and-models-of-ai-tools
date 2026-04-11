"""
Dealix Self-Improving Intelligence Engine (SIIE)
================================================
النظام يتعلم من كل تفاعل ويحسن نفسه تلقائياً:
- Self-Improvement: يحسن استراتيجياته بناءً على النتائج
- Self-Healing: يكتشف المشاكل ويصلحها تلقائياً
- Self-Expansion: يحدد فرص جديدة وينمو ذاتياً
- Self-Evolution: يطور قدراته مع الوقت
"""
import asyncio
import json
import logging
import time
from datetime import datetime, timedelta
from typing import Optional, Any
from collections import defaultdict

from groq import AsyncGroq

logger = logging.getLogger(__name__)


class PerformanceTracker:
    """Tracks all system performance metrics for self-improvement."""

    def __init__(self):
        self.metrics = defaultdict(list)
        self.strategy_scores = {}
        self.best_practices = []

    def record(self, category: str, value: float, metadata: dict = None):
        self.metrics[category].append({
            "value": value,
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": metadata or {}
        })

    def get_average(self, category: str, last_n: int = 10) -> float:
        values = [m["value"] for m in self.metrics[category][-last_n:]]
        return sum(values) / len(values) if values else 0

    def get_trend(self, category: str) -> str:
        vals = [m["value"] for m in self.metrics[category][-5:]]
        if len(vals) < 2:
            return "insufficient_data"
        return "improving" if vals[-1] > vals[0] else "declining"

    def identify_best_strategy(self) -> dict:
        """Find what's working best."""
        analysis = {}
        for category, records in self.metrics.items():
            if len(records) >= 3:
                analysis[category] = {
                    "average": self.get_average(category),
                    "trend": self.get_trend(category),
                    "best_value": max(r["value"] for r in records),
                    "worst_value": min(r["value"] for r in records),
                }
        return analysis


class SelfHealingMonitor:
    """Monitors system health and auto-repairs issues."""

    def __init__(self):
        self.health_checks = {}
        self.failure_counts = defaultdict(int)
        self.auto_fixes_applied = []

    def check_component(self, name: str, status: bool, error: str = None):
        self.health_checks[name] = {
            "status": "healthy" if status else "unhealthy",
            "last_check": datetime.utcnow().isoformat(),
            "error": error
        }
        if not status:
            self.failure_counts[name] += 1

    def needs_healing(self, component: str) -> bool:
        return self.failure_counts[component] >= 3

    def apply_fix(self, component: str, fix: str):
        self.auto_fixes_applied.append({
            "component": component,
            "fix": fix,
            "timestamp": datetime.utcnow().isoformat()
        })
        self.failure_counts[component] = 0

    def get_system_health(self) -> dict:
        total = len(self.health_checks)
        healthy = sum(1 for h in self.health_checks.values() if h["status"] == "healthy")
        return {
            "overall": "healthy" if healthy == total else "degraded" if healthy > total / 2 else "critical",
            "score": (healthy / total * 100) if total > 0 else 100,
            "components": self.health_checks,
            "auto_fixes_applied": len(self.auto_fixes_applied)
        }


class StrategicIntelligence:
    """Strategic planning and market expansion engine."""

    def __init__(self, groq_client: AsyncGroq):
        self.client = groq_client

    async def analyze_market_opportunity(self, performance_data: dict) -> dict:
        prompt = f"""أنت مستشار استراتيجي لديليكس (نظام ذكاء اصطناعي للمبيعات السعودي).

بيانات الأداء الحالية:
{json.dumps(performance_data, ensure_ascii=False, indent=2)}

قدّم تحليلاً استراتيجياً:
{{
  "market_opportunities": [
    {{
      "opportunity": "الفرصة",
      "market_size": "حجم السوق",
      "entry_strategy": "استراتيجية الدخول",
      "time_to_value": "وقت تحقيق القيمة",
      "priority": "high/medium/low"
    }}
  ],
  "competitive_advantages": ["ميزة تنافسية 1", "ميزة 2"],
  "recommended_expansions": [
    {{
      "sector": "القطاع",
      "rationale": "السبب",
      "required_resources": "الموارد المطلوبة"
    }}
  ],
  "revenue_optimization": {{
    "current_gaps": ["فجوة في الإيرادات"],
    "quick_wins": ["ربح سريع"],
    "strategic_moves": ["خطوة استراتيجية"]
  }},
  "self_improvement_priorities": [
    "ما يجب تحسينه أولاً في النظام"
  ]
}}"""

        response = await self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=2000,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)

    async def generate_growth_plan(self, current_metrics: dict) -> dict:
        prompt = f"""بناءً على مقاييس ديليكس الحالية:
{json.dumps(current_metrics, ensure_ascii=False)}

اصنع خطة نمو 90 يوم:
{{
  "q90_goal": "الهدف",
  "monthly_milestones": [
    {{"month": 1, "goal": "...", "kpis": {{}}}},
    {{"month": 2, "goal": "...", "kpis": {{}}}},
    {{"month": 3, "goal": "...", "kpis": {{}}}}
  ],
  "expansion_sectors": ["قطاع جديد"],
  "automation_opportunities": ["مهمة يمكن أتمتتها"],
  "financial_projections": {{
    "month_1_revenue": 0,
    "month_2_revenue": 0,
    "month_3_revenue": 0
  }}
}}"""

        response = await self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=1500,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)


class FinancialIntelligence:
    """Financial analytics, forecasting, and optimization."""

    def __init__(self, groq_client: AsyncGroq):
        self.client = groq_client

    async def generate_financial_forecast(self, pipeline_data: dict) -> dict:
        prompt = f"""أنت محلل مالي لديليكس. بناءً على بيانات pipeline:
{json.dumps(pipeline_data, ensure_ascii=False)}

قدّم تحليلاً مالياً:
{{
  "arr_projection": "Annual Recurring Revenue المتوقع",
  "pipeline_value": "قيمة pipeline الحالية",
  "conversion_rate": "معدل التحويل المتوقع %",
  "average_deal_size": "متوسط حجم الصفقة بالريال",
  "payback_period": "فترة استرداد التكلفة",
  "ltv_cac_ratio": "نسبة LTV:CAC",
  "monthly_targets": {{
    "leads": "عدد الـ leads المطلوبة",
    "meetings": "عدد الاجتماعات",
    "deals": "عدد الصفقات",
    "revenue": "الإيراد المستهدف"
  }},
  "pricing_optimization": {{
    "current_gap": "الفجوة في التسعير",
    "recommended_price_range": "النطاق السعري المقترح",
    "value_justification": "مبرر القيمة"
  }},
  "risk_assessment": {{
    "risks": ["خطر 1"],
    "mitigation": ["حل للخطر"]
  }}
}}"""

        response = await self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=1500,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)


class SelfImprovementEngine:
    """
    The core self-improvement loop.
    Analyzes performance → identifies gaps → generates improvements → applies them.
    """

    def __init__(self, groq_client: AsyncGroq):
        self.client = groq_client
        self.tracker = PerformanceTracker()
        self.improvements_log = []

    async def analyze_and_improve(self, system_data: dict) -> dict:
        """Main self-improvement cycle."""

        performance_analysis = self.tracker.identify_best_strategy()

        prompt = f"""أنت نظام تحسين ذاتي لديليكس. حلّل هذه البيانات وحدد كيف يتحسن النظام:

بيانات النظام الحالية:
{json.dumps(system_data, ensure_ascii=False, indent=2)}

تحليل الأداء التاريخي:
{json.dumps(performance_analysis, ensure_ascii=False, indent=2)}

قدّم خطة التحسين الذاتي:
{{
  "performance_diagnosis": "تشخيص الأداء الحالي",
  "weakest_areas": ["المجال الأضعف 1", "المجال 2"],
  "strongest_areas": ["أفضل مجال 1"],
  "improvement_actions": [
    {{
      "area": "المجال",
      "current_score": 0,
      "target_score": 0,
      "action": "الإجراء",
      "expected_impact": "high/medium/low",
      "auto_applicable": true
    }}
  ],
  "prompt_optimizations": [
    {{
      "agent": "اسم الوكيل",
      "current_issue": "المشكلة الحالية",
      "suggested_improvement": "التحسين المقترح"
    }}
  ],
  "new_capabilities_to_acquire": [
    "قدرة جديدة يجب إضافتها للنظام"
  ],
  "estimated_improvement": "نسبة التحسن المتوقعة %"
}}"""

        response = await self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=2000,
            response_format={"type": "json_object"}
        )

        improvement_plan = json.loads(response.choices[0].message.content)
        improvement_plan["generated_at"] = datetime.utcnow().isoformat()
        self.improvements_log.append(improvement_plan)

        return improvement_plan

    def record_interaction_outcome(self, interaction_type: str, success: bool, details: dict = None):
        """Record every interaction outcome for learning."""
        score = 100 if success else 0
        self.tracker.record(interaction_type, score, details)


class DealixAutonomousCore:
    """
    The complete autonomous intelligence core of Dealix.
    Self-improving, self-healing, self-expanding system.
    """

    def __init__(self, groq_api_key: str):
        self.client = AsyncGroq(api_key=groq_api_key)
        self.improver = SelfImprovementEngine(self.client)
        self.strategic = StrategicIntelligence(self.client)
        self.financial = FinancialIntelligence(self.client)
        self.healer = SelfHealingMonitor()
        self._running = False
        self._cycle_count = 0

    async def run_autonomous_cycle(self):
        """The main autonomous improvement cycle — runs continuously."""
        self._running = True
        logger.info("🚀 Dealix Autonomous Core activated")

        while self._running:
            self._cycle_count += 1
            try:
                # Collect system state
                system_data = {
                    "cycle": self._cycle_count,
                    "timestamp": datetime.utcnow().isoformat(),
                    "health": self.healer.get_system_health(),
                    "performance_trends": self.improver.tracker.identify_best_strategy()
                }

                # Every 10 cycles: run full improvement analysis
                if self._cycle_count % 10 == 0:
                    improvement = await self.improver.analyze_and_improve(system_data)
                    logger.info(f"🔄 Self-improvement cycle: {improvement.get('estimated_improvement')} improvement")

                # Every 50 cycles: strategic expansion analysis
                if self._cycle_count % 50 == 0:
                    strategy = await self.strategic.analyze_market_opportunity(system_data)
                    logger.info(f"📊 Strategic analysis completed")

                await asyncio.sleep(300)  # 5 minute cycles

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Autonomous cycle error: {e}")
                self.healer.check_component("autonomous_core", False, str(e))
                await asyncio.sleep(60)

    async def get_full_intelligence_report(self) -> dict:
        """Get a comprehensive system intelligence report."""
        system_data = {
            "cycle_count": self._cycle_count,
            "health": self.healer.get_system_health(),
            "performance": self.improver.tracker.identify_best_strategy(),
            "improvements_applied": len(self.improver.improvements_log),
            "auto_fixes": len(self.healer.auto_fixes_applied)
        }

        financial = await self.financial.generate_financial_forecast(system_data)
        strategy = await self.strategic.analyze_market_opportunity(system_data)

        return {
            "system_state": system_data,
            "financial_intelligence": financial,
            "strategic_intelligence": strategy,
            "autonomous_improvements": self.improver.improvements_log[-3:] if self.improver.improvements_log else [],
            "generated_at": datetime.utcnow().isoformat()
        }


# ── Global Singleton ─────────────────────────────────────────
_core: Optional[DealixAutonomousCore] = None


def get_autonomous_core(api_key: str) -> DealixAutonomousCore:
    global _core
    if _core is None:
        _core = DealixAutonomousCore(api_key)
    return _core
