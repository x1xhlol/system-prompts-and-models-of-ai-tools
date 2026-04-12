"""
Strategic Simulator — Monte Carlo-style scenario modeling for B2B deals.
المحاكي الاستراتيجي: نمذجة سيناريوهات بأسلوب مونت كارلو للصفقات بين الشركات
"""

import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.strategic_deal import CompanyProfile
from app.services.llm.provider import get_llm

logger = logging.getLogger("dealix.strategic_deals.strategic_simulator")

# ── Scenario type definitions ───────────────────────────────────────────────

SCENARIO_TYPES = {
    "partnership": "شراكة استراتيجية",
    "acquisition": "استحواذ",
    "channel_expansion": "توسع قنوات التوزيع",
    "market_entry": "دخول سوق جديد",
    "joint_venture": "مشروع مشترك",
    "franchise": "امتياز تجاري",
    "divestiture": "تصفية أصول",
}

# ── Default assumptions by scenario type ────────────────────────────────────

DEFAULT_ASSUMPTIONS = {
    "partnership": {
        "revenue_share_pct": 0.15,
        "setup_cost_sar": 50_000,
        "ramp_months": 3,
        "success_probability": 0.65,
        "annual_growth_pct": 0.10,
    },
    "acquisition": {
        "premium_pct": 0.25,
        "integration_cost_pct": 0.15,
        "synergy_savings_pct": 0.10,
        "ramp_months": 12,
        "success_probability": 0.50,
        "annual_growth_pct": 0.15,
    },
    "channel_expansion": {
        "channel_setup_sar": 100_000,
        "per_channel_cost_sar": 25_000,
        "channels_count": 3,
        "revenue_per_channel_sar": 200_000,
        "ramp_months": 6,
        "success_probability": 0.70,
    },
    "market_entry": {
        "entry_cost_sar": 500_000,
        "first_year_revenue_sar": 300_000,
        "market_share_target": 0.05,
        "ramp_months": 12,
        "success_probability": 0.45,
        "annual_growth_pct": 0.20,
    },
    "joint_venture": {
        "equity_split": 0.50,
        "total_investment_sar": 1_000_000,
        "projected_revenue_sar": 2_000_000,
        "ramp_months": 9,
        "success_probability": 0.55,
        "annual_growth_pct": 0.12,
    },
    "franchise": {
        "franchise_fee_sar": 200_000,
        "royalty_pct": 0.06,
        "unit_revenue_sar": 500_000,
        "units_count": 2,
        "ramp_months": 6,
        "success_probability": 0.60,
    },
    "divestiture": {
        "asset_value_sar": 1_000_000,
        "discount_pct": 0.10,
        "transaction_cost_pct": 0.05,
        "timeline_months": 6,
        "success_probability": 0.75,
    },
}


# ── Models ──────────────────────────────────────────────────────────────────


class StrategicScenario(BaseModel):
    """A fully modeled strategic scenario with financial projections."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    name_ar: str = ""
    scenario_type: str = "partnership"
    parties: list[str] = Field(default_factory=list)
    assumptions: dict = Field(default_factory=dict)
    upside: dict = Field(default_factory=dict)
    downside: dict = Field(default_factory=dict)
    timeline_months: int = 12
    probability: float = Field(0.5, ge=0.0, le=1.0)
    net_value_sar: float = 0.0
    recommendation: str = ""
    recommendation_ar: str = ""
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Partnership with LogiPrime",
                "name_ar": "شراكة مع لوجي برايم",
                "scenario_type": "partnership",
                "parties": ["شركتنا", "لوجي برايم"],
                "probability": 0.65,
                "net_value_sar": 750_000,
            }
        }


# ── Strategic Simulator Engine ──────────────────────────────────────────────


class StrategicSimulator:
    """
    Simulates strategic scenarios, comparing outcomes and generating
    Arabic-language recommendations for Saudi B2B decision-makers.
    يحاكي السيناريوهات الاستراتيجية ويقارن النتائج ويولد توصيات بالعربي
    """

    def __init__(self):
        self.llm = get_llm()
        self._scenarios: dict[str, StrategicScenario] = {}

    # ── Simulate ────────────────────────────────────────────────────────────

    async def simulate(
        self,
        scenario_type: str,
        params: dict,
        twin_id: Optional[str],
        db: AsyncSession,
    ) -> StrategicScenario:
        """
        Run a full strategic simulation for a given scenario type.
        تشغيل محاكاة استراتيجية كاملة لنوع سيناريو معين
        """
        if scenario_type not in SCENARIO_TYPES:
            raise ValueError(
                f"Unknown scenario type '{scenario_type}'. "
                f"Valid types: {', '.join(SCENARIO_TYPES.keys())}"
            )

        # Load acquirer profile if twin_id provided
        acquirer_name = params.get("acquirer_name", "الشركة")
        acquirer_revenue = float(params.get("acquirer_revenue_sar", 0))
        if twin_id:
            result = await db.execute(
                select(CompanyProfile).where(CompanyProfile.id == twin_id)
            )
            twin = result.scalar_one_or_none()
            if twin:
                acquirer_name = twin.company_name or acquirer_name
                acquirer_revenue = float(twin.annual_revenue_sar or acquirer_revenue)

        # Merge defaults with user-provided params
        defaults = DEFAULT_ASSUMPTIONS.get(scenario_type, {}).copy()
        assumptions = {**defaults, **params.get("assumptions", {})}

        # Compute financials based on scenario type
        upside, downside, net_value, timeline = self._compute_financials(
            scenario_type, assumptions, acquirer_revenue,
        )

        probability = min(1.0, max(0.0, float(
            assumptions.get("success_probability",
                            defaults.get("success_probability", 0.5))
        )))

        # Build scenario
        parties = params.get("parties", [acquirer_name])
        scenario = StrategicScenario(
            name=params.get("name", f"{scenario_type} scenario"),
            name_ar=params.get("name_ar", SCENARIO_TYPES.get(scenario_type, scenario_type)),
            scenario_type=scenario_type,
            parties=parties,
            assumptions=assumptions,
            upside=upside,
            downside=downside,
            timeline_months=timeline,
            probability=probability,
            net_value_sar=round(net_value, 2),
        )

        # Generate Arabic recommendation via LLM
        recommendation = await self._generate_scenario_recommendation(scenario)
        scenario.recommendation = recommendation
        scenario.recommendation_ar = recommendation

        self._scenarios[scenario.id] = scenario

        logger.info(
            "Simulated scenario '%s' (type=%s): net_value=%.0f SAR, probability=%.0%%",
            scenario.name, scenario_type, net_value, probability * 100,
        )
        return scenario

    # ── Compare Scenarios ───────────────────────────────────────────────────

    async def compare_scenarios(
        self,
        scenarios: list[StrategicScenario],
        db: AsyncSession,
    ) -> dict:
        """
        Rank and compare multiple scenarios by expected value and risk.
        ترتيب ومقارنة عدة سيناريوهات حسب القيمة المتوقعة والمخاطر
        """
        if not scenarios:
            return {"ranked": [], "summary_ar": "لا توجد سيناريوهات للمقارنة"}

        ranked = []
        for s in scenarios:
            expected_value = s.net_value_sar * s.probability
            risk_adjusted = expected_value * (1.0 - (1.0 - s.probability) * 0.5)
            ranked.append({
                "id": s.id,
                "name": s.name,
                "name_ar": s.name_ar,
                "scenario_type": s.scenario_type,
                "net_value_sar": s.net_value_sar,
                "probability": s.probability,
                "expected_value_sar": round(expected_value, 2),
                "risk_adjusted_value_sar": round(risk_adjusted, 2),
                "timeline_months": s.timeline_months,
                "upside_total": sum(
                    float(v) for v in s.upside.values() if isinstance(v, (int, float))
                ),
                "downside_total": sum(
                    float(v) for v in s.downside.values() if isinstance(v, (int, float))
                ),
            })

        ranked.sort(key=lambda x: x["risk_adjusted_value_sar"], reverse=True)

        # Add rank
        for i, item in enumerate(ranked):
            item["rank"] = i + 1

        # Generate comparison summary
        best = ranked[0]
        worst = ranked[-1]

        summary_ar = (
            f"تم مقارنة {len(ranked)} سيناريو. "
            f"الأفضل: {best['name_ar']} بقيمة متوقعة {best['expected_value_sar']:,.0f} ريال "
            f"واحتمالية نجاح {best['probability']:.0%}. "
        )
        if len(ranked) > 1:
            summary_ar += (
                f"الأقل جاذبية: {worst['name_ar']} بقيمة متوقعة "
                f"{worst['expected_value_sar']:,.0f} ريال."
            )

        logger.info("Compared %d scenarios. Best: %s", len(ranked), best["name"])

        return {
            "ranked": ranked,
            "best_scenario_id": best["id"],
            "summary_ar": summary_ar,
        }

    # ── Sensitivity Analysis ────────────────────────────────────────────────

    async def sensitivity_analysis(
        self,
        scenario_id: str,
        variable: str,
        value_range: list[float],
        db: AsyncSession,
    ) -> list[dict]:
        """
        Run sensitivity analysis on a single variable across a range of values.
        تحليل الحساسية لمتغير واحد عبر نطاق من القيم
        """
        base_scenario = self._scenarios.get(scenario_id)
        if not base_scenario:
            raise ValueError(f"Scenario {scenario_id} not found")

        if not value_range:
            base_val = float(base_scenario.assumptions.get(variable, 1.0))
            value_range = [
                round(base_val * 0.5, 4),
                round(base_val * 0.75, 4),
                round(base_val, 4),
                round(base_val * 1.25, 4),
                round(base_val * 1.5, 4),
            ]

        results: list[dict] = []
        for val in value_range:
            modified_assumptions = base_scenario.assumptions.copy()
            modified_assumptions[variable] = val

            upside, downside, net_value, timeline = self._compute_financials(
                base_scenario.scenario_type, modified_assumptions, 0,
            )

            expected = net_value * base_scenario.probability
            results.append({
                "variable": variable,
                "value": val,
                "net_value_sar": round(net_value, 2),
                "expected_value_sar": round(expected, 2),
                "upside_revenue": upside.get("revenue_gain_sar", 0),
                "downside_cost": downside.get("total_cost_sar", 0),
                "delta_from_base": round(net_value - base_scenario.net_value_sar, 2),
            })

        logger.info(
            "Sensitivity analysis for scenario %s on '%s': %d data points",
            scenario_id, variable, len(results),
        )
        return results

    # ── Generate Recommendation ─────────────────────────────────────────────

    async def generate_recommendation(
        self,
        scenario_id: str,
        db: AsyncSession,
    ) -> str:
        """
        Generate a detailed Arabic strategic recommendation for a scenario.
        إنشاء توصية استراتيجية تفصيلية بالعربي لسيناريو محدد
        """
        scenario = self._scenarios.get(scenario_id)
        if not scenario:
            raise ValueError(f"Scenario {scenario_id} not found")

        recommendation = await self._generate_scenario_recommendation(scenario)
        scenario.recommendation = recommendation
        scenario.recommendation_ar = recommendation

        logger.info("Generated recommendation for scenario %s", scenario_id)
        return recommendation

    # ── Private: Compute Financials ─────────────────────────────────────────

    def _compute_financials(
        self,
        scenario_type: str,
        assumptions: dict,
        acquirer_revenue: float,
    ) -> tuple[dict, dict, float, int]:
        """Compute upside, downside, net value, and timeline from assumptions."""

        if scenario_type == "partnership":
            rev_share = float(assumptions.get("revenue_share_pct", 0.15))
            setup = float(assumptions.get("setup_cost_sar", 50_000))
            ramp = int(assumptions.get("ramp_months", 3))
            growth = float(assumptions.get("annual_growth_pct", 0.10))
            base_rev = acquirer_revenue if acquirer_revenue > 0 else 1_000_000

            annual_gain = base_rev * rev_share
            three_year = annual_gain * (1 + growth) + annual_gain * (1 + growth) ** 2 + annual_gain * (1 + growth) ** 3

            upside = {
                "revenue_gain_sar": round(annual_gain, 2),
                "three_year_revenue_sar": round(three_year, 2),
                "reach_expansion_pct": round(rev_share * 100, 1),
                "capacity_gain_pct": round(rev_share * 50, 1),
            }
            downside = {
                "setup_cost_sar": setup,
                "annual_management_sar": round(setup * 0.3, 2),
                "total_cost_sar": round(setup + setup * 0.3 * 3, 2),
                "operational_burden": "متوسط",
                "risk_level": "منخفض",
            }
            net_value = three_year - downside["total_cost_sar"]
            timeline = ramp + 12

        elif scenario_type == "acquisition":
            premium = float(assumptions.get("premium_pct", 0.25))
            integration_cost = float(assumptions.get("integration_cost_pct", 0.15))
            synergy = float(assumptions.get("synergy_savings_pct", 0.10))
            target_value = float(assumptions.get("target_value_sar", acquirer_revenue * 0.3))
            ramp = int(assumptions.get("ramp_months", 12))

            acquisition_price = target_value * (1 + premium)
            integration = target_value * integration_cost
            annual_synergy = target_value * synergy

            upside = {
                "revenue_gain_sar": round(target_value, 2),
                "annual_synergy_sar": round(annual_synergy, 2),
                "three_year_synergy_sar": round(annual_synergy * 3, 2),
                "market_share_gain_pct": round(target_value / max(acquirer_revenue, 1) * 100, 1),
            }
            downside = {
                "acquisition_price_sar": round(acquisition_price, 2),
                "integration_cost_sar": round(integration, 2),
                "total_cost_sar": round(acquisition_price + integration, 2),
                "operational_burden": "عالي",
                "risk_level": "عالي",
            }
            net_value = upside["three_year_synergy_sar"] + target_value - downside["total_cost_sar"]
            timeline = ramp + 24

        elif scenario_type == "channel_expansion":
            channel_setup = float(assumptions.get("channel_setup_sar", 100_000))
            per_channel = float(assumptions.get("per_channel_cost_sar", 25_000))
            channels = int(assumptions.get("channels_count", 3))
            rev_per_channel = float(assumptions.get("revenue_per_channel_sar", 200_000))
            ramp = int(assumptions.get("ramp_months", 6))

            total_setup = channel_setup + per_channel * channels
            annual_rev = rev_per_channel * channels

            upside = {
                "revenue_gain_sar": round(annual_rev, 2),
                "reach_expansion_pct": round(channels * 15, 1),
                "channels_added": channels,
            }
            downside = {
                "setup_cost_sar": round(total_setup, 2),
                "annual_ops_sar": round(per_channel * channels * 0.5, 2),
                "total_cost_sar": round(total_setup + per_channel * channels * 0.5, 2),
                "operational_burden": "متوسط",
                "risk_level": "منخفض",
            }
            net_value = annual_rev * 2 - downside["total_cost_sar"]
            timeline = ramp + 12

        elif scenario_type == "market_entry":
            entry_cost = float(assumptions.get("entry_cost_sar", 500_000))
            first_year = float(assumptions.get("first_year_revenue_sar", 300_000))
            growth = float(assumptions.get("annual_growth_pct", 0.20))
            ramp = int(assumptions.get("ramp_months", 12))

            three_year_rev = first_year + first_year * (1 + growth) + first_year * (1 + growth) ** 2

            upside = {
                "revenue_gain_sar": round(first_year, 2),
                "three_year_revenue_sar": round(three_year_rev, 2),
                "market_share_target_pct": float(assumptions.get("market_share_target", 0.05)) * 100,
            }
            downside = {
                "entry_cost_sar": round(entry_cost, 2),
                "annual_ops_sar": round(entry_cost * 0.2, 2),
                "total_cost_sar": round(entry_cost + entry_cost * 0.2 * 2, 2),
                "operational_burden": "عالي",
                "risk_level": "عالي",
            }
            net_value = three_year_rev - downside["total_cost_sar"]
            timeline = ramp + 24

        elif scenario_type == "joint_venture":
            equity = float(assumptions.get("equity_split", 0.50))
            investment = float(assumptions.get("total_investment_sar", 1_000_000))
            projected = float(assumptions.get("projected_revenue_sar", 2_000_000))
            ramp = int(assumptions.get("ramp_months", 9))

            our_share = projected * equity
            our_cost = investment * equity

            upside = {
                "revenue_gain_sar": round(our_share, 2),
                "equity_value_sar": round(our_share * 3, 2),
                "reach_expansion_pct": round(equity * 100, 1),
            }
            downside = {
                "investment_sar": round(our_cost, 2),
                "annual_ops_sar": round(our_cost * 0.1, 2),
                "total_cost_sar": round(our_cost + our_cost * 0.1 * 2, 2),
                "operational_burden": "عالي",
                "risk_level": "متوسط",
            }
            net_value = our_share * 2 - downside["total_cost_sar"]
            timeline = ramp + 18

        elif scenario_type == "franchise":
            fee = float(assumptions.get("franchise_fee_sar", 200_000))
            royalty = float(assumptions.get("royalty_pct", 0.06))
            unit_rev = float(assumptions.get("unit_revenue_sar", 500_000))
            units = int(assumptions.get("units_count", 2))
            ramp = int(assumptions.get("ramp_months", 6))

            annual_royalty = unit_rev * units * royalty
            total_fees = fee * units

            upside = {
                "revenue_gain_sar": round(annual_royalty + total_fees, 2),
                "annual_royalty_sar": round(annual_royalty, 2),
                "franchise_fees_sar": round(total_fees, 2),
                "units_count": units,
            }
            downside = {
                "setup_cost_sar": round(fee * 0.3 * units, 2),
                "support_cost_sar": round(unit_rev * 0.02 * units, 2),
                "total_cost_sar": round(fee * 0.3 * units + unit_rev * 0.02 * units * 3, 2),
                "operational_burden": "متوسط",
                "risk_level": "منخفض",
            }
            net_value = (annual_royalty * 3 + total_fees) - downside["total_cost_sar"]
            timeline = ramp + 12

        elif scenario_type == "divestiture":
            asset_val = float(assumptions.get("asset_value_sar", 1_000_000))
            discount = float(assumptions.get("discount_pct", 0.10))
            tx_cost = float(assumptions.get("transaction_cost_pct", 0.05))
            ramp = int(assumptions.get("timeline_months", 6))

            proceeds = asset_val * (1 - discount)
            costs = asset_val * tx_cost

            upside = {
                "proceeds_sar": round(proceeds, 2),
                "cash_freed_sar": round(proceeds - costs, 2),
                "operational_relief": "تخفيف عبء تشغيلي",
            }
            downside = {
                "transaction_cost_sar": round(costs, 2),
                "discount_loss_sar": round(asset_val * discount, 2),
                "total_cost_sar": round(costs + asset_val * discount, 2),
                "operational_burden": "منخفض",
                "risk_level": "منخفض",
            }
            net_value = proceeds - costs
            timeline = ramp

        else:
            upside = {"revenue_gain_sar": 0}
            downside = {"total_cost_sar": 0}
            net_value = 0
            timeline = 12

        return upside, downside, round(net_value, 2), timeline

    # ── Private: Generate Recommendation ────────────────────────────────────

    async def _generate_scenario_recommendation(
        self, scenario: StrategicScenario,
    ) -> str:
        """Generate an Arabic recommendation for a scenario using LLM."""
        type_ar = SCENARIO_TYPES.get(scenario.scenario_type, scenario.scenario_type)

        context = f"""نوع السيناريو: {type_ar}
الأطراف: {', '.join(scenario.parties)}
الافتراضات: {json.dumps(scenario.assumptions, ensure_ascii=False)}
الجانب الإيجابي: {json.dumps(scenario.upside, ensure_ascii=False)}
الجانب السلبي: {json.dumps(scenario.downside, ensure_ascii=False)}
المدة الزمنية: {scenario.timeline_months} شهر
احتمالية النجاح: {scenario.probability:.0%}
صافي القيمة: {scenario.net_value_sar:,.0f} ريال سعودي"""

        system_prompt = """أنت مستشار استراتيجي سعودي خبير. اكتب توصية تنفيذية واضحة بالعربي.

يجب أن تشمل:
١. ملخص تنفيذي في سطرين
٢. المبرر الاستراتيجي
٣. المخاطر الرئيسية وطرق التخفيف
٤. التوصية النهائية (تنفيذ / تأجيل / رفض) مع المبررات
٥. الخطوات التالية إذا كانت التوصية بالتنفيذ

اكتب بأسلوب مهني رسمي مناسب لعرضه على الإدارة التنفيذية."""

        try:
            llm_response = await self.llm.complete(
                system_prompt=system_prompt,
                user_message=context,
                temperature=0.3,
            )
            return llm_response.content.strip()
        except Exception as exc:
            logger.warning("LLM recommendation generation failed: %s", exc)
            if scenario.net_value_sar > 0 and scenario.probability >= 0.5:
                verdict = "يُنصح بالتنفيذ"
            elif scenario.net_value_sar > 0:
                verdict = "يُنصح بمزيد من الدراسة قبل التنفيذ"
            else:
                verdict = "لا يُنصح بالتنفيذ في الوقت الحالي"

            return (
                f"توصية — {type_ar}\n"
                f"صافي القيمة المتوقعة: {scenario.net_value_sar:,.0f} ريال\n"
                f"احتمالية النجاح: {scenario.probability:.0%}\n"
                f"المدة الزمنية: {scenario.timeline_months} شهر\n"
                f"القرار: {verdict}"
            )
