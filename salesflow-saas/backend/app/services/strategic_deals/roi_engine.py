"""
ROI Engine — Return on Investment calculator for strategic B2B initiatives.
محرك العائد على الاستثمار: حاسبة العائد على الاستثمار للمبادرات الاستراتيجية
"""

import json
import logging
import math
from typing import Optional

from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.strategic_deal import CompanyProfile
from app.services.llm.provider import get_llm

logger = logging.getLogger("dealix.strategic_deals.roi_engine")

# ── Initiative type benchmarks (Saudi market) ───────────────────────────────

INITIATIVE_BENCHMARKS = {
    "partnership": {
        "avg_roi_pct": 0.45,
        "avg_payback_months": 8,
        "cac_reduction_range": (0.10, 0.30),
        "margin_impact_range": (0.02, 0.08),
    },
    "acquisition": {
        "avg_roi_pct": 0.25,
        "avg_payback_months": 24,
        "cac_reduction_range": (0.15, 0.40),
        "margin_impact_range": (0.05, 0.15),
    },
    "channel_expansion": {
        "avg_roi_pct": 0.60,
        "avg_payback_months": 6,
        "cac_reduction_range": (0.05, 0.20),
        "margin_impact_range": (0.01, 0.05),
    },
    "market_entry": {
        "avg_roi_pct": 0.30,
        "avg_payback_months": 18,
        "cac_reduction_range": (0.00, 0.10),
        "margin_impact_range": (0.03, 0.10),
    },
    "digital_transformation": {
        "avg_roi_pct": 0.55,
        "avg_payback_months": 12,
        "cac_reduction_range": (0.20, 0.50),
        "margin_impact_range": (0.05, 0.12),
    },
    "product_launch": {
        "avg_roi_pct": 0.40,
        "avg_payback_months": 10,
        "cac_reduction_range": (0.00, 0.15),
        "margin_impact_range": (0.05, 0.20),
    },
    "referral_program": {
        "avg_roi_pct": 0.80,
        "avg_payback_months": 3,
        "cac_reduction_range": (0.30, 0.60),
        "margin_impact_range": (0.01, 0.03),
    },
}


# ── Models ──────────────────────────────────────────────────────────────────


class ROICalculation(BaseModel):
    """Complete ROI analysis for a strategic initiative."""
    initiative_type: str
    investment_sar: float = 0.0
    projected_return_sar: float = 0.0
    roi_percentage: float = 0.0
    payback_months: int = 0
    cac_reduction: float = Field(0.0, ge=0.0, le=1.0)
    distribution_value: float = 0.0
    margin_impact: float = 0.0
    risk_adjusted_roi: float = 0.0
    confidence: float = Field(0.5, ge=0.0, le=1.0)
    breakdown: dict = Field(default_factory=dict)
    summary_ar: str = ""

    class Config:
        json_schema_extra = {
            "example": {
                "initiative_type": "partnership",
                "investment_sar": 100_000,
                "projected_return_sar": 250_000,
                "roi_percentage": 150.0,
                "payback_months": 6,
                "cac_reduction": 0.20,
                "risk_adjusted_roi": 97.5,
                "confidence": 0.75,
                "summary_ar": "شراكة مع عائد متوقع ٢٥٠ ألف ريال واسترداد خلال ٦ أشهر",
            }
        }


# ── ROI Engine ──────────────────────────────────────────────────────────────


class ROIEngine:
    """
    Calculates, compares, and projects ROI for strategic B2B initiatives.
    يحسب ويقارن ويتوقع العائد على الاستثمار للمبادرات الاستراتيجية
    """

    def __init__(self):
        self.llm = get_llm()
        self._active_calculations: dict[str, list[ROICalculation]] = {}

    # ── Calculate ROI ───────────────────────────────────────────────────────

    async def calculate(
        self,
        initiative_type: str,
        params: dict,
        db: AsyncSession,
    ) -> ROICalculation:
        """
        Calculate detailed ROI for a strategic initiative.
        حساب العائد على الاستثمار التفصيلي لمبادرة استراتيجية
        """
        benchmark = INITIATIVE_BENCHMARKS.get(initiative_type, {})

        investment = float(params.get("investment_sar", 0))
        if investment <= 0:
            raise ValueError("investment_sar must be positive")

        projected_return = float(params.get("projected_return_sar", 0))
        monthly_return = float(params.get("monthly_return_sar", 0))
        duration_months = int(params.get("duration_months", 12))
        risk_factor = min(1.0, max(0.0, float(params.get("risk_factor", 0.3))))
        discount_rate = float(params.get("annual_discount_rate", 0.08))

        # If projected_return not given, estimate from monthly
        if projected_return <= 0 and monthly_return > 0:
            projected_return = monthly_return * duration_months

        # If still zero, use benchmark
        if projected_return <= 0:
            avg_roi = benchmark.get("avg_roi_pct", 0.30)
            projected_return = investment * (1 + avg_roi)

        # Core ROI
        roi_percentage = ((projected_return - investment) / investment) * 100 if investment > 0 else 0.0

        # Payback period
        if monthly_return > 0:
            payback_months = max(1, math.ceil(investment / monthly_return))
        elif projected_return > investment and duration_months > 0:
            monthly_est = (projected_return - investment) / duration_months
            payback_months = max(1, math.ceil(investment / monthly_est)) if monthly_est > 0 else duration_months
        else:
            payback_months = benchmark.get("avg_payback_months", 12)

        # CAC reduction estimate
        cac_range = benchmark.get("cac_reduction_range", (0.0, 0.15))
        cac_reduction = float(params.get("cac_reduction", (cac_range[0] + cac_range[1]) / 2))
        cac_reduction = min(1.0, max(0.0, cac_reduction))

        # Margin impact
        margin_range = benchmark.get("margin_impact_range", (0.01, 0.05))
        margin_impact = float(params.get("margin_impact", (margin_range[0] + margin_range[1]) / 2))

        # Distribution / channel value
        distribution_value = float(params.get("distribution_value_sar", 0))
        if distribution_value <= 0 and initiative_type in ("channel_expansion", "partnership", "referral_program"):
            distribution_value = projected_return * 0.2

        # Risk-adjusted ROI — discount by risk factor
        risk_adjusted_roi = roi_percentage * (1 - risk_factor)

        # NPV-based confidence: higher NPV relative to investment = higher confidence
        monthly_discount = discount_rate / 12
        npv = 0.0
        if monthly_return > 0:
            for month in range(1, duration_months + 1):
                npv += monthly_return / ((1 + monthly_discount) ** month)
        else:
            monthly_est = projected_return / max(duration_months, 1)
            for month in range(1, duration_months + 1):
                npv += monthly_est / ((1 + monthly_discount) ** month)

        npv -= investment
        npv_ratio = npv / investment if investment > 0 else 0
        confidence = min(0.95, max(0.1, 0.5 + npv_ratio * 0.3))

        # Detailed breakdown
        breakdown = {
            "gross_return_sar": round(projected_return, 2),
            "net_return_sar": round(projected_return - investment, 2),
            "npv_sar": round(npv, 2),
            "monthly_return_sar": round(monthly_return or projected_return / max(duration_months, 1), 2),
            "duration_months": duration_months,
            "risk_factor": risk_factor,
            "discount_rate": discount_rate,
            "cac_savings_sar": round(investment * cac_reduction, 2),
            "distribution_value_sar": round(distribution_value, 2),
            "benchmark_avg_roi_pct": benchmark.get("avg_roi_pct", 0) * 100,
            "vs_benchmark": "أعلى من المتوسط" if roi_percentage > benchmark.get("avg_roi_pct", 0) * 100 else "أقل من المتوسط",
        }

        # Generate Arabic summary
        summary_ar = await self._generate_summary(
            initiative_type, investment, projected_return,
            roi_percentage, payback_months, risk_adjusted_roi, confidence,
        )

        calc = ROICalculation(
            initiative_type=initiative_type,
            investment_sar=round(investment, 2),
            projected_return_sar=round(projected_return, 2),
            roi_percentage=round(roi_percentage, 2),
            payback_months=payback_months,
            cac_reduction=round(cac_reduction, 4),
            distribution_value=round(distribution_value, 2),
            margin_impact=round(margin_impact, 4),
            risk_adjusted_roi=round(risk_adjusted_roi, 2),
            confidence=round(confidence, 4),
            breakdown=breakdown,
            summary_ar=summary_ar,
        )

        # Store for tenant dashboard
        tenant_id = params.get("tenant_id", "default")
        self._active_calculations.setdefault(tenant_id, []).append(calc)

        logger.info(
            "ROI calculated: type=%s investment=%.0f return=%.0f roi=%.1f%% payback=%dm",
            initiative_type, investment, projected_return, roi_percentage, payback_months,
        )
        return calc

    # ── Compare Initiatives ─────────────────────────────────────────────────

    async def compare_initiatives(
        self,
        calculations: list[ROICalculation],
    ) -> dict:
        """
        Rank and compare multiple initiatives by risk-adjusted ROI.
        ترتيب ومقارنة عدة مبادرات حسب العائد المعدل بالمخاطر
        """
        if not calculations:
            return {"ranked": [], "summary_ar": "لا توجد مبادرات للمقارنة"}

        ranked = []
        for calc in calculations:
            ranked.append({
                "initiative_type": calc.initiative_type,
                "investment_sar": calc.investment_sar,
                "projected_return_sar": calc.projected_return_sar,
                "roi_percentage": calc.roi_percentage,
                "risk_adjusted_roi": calc.risk_adjusted_roi,
                "payback_months": calc.payback_months,
                "confidence": calc.confidence,
                "cac_reduction": calc.cac_reduction,
                "margin_impact": calc.margin_impact,
                "npv_sar": calc.breakdown.get("npv_sar", 0),
            })

        # Sort by risk-adjusted ROI descending
        ranked.sort(key=lambda x: x["risk_adjusted_roi"], reverse=True)

        for i, item in enumerate(ranked):
            item["rank"] = i + 1

        best = ranked[0]
        summary_ar = (
            f"تم مقارنة {len(ranked)} مبادرة. "
            f"الأفضل: {best['initiative_type']} بعائد معدل {best['risk_adjusted_roi']:.1f}% "
            f"واسترداد خلال {best['payback_months']} شهر "
            f"بدرجة ثقة {best['confidence']:.0%}."
        )

        total_investment = sum(c.investment_sar for c in calculations)
        total_return = sum(c.projected_return_sar for c in calculations)
        portfolio_roi = ((total_return - total_investment) / total_investment * 100) if total_investment > 0 else 0

        logger.info(
            "Compared %d initiatives. Best: %s (adj ROI=%.1f%%)",
            len(ranked), best["initiative_type"], best["risk_adjusted_roi"],
        )

        return {
            "ranked": ranked,
            "portfolio_investment_sar": round(total_investment, 2),
            "portfolio_return_sar": round(total_return, 2),
            "portfolio_roi_pct": round(portfolio_roi, 2),
            "summary_ar": summary_ar,
        }

    # ── Annual Projection ───────────────────────────────────────────────────

    async def project_annual(
        self,
        tenant_id: str,
        db: AsyncSession,
    ) -> dict:
        """
        Project annual returns across all active initiatives for a tenant.
        إسقاط العوائد السنوية لجميع المبادرات النشطة للمستأجر
        """
        calculations = self._active_calculations.get(tenant_id, [])

        if not calculations:
            return {
                "tenant_id": tenant_id,
                "total_investment_sar": 0,
                "projected_annual_return_sar": 0,
                "weighted_roi_pct": 0,
                "avg_payback_months": 0,
                "monthly_projections": [],
                "summary_ar": "لا توجد مبادرات نشطة لهذا المستأجر",
            }

        total_investment = sum(c.investment_sar for c in calculations)
        total_return = sum(c.projected_return_sar for c in calculations)
        weighted_roi = ((total_return - total_investment) / total_investment * 100) if total_investment > 0 else 0
        avg_payback = sum(c.payback_months for c in calculations) / len(calculations)
        total_cac_savings = sum(c.investment_sar * c.cac_reduction for c in calculations)

        # Monthly projection across all initiatives
        monthly_projections = []
        for month in range(1, 13):
            month_return = 0.0
            for calc in calculations:
                if month >= calc.payback_months:
                    monthly_est = calc.breakdown.get("monthly_return_sar", 0)
                    month_return += monthly_est
                else:
                    ramp_ratio = month / max(calc.payback_months, 1)
                    monthly_est = calc.breakdown.get("monthly_return_sar", 0) * ramp_ratio
                    month_return += monthly_est

            monthly_projections.append({
                "month": month,
                "projected_return_sar": round(month_return, 2),
                "cumulative_sar": round(
                    sum(p["projected_return_sar"] for p in monthly_projections) + month_return, 2
                ),
            })

        summary_ar = (
            f"إجمالي الاستثمار: {total_investment:,.0f} ريال | "
            f"العائد السنوي المتوقع: {total_return:,.0f} ريال | "
            f"العائد على الاستثمار: {weighted_roi:.1f}% | "
            f"متوسط فترة الاسترداد: {avg_payback:.0f} شهر | "
            f"وفورات تكلفة الاستحواذ: {total_cac_savings:,.0f} ريال"
        )

        logger.info(
            "Annual projection for tenant %s: investment=%.0f return=%.0f roi=%.1f%%",
            tenant_id, total_investment, total_return, weighted_roi,
        )

        return {
            "tenant_id": tenant_id,
            "total_investment_sar": round(total_investment, 2),
            "projected_annual_return_sar": round(total_return, 2),
            "weighted_roi_pct": round(weighted_roi, 2),
            "avg_payback_months": round(avg_payback, 1),
            "total_cac_savings_sar": round(total_cac_savings, 2),
            "initiative_count": len(calculations),
            "monthly_projections": monthly_projections,
            "summary_ar": summary_ar,
        }

    # ── ROI Dashboard ───────────────────────────────────────────────────────

    async def get_roi_dashboard(
        self,
        tenant_id: str,
        db: AsyncSession,
    ) -> dict:
        """
        Get a comprehensive ROI dashboard for all active initiatives.
        الحصول على لوحة معلومات شاملة للعائد على الاستثمار لجميع المبادرات النشطة
        """
        calculations = self._active_calculations.get(tenant_id, [])
        projection = await self.project_annual(tenant_id, db)

        # Group by initiative type
        by_type: dict[str, list[ROICalculation]] = {}
        for calc in calculations:
            by_type.setdefault(calc.initiative_type, []).append(calc)

        type_summaries = []
        for init_type, calcs in by_type.items():
            total_inv = sum(c.investment_sar for c in calcs)
            total_ret = sum(c.projected_return_sar for c in calcs)
            avg_roi = sum(c.roi_percentage for c in calcs) / len(calcs)
            avg_conf = sum(c.confidence for c in calcs) / len(calcs)

            type_summaries.append({
                "initiative_type": init_type,
                "count": len(calcs),
                "total_investment_sar": round(total_inv, 2),
                "total_return_sar": round(total_ret, 2),
                "avg_roi_pct": round(avg_roi, 2),
                "avg_confidence": round(avg_conf, 4),
            })

        type_summaries.sort(key=lambda x: x["avg_roi_pct"], reverse=True)

        # Top performers
        top_performers = sorted(calculations, key=lambda c: c.risk_adjusted_roi, reverse=True)[:5]
        top_list = [
            {
                "initiative_type": c.initiative_type,
                "investment_sar": c.investment_sar,
                "roi_pct": c.roi_percentage,
                "risk_adjusted_roi": c.risk_adjusted_roi,
                "payback_months": c.payback_months,
            }
            for c in top_performers
        ]

        dashboard = {
            "tenant_id": tenant_id,
            "initiative_count": len(calculations),
            "projection": projection,
            "by_type": type_summaries,
            "top_performers": top_list,
            "health": {
                "avg_roi_pct": round(
                    sum(c.roi_percentage for c in calculations) / max(len(calculations), 1), 2
                ),
                "avg_confidence": round(
                    sum(c.confidence for c in calculations) / max(len(calculations), 1), 4
                ),
                "total_at_risk_sar": round(
                    sum(c.investment_sar * (1 - c.confidence) for c in calculations), 2
                ),
            },
        }

        logger.info("ROI dashboard for tenant %s: %d initiatives", tenant_id, len(calculations))
        return dashboard

    # ── Private Helpers ─────────────────────────────────────────────────────

    async def _generate_summary(
        self,
        initiative_type: str,
        investment: float,
        projected_return: float,
        roi_pct: float,
        payback_months: int,
        risk_adjusted_roi: float,
        confidence: float,
    ) -> str:
        """Generate an Arabic summary for an ROI calculation."""
        context = f"""نوع المبادرة: {initiative_type}
الاستثمار: {investment:,.0f} ريال
العائد المتوقع: {projected_return:,.0f} ريال
العائد على الاستثمار: {roi_pct:.1f}%
فترة الاسترداد: {payback_months} شهر
العائد المعدل بالمخاطر: {risk_adjusted_roi:.1f}%
درجة الثقة: {confidence:.0%}"""

        system_prompt = """أنت محلل مالي سعودي. اكتب ملخصاً موجزاً بالعربي (٢-٣ جمل) يشرح العائد على الاستثمار لهذه المبادرة.
اذكر إذا كان العائد جيداً أو ضعيفاً مقارنة بالسوق وأعطِ توصية مختصرة.
اكتب الملخص مباشرة بدون JSON."""

        try:
            llm_response = await self.llm.complete(
                system_prompt=system_prompt,
                user_message=context,
                temperature=0.3,
            )
            return llm_response.content.strip()
        except Exception as exc:
            logger.warning("LLM summary generation failed: %s", exc)
            verdict = "عائد جيد" if roi_pct > 30 else ("عائد متوسط" if roi_pct > 10 else "عائد ضعيف")
            return (
                f"مبادرة {initiative_type}: استثمار {investment:,.0f} ريال "
                f"بعائد متوقع {projected_return:,.0f} ريال ({roi_pct:.1f}%). "
                f"فترة الاسترداد {payback_months} شهر. التقييم: {verdict}."
            )
