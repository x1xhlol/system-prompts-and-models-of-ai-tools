"""
Sales Forecasting Engine — Predicts revenue, calculates deal-close probability,
identifies at-risk deals, and generates Arabic forecast summaries.
"""

import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from typing import Optional

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.llm.provider import get_llm

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------

@dataclass
class DealForecast:
    deal_id: str
    deal_name: str
    current_value: float
    close_probability: float  # 0.0-1.0
    weighted_value: float
    risk_level: str  # "low", "medium", "high"
    risk_reasons_ar: list[str] = field(default_factory=list)
    days_inactive: int = 0
    expected_close_date: Optional[str] = None


@dataclass
class PeriodForecast:
    period_label: str  # "2026-04", "Q2 2026"
    predicted_revenue: float
    weighted_pipeline: float
    deal_count: int
    avg_close_probability: float
    best_case: float
    worst_case: float


@dataclass
class ForecastResult:
    tenant_id: str
    period: str  # "monthly" or "quarterly"
    generated_at: str
    periods: list[PeriodForecast] = field(default_factory=list)
    at_risk_deals: list[DealForecast] = field(default_factory=list)
    top_deals: list[DealForecast] = field(default_factory=list)
    summary_ar: str = ""
    summary_en: str = ""
    total_pipeline_value: float = 0.0
    total_weighted_value: float = 0.0
    recommendations_ar: list[str] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Stage-based probability defaults
STAGE_PROBABILITIES = {
    "new": 0.10,
    "contacted": 0.15,
    "qualified": 0.25,
    "proposal_sent": 0.45,
    "negotiation": 0.65,
    "verbal_agreement": 0.80,
    "contract_sent": 0.85,
    "closed_won": 1.00,
    "closed_lost": 0.00,
}

# Inactivity thresholds (days)
RISK_THRESHOLDS = {
    "high": 14,
    "medium": 7,
    "low": 3,
}

MONTHS_AR = {
    1: "يناير", 2: "فبراير", 3: "مارس", 4: "أبريل",
    5: "مايو", 6: "يونيو", 7: "يوليو", 8: "أغسطس",
    9: "سبتمبر", 10: "أكتوبر", 11: "نوفمبر", 12: "ديسمبر",
}


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------

class SalesForecastingEngine:
    """Predicts revenue and identifies at-risk deals."""

    def __init__(self):
        self._llm = get_llm()

    async def generate_forecast(
        self, tenant_id: str, period: str, db: AsyncSession
    ) -> ForecastResult:
        """
        Generate sales forecast.

        Args:
            tenant_id: Tenant UUID string
            period: "monthly" or "quarterly"
            db: Async database session

        Returns:
            ForecastResult with predictions, at-risk deals, and summaries.
        """
        now = datetime.now(timezone.utc)

        try:
            deals_data = await self._fetch_deals(tenant_id, db)
        except Exception as e:
            logger.error(f"Failed to fetch deals for tenant {tenant_id}: {e}")
            return ForecastResult(
                tenant_id=tenant_id,
                period=period,
                generated_at=now.isoformat(),
                summary_ar="تعذر إنشاء التوقعات — لم يتم العثور على بيانات الصفقات",
                summary_en="Forecast generation failed - deal data not found",
            )

        # Calculate individual deal forecasts
        deal_forecasts = self._calculate_deal_forecasts(deals_data, now)

        # Group by period
        periods = self._group_by_period(deal_forecasts, period, now)

        # Identify at-risk and top deals
        at_risk = sorted(
            [d for d in deal_forecasts if d.risk_level in ("high", "medium")],
            key=lambda d: d.days_inactive,
            reverse=True,
        )[:10]

        top_deals = sorted(
            [d for d in deal_forecasts if d.close_probability > 0.0],
            key=lambda d: d.weighted_value,
            reverse=True,
        )[:10]

        # Totals
        total_pipeline = sum(d.current_value for d in deal_forecasts if d.close_probability > 0)
        total_weighted = sum(d.weighted_value for d in deal_forecasts)

        # Generate summaries
        summary_ar = self._build_summary_ar(periods, at_risk, total_pipeline, total_weighted, period)
        summary_en = self._build_summary_en(periods, at_risk, total_pipeline, total_weighted, period)
        recommendations = await self._generate_recommendations(periods, at_risk, total_pipeline)

        return ForecastResult(
            tenant_id=tenant_id,
            period=period,
            generated_at=now.isoformat(),
            periods=periods,
            at_risk_deals=at_risk,
            top_deals=top_deals,
            summary_ar=summary_ar,
            summary_en=summary_en,
            total_pipeline_value=round(total_pipeline, 2),
            total_weighted_value=round(total_weighted, 2),
            recommendations_ar=recommendations,
        )

    # ── Data Fetching ────────────────────────────

    async def _fetch_deals(self, tenant_id: str, db: AsyncSession) -> list[dict]:
        """Fetch active deals for the tenant."""
        from app.models.deal import Deal

        stmt = (
            select(Deal)
            .where(
                Deal.tenant_id == tenant_id,
                Deal.status.notin_(["closed_lost", "archived"]),
            )
            .order_by(Deal.created_at.desc())
        )
        rows = await db.execute(stmt)
        deals = []
        for deal in rows.scalars().all():
            last_activity = await self._get_last_activity_date(str(deal.id), db)
            deals.append({
                "id": str(deal.id),
                "name": getattr(deal, "name", "") or getattr(deal, "title", "") or "",
                "value": float(getattr(deal, "value", 0) or getattr(deal, "amount", 0) or 0),
                "stage": getattr(deal, "stage", "new") or "new",
                "status": getattr(deal, "status", "active") or "active",
                "expected_close": getattr(deal, "expected_close_date", None) or getattr(deal, "close_date", None),
                "created_at": getattr(deal, "created_at", None),
                "updated_at": getattr(deal, "updated_at", None),
                "last_activity": last_activity,
            })
        return deals

    async def _get_last_activity_date(self, deal_id: str, db: AsyncSession) -> Optional[datetime]:
        """Get the most recent activity date for a deal."""
        try:
            from app.models.activity import Activity
            stmt = (
                select(func.max(Activity.created_at))
                .where(Activity.deal_id == deal_id)
            )
            result = await db.execute(stmt)
            return result.scalar_one_or_none()
        except Exception:
            return None

    # ── Deal Forecast Calculation ────────────────

    def _calculate_deal_forecasts(
        self, deals_data: list[dict], now: datetime
    ) -> list[DealForecast]:
        """Calculate forecast for each deal."""
        forecasts = []
        for deal in deals_data:
            base_prob = STAGE_PROBABILITIES.get(deal["stage"], 0.15)

            # Adjust probability based on activity recency
            days_inactive = self._days_since(deal.get("last_activity") or deal.get("updated_at"), now)
            activity_modifier = self._activity_modifier(days_inactive)
            adjusted_prob = max(0.0, min(1.0, base_prob * activity_modifier))

            # Determine risk level
            risk_level, risk_reasons = self._assess_risk(deal, days_inactive, adjusted_prob)

            value = deal.get("value", 0) or 0
            weighted = value * adjusted_prob

            expected_close = deal.get("expected_close")
            expected_close_str = None
            if expected_close:
                if isinstance(expected_close, datetime):
                    expected_close_str = expected_close.strftime("%Y-%m-%d")
                elif isinstance(expected_close, str):
                    expected_close_str = expected_close

            forecasts.append(DealForecast(
                deal_id=deal["id"],
                deal_name=deal.get("name", ""),
                current_value=value,
                close_probability=round(adjusted_prob, 2),
                weighted_value=round(weighted, 2),
                risk_level=risk_level,
                risk_reasons_ar=risk_reasons,
                days_inactive=days_inactive,
                expected_close_date=expected_close_str,
            ))
        return forecasts

    @staticmethod
    def _days_since(dt: Optional[datetime], now: datetime) -> int:
        """Calculate days since a given datetime."""
        if not dt:
            return 30  # assume inactive if no date
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        delta = now - dt
        return max(0, delta.days)

    @staticmethod
    def _activity_modifier(days_inactive: int) -> float:
        """Reduce probability based on inactivity."""
        if days_inactive <= 2:
            return 1.0
        elif days_inactive <= 5:
            return 0.95
        elif days_inactive <= 10:
            return 0.85
        elif days_inactive <= 14:
            return 0.7
        elif days_inactive <= 21:
            return 0.5
        elif days_inactive <= 30:
            return 0.3
        else:
            return 0.15

    @staticmethod
    def _assess_risk(deal: dict, days_inactive: int, probability: float) -> tuple[str, list[str]]:
        """Assess deal risk level and generate Arabic reasons."""
        reasons = []

        if days_inactive >= RISK_THRESHOLDS["high"]:
            reasons.append(f"لا يوجد نشاط منذ {days_inactive} يوم")
        elif days_inactive >= RISK_THRESHOLDS["medium"]:
            reasons.append(f"النشاط منخفض — آخر تفاعل قبل {days_inactive} أيام")

        if probability < 0.2 and deal.get("value", 0) > 0:
            reasons.append("احتمالية الإغلاق منخفضة جداً")

        stage = deal.get("stage", "")
        expected_close = deal.get("expected_close")
        if expected_close:
            close_dt = expected_close
            if isinstance(close_dt, str):
                try:
                    close_dt = datetime.fromisoformat(close_dt.replace("Z", "+00:00"))
                except ValueError:
                    close_dt = None
            if close_dt:
                if isinstance(close_dt, datetime):
                    if close_dt.tzinfo is None:
                        close_dt = close_dt.replace(tzinfo=timezone.utc)
                    now = datetime.now(timezone.utc)
                    if close_dt < now:
                        reasons.append("تجاوز تاريخ الإغلاق المتوقع")
                    elif (close_dt - now).days < 7 and stage in ("new", "contacted", "qualified"):
                        reasons.append("تاريخ الإغلاق قريب لكن المرحلة مبكرة")

        if len(reasons) >= 2 or days_inactive >= RISK_THRESHOLDS["high"]:
            return "high", reasons
        elif len(reasons) >= 1 or days_inactive >= RISK_THRESHOLDS["medium"]:
            return "medium", reasons
        else:
            return "low", reasons

    # ── Period Grouping ──────────────────────────

    def _group_by_period(
        self, forecasts: list[DealForecast], period: str, now: datetime
    ) -> list[PeriodForecast]:
        """Group deal forecasts into monthly or quarterly buckets."""
        periods: dict[str, list[DealForecast]] = {}

        for deal in forecasts:
            if not deal.expected_close_date:
                # Default to current month/quarter
                period_key = self._get_period_key(now, period)
            else:
                try:
                    close_dt = datetime.fromisoformat(deal.expected_close_date)
                except ValueError:
                    close_dt = now
                period_key = self._get_period_key(close_dt, period)

            periods.setdefault(period_key, []).append(deal)

        result = []
        for label in sorted(periods.keys()):
            deals = periods[label]
            total_pipeline = sum(d.current_value for d in deals)
            total_weighted = sum(d.weighted_value for d in deals)
            probabilities = [d.close_probability for d in deals if d.close_probability > 0]
            avg_prob = sum(probabilities) / len(probabilities) if probabilities else 0

            # Best/worst case
            best_case = sum(d.current_value for d in deals if d.close_probability >= 0.5)
            worst_case = sum(d.current_value for d in deals if d.close_probability >= 0.8)

            result.append(PeriodForecast(
                period_label=label,
                predicted_revenue=round(total_weighted, 2),
                weighted_pipeline=round(total_pipeline, 2),
                deal_count=len(deals),
                avg_close_probability=round(avg_prob, 2),
                best_case=round(best_case, 2),
                worst_case=round(worst_case, 2),
            ))

        return result

    @staticmethod
    def _get_period_key(dt: datetime, period: str) -> str:
        """Generate a period label string."""
        if period == "quarterly":
            quarter = (dt.month - 1) // 3 + 1
            return f"Q{quarter} {dt.year}"
        else:
            month_name = MONTHS_AR.get(dt.month, str(dt.month))
            return f"{month_name} {dt.year}"

    # ── Summary Generation ───────────────────────

    @staticmethod
    def _build_summary_ar(
        periods: list[PeriodForecast],
        at_risk: list[DealForecast],
        total_pipeline: float,
        total_weighted: float,
        period_type: str,
    ) -> str:
        lines = ["ملخص التوقعات:"]
        lines.append(f"إجمالي خط الأنابيب: {total_pipeline:,.0f} ريال")
        lines.append(f"الإيراد المتوقع (مرجّح): {total_weighted:,.0f} ريال")
        lines.append("")

        period_label = "الشهر" if period_type == "monthly" else "الربع"
        for p in periods[:4]:
            lines.append(
                f"{p.period_label}: {p.predicted_revenue:,.0f} ريال متوقع "
                f"({p.deal_count} صفقة، احتمالية {p.avg_close_probability:.0%})"
            )

        if at_risk:
            lines.append("")
            lines.append(f"صفقات معرّضة للخطر ({len(at_risk)}):")
            for deal in at_risk[:5]:
                reasons = " | ".join(deal.risk_reasons_ar) if deal.risk_reasons_ar else "غير محدد"
                lines.append(f"  - {deal.deal_name}: {deal.current_value:,.0f} ريال — {reasons}")

        return "\n".join(lines)

    @staticmethod
    def _build_summary_en(
        periods: list[PeriodForecast],
        at_risk: list[DealForecast],
        total_pipeline: float,
        total_weighted: float,
        period_type: str,
    ) -> str:
        lines = ["Forecast Summary:"]
        lines.append(f"Total Pipeline: {total_pipeline:,.0f} SAR")
        lines.append(f"Weighted Revenue: {total_weighted:,.0f} SAR")
        for p in periods[:4]:
            lines.append(
                f"{p.period_label}: {p.predicted_revenue:,.0f} SAR predicted "
                f"({p.deal_count} deals, {p.avg_close_probability:.0%} avg probability)"
            )
        if at_risk:
            lines.append(f"At-risk deals: {len(at_risk)}")
        return "\n".join(lines)

    # ── AI Recommendations ───────────────────────

    async def _generate_recommendations(
        self,
        periods: list[PeriodForecast],
        at_risk: list[DealForecast],
        total_pipeline: float,
    ) -> list[str]:
        """Generate Arabic recommendations using LLM."""
        if not periods and not at_risk:
            return ["لا توجد بيانات كافية لتقديم توصيات. أضف صفقات لخط الأنابيب."]

        # Build context for LLM
        context_parts = []
        for p in periods[:3]:
            context_parts.append(
                f"{p.period_label}: إيراد متوقع {p.predicted_revenue:,.0f} ريال، "
                f"{p.deal_count} صفقة"
            )
        if at_risk:
            context_parts.append(f"صفقات معرضة للخطر: {len(at_risk)}")
            for d in at_risk[:3]:
                context_parts.append(f"  - {d.deal_name}: {d.current_value:,.0f} ريال، غير نشط {d.days_inactive} يوم")

        context_text = "\n".join(context_parts)

        system_prompt = (
            "أنت مستشار مبيعات خبير في السوق السعودي.\n"
            "بناءً على بيانات التوقعات التالية، قدّم 3-5 توصيات عملية وقابلة للتنفيذ بالعربي.\n"
            "أجب بصيغة JSON: {\"recommendations\": [\"توصية1\", \"توصية2\", ...]}"
        )

        try:
            response = await self._llm.complete(
                system_prompt=system_prompt,
                user_message=context_text,
                json_mode=True,
                temperature=0.3,
                max_tokens=512,
                fast=True,
            )
            parsed = response.parse_json()
            if parsed and "recommendations" in parsed:
                return parsed["recommendations"]
        except Exception as e:
            logger.warning(f"LLM recommendation generation failed: {e}")

        # Fallback static recommendations
        recommendations = []
        if at_risk:
            recommendations.append(
                f"تنبيه: {len(at_risk)} صفقة معرّضة للخطر. تواصل مع العملاء فوراً لإعادة التفعيل."
            )
        if total_pipeline < 100000:
            recommendations.append(
                "خط الأنابيب منخفض. ركّز على توليد عملاء محتملين جدد هذا الأسبوع."
            )
        if periods:
            low_prob_periods = [p for p in periods if p.avg_close_probability < 0.3]
            if low_prob_periods:
                recommendations.append(
                    "احتمالية الإغلاق منخفضة في بعض الفترات. راجع تأهيل العملاء المحتملين."
                )
        recommendations.append("حدّث بيانات الصفقات بانتظام لتحسين دقة التوقعات.")
        return recommendations
