"""
Deal Taxonomy — Complete taxonomy of 15 B2B deal types with templates and qualification flows.
تصنيف الصفقات: 15 نوعاً من صفقات الشراكات بين الشركات مع قوالب وأسئلة تأهيل
"""

import logging
from typing import Optional

from pydantic import BaseModel, Field

logger = logging.getLogger("dealix.strategic_deals.taxonomy")


# ── Taxonomy Schema ─────────────────────────────────────────────────────────


class DealTypeSpec(BaseModel):
    """Full specification for a deal type in the taxonomy."""
    id: str
    name: str
    name_ar: str
    description: str
    description_ar: str
    qualification_questions: list[str]  # Arabic questions
    typical_terms: list[str]
    risk_level: str  # low, medium, high
    approval_level: str  # mode_0 through mode_4
    need_categories: list[str]  # Which need categories this deal type addresses
    example_ar: str  # Real-world Saudi example


# ── The 15-Type Taxonomy ────────────────────────────────────────────────────

DEAL_TAXONOMY: dict[str, dict] = {
    "service_barter": {
        "name": "Service-for-Service Exchange",
        "name_ar": "تبادل خدمات",
        "description": "Exchange services of equivalent value without cash transactions",
        "description_ar": "تبادل خدمات بقيمة متساوية بين شركتين بدون تدفقات نقدية",
        "qualification_questions": [
            "ما الخدمة التي تقدمونها للتبادل؟",
            "ما القيمة التقديرية لهذه الخدمة بالريال السعودي؟",
            "ما الخدمة التي تحتاجونها بالمقابل؟",
            "ما المدة المتوقعة لهذا التبادل؟",
            "هل لديكم خبرة سابقة في تبادل الخدمات؟",
        ],
        "typical_terms": [
            "duration",
            "scope",
            "quality_sla",
            "cancellation",
            "value_equivalence_method",
            "dispute_resolution",
        ],
        "risk_level": "low",
        "approval_level": "mode_2",
        "need_categories": ["marketing", "technology", "delivery"],
        "example_ar": "شركة تسويق تقدم حملات رقمية لشركة برمجيات مقابل تطوير موقع إلكتروني",
    },
    "referral_partnership": {
        "name": "Referral Partnership",
        "name_ar": "شراكة إحالة",
        "description": "Earn commission by referring qualified leads to each other",
        "description_ar": "كسب عمولة من خلال إحالة عملاء مؤهلين بين الشركتين",
        "qualification_questions": [
            "ما نوع العملاء الذين تحيلونهم عادة؟",
            "ما نسبة العمولة المتوقعة؟",
            "كيف يتم تتبع الإحالات؟",
            "ما هو متوسط حجم الصفقة لعملائكم؟",
        ],
        "typical_terms": [
            "commission_rate",
            "tracking_method",
            "payment_schedule",
            "exclusivity",
            "minimum_referrals",
            "non_compete",
        ],
        "risk_level": "low",
        "approval_level": "mode_2",
        "need_categories": ["sales", "marketing"],
        "example_ar": "مكتب محاماة يحيل عملاءه لشركة محاسبة مقابل 10% من قيمة أول عقد",
    },
    "co_selling": {
        "name": "Co-Selling Agreement",
        "name_ar": "بيع مشترك",
        "description": "Joint sales efforts targeting shared opportunities",
        "description_ar": "جهود بيع مشتركة لاستهداف فرص مشتركة بين الشركتين",
        "qualification_questions": [
            "ما المنتجات أو الخدمات التي ستباع بشكل مشترك؟",
            "كيف سيتم تقسيم الإيرادات؟",
            "من يقود عملية البيع؟",
            "ما القطاعات المستهدفة؟",
            "هل لديكم فريق مبيعات مخصص لهذا الغرض؟",
        ],
        "typical_terms": [
            "revenue_split",
            "lead_ownership",
            "territory",
            "sales_process",
            "brand_usage",
            "training_requirements",
        ],
        "risk_level": "medium",
        "approval_level": "mode_3",
        "need_categories": ["sales", "distribution"],
        "example_ar": "شركة برمجيات وشركة استشارات يبيعون حلولاً متكاملة لقطاع الصحة",
    },
    "co_marketing": {
        "name": "Co-Marketing Campaign",
        "name_ar": "تسويق مشترك",
        "description": "Joint marketing campaigns sharing costs and audiences",
        "description_ar": "حملات تسويقية مشتركة مع تقاسم التكاليف والجمهور المستهدف",
        "qualification_questions": [
            "ما القنوات التسويقية المستهدفة؟",
            "ما الميزانية المتوقعة من كل طرف؟",
            "من الجمهور المستهدف المشترك؟",
            "ما مؤشرات النجاح المتفق عليها؟",
        ],
        "typical_terms": [
            "budget_split",
            "channels",
            "brand_guidelines",
            "content_approval",
            "lead_sharing",
            "duration",
        ],
        "risk_level": "low",
        "approval_level": "mode_2",
        "need_categories": ["marketing"],
        "example_ar": "شركتا تقنية تشتركان في رعاية مؤتمر قطاع التجزئة وتتقاسمان العملاء المحتملين",
    },
    "subcontracting": {
        "name": "Subcontracting Agreement",
        "name_ar": "عقد باطن (مقاولة فرعية)",
        "description": "Outsource specific project scope to a specialized partner",
        "description_ar": "إسناد جزء من نطاق المشروع لشريك متخصص كمقاول فرعي",
        "qualification_questions": [
            "ما نطاق العمل المطلوب إسناده؟",
            "ما المهارات والشهادات المطلوبة؟",
            "ما الجدول الزمني للتسليم؟",
            "هل المشروع حكومي أو خاص؟",
            "ما شروط الضمان والجودة؟",
        ],
        "typical_terms": [
            "scope_of_work",
            "payment_milestones",
            "quality_standards",
            "liability",
            "insurance",
            "confidentiality",
            "penalties",
        ],
        "risk_level": "medium",
        "approval_level": "mode_3",
        "need_categories": ["delivery", "talent"],
        "example_ar": "شركة مقاولات كبرى تسند أعمال الكهرباء لشركة متخصصة في مشروع حكومي",
    },
    "white_label": {
        "name": "White-Label / Private Label",
        "name_ar": "علامة بيضاء",
        "description": "Provide products or services under the partner's brand",
        "description_ar": "تقديم منتجات أو خدمات تحت العلامة التجارية للشريك",
        "qualification_questions": [
            "ما المنتج أو الخدمة المراد تقديمها تحت علامتهم؟",
            "ما مستوى التخصيص المطلوب؟",
            "كيف سيتم التسعير والهوامش؟",
            "ما متطلبات الجودة والدعم الفني؟",
        ],
        "typical_terms": [
            "branding_rights",
            "customization_scope",
            "pricing_structure",
            "minimum_volume",
            "exclusivity",
            "support_sla",
            "ip_ownership",
        ],
        "risk_level": "medium",
        "approval_level": "mode_3",
        "need_categories": ["technology", "delivery"],
        "example_ar": "شركة برمجيات سعودية توفر نظام CRM تحت العلامة التجارية لشركة اتصالات",
    },
    "reseller": {
        "name": "Reseller Agreement",
        "name_ar": "اتفاقية موزع معتمد",
        "description": "Authorized resale of products or services with margin",
        "description_ar": "إعادة بيع منتجات أو خدمات الشريك بصفة موزع معتمد مع هامش ربح",
        "qualification_questions": [
            "ما المنتجات المراد توزيعها؟",
            "ما المنطقة الجغرافية المستهدفة؟",
            "هل التوزيع حصري أم غير حصري؟",
            "ما هامش الربح المتوقع؟",
            "ما حجم المبيعات المتوقع سنوياً؟",
        ],
        "typical_terms": [
            "territory",
            "exclusivity",
            "margin_structure",
            "minimum_purchase",
            "payment_terms",
            "marketing_support",
            "training",
            "return_policy",
        ],
        "risk_level": "medium",
        "approval_level": "mode_3",
        "need_categories": ["distribution", "sales"],
        "example_ar": "شركة سعودية توزع حلول أمن سيبراني لشركة أمريكية في منطقة الخليج",
    },
    "strategic_alliance": {
        "name": "Strategic Alliance",
        "name_ar": "تحالف استراتيجي",
        "description": "Long-term strategic collaboration without equity exchange",
        "description_ar": "تعاون استراتيجي طويل الأمد بدون تبادل حصص ملكية",
        "qualification_questions": [
            "ما الأهداف الاستراتيجية المشتركة؟",
            "ما مدة التحالف المتوقعة؟",
            "كيف ستتم الحوكمة واتخاذ القرارات؟",
            "ما الموارد التي سيساهم بها كل طرف؟",
            "هل هناك اتفاقيات عدم منافسة؟",
        ],
        "typical_terms": [
            "strategic_objectives",
            "governance_structure",
            "resource_commitments",
            "non_compete",
            "exit_terms",
            "ip_sharing",
            "confidentiality",
        ],
        "risk_level": "high",
        "approval_level": "mode_4",
        "need_categories": ["capital", "distribution", "technology"],
        "example_ar": "شركة لوجستية وشركة تقنية يتحالفان لتقديم حلول سلسلة إمداد ذكية للسوق السعودي",
    },
    "channel_partnership": {
        "name": "Channel Partnership",
        "name_ar": "شراكة قنوات توزيع",
        "description": "Leverage partner's sales channels for distribution",
        "description_ar": "الاستفادة من قنوات بيع الشريك لتوزيع منتجاتك وخدماتك",
        "qualification_questions": [
            "ما القنوات التي يمتلكها الشريك؟",
            "ما حجم قاعدة عملائهم؟",
            "كيف سيتم تقسيم المسؤوليات؟",
            "ما الدعم المطلوب للقناة (تدريب، مواد تسويقية)؟",
        ],
        "typical_terms": [
            "channel_type",
            "commission_structure",
            "training_requirements",
            "marketing_support",
            "performance_targets",
            "reporting_frequency",
        ],
        "risk_level": "medium",
        "approval_level": "mode_3",
        "need_categories": ["distribution", "sales"],
        "example_ar": "شركة SaaS تستخدم شبكة استشاري إداريين لبيع منتجها في المملكة",
    },
    "joint_venture": {
        "name": "Joint Venture",
        "name_ar": "مشروع مشترك",
        "description": "Create a new entity jointly owned by both parties",
        "description_ar": "إنشاء كيان جديد مملوك بشكل مشترك بين الطرفين",
        "qualification_questions": [
            "ما هدف المشروع المشترك؟",
            "ما نسبة مساهمة كل طرف؟",
            "ما الشكل القانوني المقترح (شركة ذات مسؤولية محدودة، شراكة)؟",
            "من سيتولى الإدارة اليومية؟",
            "ما استراتيجية الخروج؟",
            "كيف ستوزع الأرباح والخسائر؟",
        ],
        "typical_terms": [
            "equity_split",
            "capital_contributions",
            "governance",
            "management_structure",
            "profit_distribution",
            "exit_strategy",
            "non_compete",
            "dispute_resolution",
        ],
        "risk_level": "high",
        "approval_level": "mode_4",
        "need_categories": ["capital", "technology", "distribution"],
        "example_ar": "مستثمر سعودي وشركة تقنية أجنبية ينشئون شركة مشتركة لتقديم حلول الذكاء الاصطناعي محلياً",
    },
    "acquisition_scouting": {
        "name": "Acquisition Scouting",
        "name_ar": "استكشاف استحواذ",
        "description": "Identify and qualify potential acquisition targets",
        "description_ar": "تحديد وتأهيل الشركات المرشحة للاستحواذ",
        "qualification_questions": [
            "ما القطاع المستهدف للاستحواذ؟",
            "ما الحجم المثالي للشركة المستهدفة (إيرادات، موظفين)؟",
            "ما الميزانية المتاحة للاستحواذ؟",
            "هل تبحثون عن استحواذ كامل أو حصة جزئية؟",
            "ما الأصول الاستراتيجية المطلوبة (تقنية، عملاء، تراخيص)؟",
        ],
        "typical_terms": [
            "target_criteria",
            "valuation_method",
            "due_diligence_scope",
            "exclusivity_period",
            "advisory_fees",
            "confidentiality",
        ],
        "risk_level": "high",
        "approval_level": "mode_4",
        "need_categories": ["capital", "technology"],
        "example_ar": "مجموعة سعودية تبحث عن شركات تقنية ناشئة للاستحواذ بميزانية 5-20 مليون ريال",
    },
    "investment_intro": {
        "name": "Investment Introduction",
        "name_ar": "تقديم فرصة استثمارية",
        "description": "Connect companies with investors or investment opportunities",
        "description_ar": "ربط الشركات بمستثمرين أو فرص استثمارية مناسبة",
        "qualification_questions": [
            "هل تبحثون عن استثمار أم مستثمر؟",
            "ما حجم التمويل المطلوب أو المتاح؟",
            "ما مرحلة نمو الشركة؟",
            "ما العائد المتوقع على الاستثمار؟",
            "هل لديكم عرض تقديمي (Pitch Deck) جاهز؟",
        ],
        "typical_terms": [
            "investment_size",
            "valuation",
            "equity_offered",
            "use_of_funds",
            "board_representation",
            "anti_dilution",
            "introducer_fee",
        ],
        "risk_level": "high",
        "approval_level": "mode_4",
        "need_categories": ["capital"],
        "example_ar": "شركة ناشئة سعودية تبحث عن جولة تمويل Series A بقيمة 10 مليون ريال",
    },
    "vendor_replacement": {
        "name": "Vendor Replacement",
        "name_ar": "استبدال مورد",
        "description": "Replace an existing vendor with a better-fit partner",
        "description_ar": "استبدال مورد حالي بشريك أفضل من حيث الجودة أو السعر أو الخدمة",
        "qualification_questions": [
            "ما الخدمة أو المنتج الذي يقدمه المورد الحالي؟",
            "ما أسباب الرغبة في التغيير؟",
            "ما معايير اختيار المورد الجديد؟",
            "ما الميزانية المتاحة؟",
            "ما الجدول الزمني المطلوب للانتقال؟",
        ],
        "typical_terms": [
            "transition_plan",
            "pricing_comparison",
            "service_level_agreement",
            "contract_duration",
            "penalty_clauses",
            "data_migration",
        ],
        "risk_level": "medium",
        "approval_level": "mode_3",
        "need_categories": ["delivery", "technology"],
        "example_ar": "مستشفى يبحث عن مورد جديد لمستلزمات طبية بعد انتهاء عقد المورد الحالي",
    },
    "capability_gap_fill": {
        "name": "Capability Gap Fill",
        "name_ar": "سد فجوة القدرات",
        "description": "Partner with a company to fill a specific capability gap",
        "description_ar": "التعاون مع شركة متخصصة لسد فجوة في قدرات شركتك",
        "qualification_questions": [
            "ما الفجوة التي تحتاجون سدها؟",
            "هل هي فجوة مؤقتة أم دائمة؟",
            "ما مستوى التخصص المطلوب؟",
            "هل تفضلون شريكاً محلياً أم دولياً؟",
            "ما ميزانية سد هذه الفجوة؟",
        ],
        "typical_terms": [
            "gap_definition",
            "duration",
            "knowledge_transfer",
            "performance_metrics",
            "pricing",
            "confidentiality",
            "training_commitment",
        ],
        "risk_level": "low",
        "approval_level": "mode_2",
        "need_categories": ["talent", "technology", "delivery"],
        "example_ar": "شركة مقاولات تتعاون مع شركة تصميم معماري لتقديم عروض متكاملة",
    },
    "tender_consortium": {
        "name": "Tender Consortium",
        "name_ar": "تحالف مناقصات",
        "description": "Form a consortium to jointly bid on large tenders",
        "description_ar": "تشكيل تحالف للتقدم بعرض مشترك في المناقصات الكبرى",
        "qualification_questions": [
            "ما المناقصة أو المشروع المستهدف؟",
            "ما الجهة المالكة للمناقصة؟",
            "ما التخصصات المطلوبة لتكوين التحالف؟",
            "ما الموعد النهائي لتقديم العرض؟",
            "هل لديكم خبرة سابقة في المناقصات الحكومية؟",
            "ما نسبة المحتوى المحلي المطلوبة؟",
        ],
        "typical_terms": [
            "scope_allocation",
            "revenue_split",
            "lead_partner",
            "joint_liability",
            "bid_bond",
            "performance_bond",
            "local_content",
            "governance",
        ],
        "risk_level": "high",
        "approval_level": "mode_4",
        "need_categories": ["delivery", "capital", "talent"],
        "example_ar": "ثلاث شركات سعودية تتحالف للتقدم لمناقصة مشروع بنية تحتية حكومي بقيمة 50 مليون ريال",
    },
}

# ── Mapping from need categories to deal types ──────────────────────────────

_NEED_TO_DEAL_MAP: dict[str, list[str]] = {}
for _deal_id, _spec in DEAL_TAXONOMY.items():
    for _cat in _spec["need_categories"]:
        _NEED_TO_DEAL_MAP.setdefault(_cat, []).append(_deal_id)


# ── Service ─────────────────────────────────────────────────────────────────


class DealTaxonomyService:
    """
    Provides lookup and intelligence over the 15-type deal taxonomy.
    خدمة تصنيف الصفقات: بحث واقتراحات ذكية لأنواع الصفقات الخمسة عشر
    """

    @staticmethod
    def get_deal_type(type_id: str) -> Optional[DealTypeSpec]:
        """Return full spec for a deal type, or None if not found."""
        raw = DEAL_TAXONOMY.get(type_id)
        if not raw:
            return None
        return DealTypeSpec(id=type_id, **raw)

    @staticmethod
    def get_all_types() -> list[DealTypeSpec]:
        """Return all 15 deal types as structured specs."""
        return [
            DealTypeSpec(id=type_id, **spec)
            for type_id, spec in DEAL_TAXONOMY.items()
        ]

    @staticmethod
    def get_types_for_need(need_category: str) -> list[str]:
        """
        Return deal type IDs that address a given need category.
        إرجاع أنواع الصفقات التي تلبي فئة احتياج معينة
        """
        return _NEED_TO_DEAL_MAP.get(need_category, [])

    @staticmethod
    def get_qualification_questions(type_id: str, language: str = "ar") -> list[str]:
        """
        Return qualification questions for a deal type.
        إرجاع أسئلة التأهيل لنوع صفقة معين
        """
        spec = DEAL_TAXONOMY.get(type_id)
        if not spec:
            return []
        questions = spec["qualification_questions"]
        if language == "ar":
            return questions
        # English placeholders — in production these would be translated
        return [f"[Q{i+1}] {q}" for i, q in enumerate(questions)]

    @staticmethod
    def get_typical_terms(type_id: str) -> list[str]:
        """Return typical negotiation terms for a deal type."""
        spec = DEAL_TAXONOMY.get(type_id)
        if not spec:
            return []
        return spec["typical_terms"]

    @staticmethod
    def suggest_deal_type(
        capability_category: str,
        need_category: str,
    ) -> str:
        """
        Suggest the best deal type given a capability and a need.
        اقتراح أفضل نوع صفقة بناءً على القدرة والاحتياج
        """
        # Priority matrix: (capability_cat, need_cat) -> preferred deal type
        priority_map: dict[tuple[str, str], str] = {
            ("service", "marketing"): "co_marketing",
            ("service", "sales"): "co_selling",
            ("service", "delivery"): "subcontracting",
            ("service", "technology"): "capability_gap_fill",
            ("product", "distribution"): "reseller",
            ("product", "sales"): "channel_partnership",
            ("expertise", "talent"): "capability_gap_fill",
            ("expertise", "technology"): "white_label",
            ("capacity", "delivery"): "subcontracting",
            ("capacity", "capital"): "joint_venture",
            ("distribution", "marketing"): "co_marketing",
            ("distribution", "sales"): "channel_partnership",
            ("distribution", "distribution"): "reseller",
            ("technology", "technology"): "white_label",
            ("technology", "capital"): "investment_intro",
        }

        specific = priority_map.get((capability_category, need_category))
        if specific:
            logger.info(
                "Suggested deal type %s for capability=%s, need=%s",
                specific, capability_category, need_category,
            )
            return specific

        # Fallback: find deal types matching the need category
        candidates = _NEED_TO_DEAL_MAP.get(need_category, [])
        if candidates:
            # Prefer lower-risk options first
            risk_order = {"low": 0, "medium": 1, "high": 2}
            candidates_sorted = sorted(
                candidates,
                key=lambda t: risk_order.get(DEAL_TAXONOMY[t]["risk_level"], 1),
            )
            result = candidates_sorted[0]
            logger.info(
                "Fallback deal type %s for capability=%s, need=%s",
                result, capability_category, need_category,
            )
            return result

        logger.info(
            "No specific deal type found for capability=%s, need=%s; defaulting to referral_partnership",
            capability_category, need_category,
        )
        return "referral_partnership"

    @staticmethod
    def get_risk_level(type_id: str) -> str:
        """Return the risk level for a deal type."""
        spec = DEAL_TAXONOMY.get(type_id)
        return spec["risk_level"] if spec else "medium"

    @staticmethod
    def get_approval_level(type_id: str) -> str:
        """Return the minimum operating mode required for this deal type."""
        spec = DEAL_TAXONOMY.get(type_id)
        return spec["approval_level"] if spec else "mode_3"

    @staticmethod
    def search_types(query: str) -> list[DealTypeSpec]:
        """
        Search deal types by keyword (English or Arabic).
        بحث في أنواع الصفقات بكلمة مفتاحية
        """
        query_lower = query.lower().strip()
        results = []
        for type_id, spec in DEAL_TAXONOMY.items():
            searchable = " ".join([
                type_id,
                spec["name"].lower(),
                spec["name_ar"],
                spec["description"].lower(),
                spec["description_ar"],
            ])
            if query_lower in searchable:
                results.append(DealTypeSpec(id=type_id, **spec))
        return results
