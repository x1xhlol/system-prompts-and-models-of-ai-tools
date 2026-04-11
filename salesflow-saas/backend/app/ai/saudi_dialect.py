"""
Saudi Dialect Processor — The secret sauce for authentic Saudi Arabic AI conversations.
Handles dialect awareness, tone switching, and cultural nuances.
"""


class SaudiDialectProcessor:
    """
    Processes and generates text in authentic Saudi Arabic dialect.
    Supports multiple regional variants and formality levels.
    """

    # ── Saudi Greeting Templates ──────────────────

    GREETINGS = {
        "formal": [
            "السلام عليكم ورحمة الله وبركاته",
            "حياك الله ومرحبا بك",
            "أهلاً وسهلاً، كيف حالك؟",
            "الله يحييك، نورت",
        ],
        "casual": [
            "هلا والله!",
            "أهلين وسهلين!",
            "هلا وغلا، كيفك؟",
            "يا هلا فيك!",
            "حياك!",
        ],
        "business": [
            "السلام عليكم، حياك الله",
            "أهلاً بك، يسعدنا تواصلك معنا",
            "مرحباً بك في ديل اي اكس",
            "حياك الله ومرحبا، كيف نقدر نخدمك؟",
        ],
    }

    # ── Common Saudi Expressions ──────────────────

    EXPRESSIONS = {
        "yes": ["إي", "أيوا", "تمام", "أكيد", "بالتأكيد", "ان شاء الله"],
        "no": ["لا", "ما يناسبني", "مو الحين", "مب الحين", "خلنا نشوف"],
        "thanks": ["الله يعطيك العافية", "مشكور", "يعطيك ألف عافية", "تسلم"],
        "goodbye": ["الله يوفقك", "في أمان الله", "الله يسعدك", "تشرفنا"],
        "interest": ["يهمني الموضوع", "خلني أفهم أكثر", "عطني تفاصيل"],
        "thinking": ["خلني أفكر", "أشوف الموضوع", "أرجع لك", "خلني أستشير"],
        "agreement": ["ماشي", "تمام كذا", "موافق", "يا هلا فيها"],
        "praise": ["ماشاء الله", "الله يبارك", "عمل ممتاز", "أحسنت"],
    }

    # ── Industry-specific Saudi Terms ─────────────

    INDUSTRY_TERMS = {
        "real_estate": {
            "lead": "عميل محتمل",
            "developer": "مطور عقاري",
            "brokerage": "مكتب وساطة",
            "listing": "عقار معروض",
            "commission": "سعاية / عمولة",
        },
        "restaurant": {
            "franchise": "امتياز تجاري",
            "delivery": "توصيل",
            "dine_in": "جلسات داخلية",
            "health_cert": "شهادة صحية",
        },
        "healthcare": {
            "clinic": "عيادة / مجمع طبي",
            "appointment": "موعد",
            "patient": "مريض / مراجع",
            "insurance": "تأمين طبي",
        },
        "education": {
            "enrollment": "تسجيل",
            "tuition": "رسوم دراسية",
            "curriculum": "منهج دراسي",
        },
        "ecommerce": {
            "order": "طلب",
            "shipping": "شحن",
            "return": "إرجاع / استبدال",
            "cart": "سلة المشتريات",
        },
    }

    # ── Tone Configurations ───────────────────────

    TONE_CONFIGS = {
        "professional_friendly": {
            "description": "محترف وودي — مثالي للتواصل الأولي مع الشركات",
            "rules": [
                "استخدم صيغة المخاطب المفرد (أنت/حضرتك)",
                "ابدأ بالسلام والتحية",
                "كن مباشراً في الطرح بدون إطالة",
                "استخدم أمثلة عملية من السوق السعودي",
                "تجنب المبالغة في الرسمية",
                "استخدم 'حضرتك' مع الرسميين و'أنت' مع الباقي",
            ],
        },
        "casual_warm": {
            "description": "عفوي ودافئ — للمتابعة والمحادثات غير الرسمية",
            "rules": [
                "استخدم تعبيرات سعودية طبيعية",
                "أضف لمسة شخصية في الكلام",
                "استخدم الإيموجي بشكل معتدل",
                "كأنك تكلم صاحبك في شغل",
                "تجنب الرسمية الزائدة",
            ],
        },
        "executive": {
            "description": "تنفيذي رسمي — لكبار المسؤولين والشركات الكبرى",
            "rules": [
                "استخدم لغة احترافية عالية",
                "أرفق أرقام وإحصائيات",
                "ركز على ROI والنتائج",
                "استخدم 'حضرتكم' للمخاطب",
                "تجنب الإطالة — المدراء مشغولين",
            ],
        },
    }

    # ── Regional Dialect Awareness ────────────────

    REGIONAL_MARKERS = {
        "najdi": {  # Riyadh, Qassim
            "markers": ["ايش", "كذا", "يا رجال", "وش لونك"],
            "greeting": "هلا والله، وش لونك؟",
        },
        "hijazi": {  # Jeddah, Makkah, Madinah
            "markers": ["كده", "ليش", "يا زين", "دحين"],
            "greeting": "أهلين، كيف الحال؟",
        },
        "sharqawi": {  # Dammam, Khobar, Dhahran
            "markers": ["شلونك", "هاي", "بعد", "يا بوي"],
            "greeting": "هلا، شلونك؟",
        },
    }

    # ── Main Processing Methods ───────────────────

    @classmethod
    def get_system_prompt_additions(
        cls,
        tone: str = "professional_friendly",
        sector: str = None,
        region: str = None,
    ) -> str:
        """
        Generate additional prompt instructions for Saudi dialect.
        Append this to the agent's system prompt.
        """
        parts = []

        # Tone rules
        tone_config = cls.TONE_CONFIGS.get(tone, cls.TONE_CONFIGS["professional_friendly"])
        parts.append(f"\n## أسلوب التواصل: {tone_config['description']}")
        parts.append("### قواعد الأسلوب:")
        for rule in tone_config["rules"]:
            parts.append(f"- {rule}")

        # Sector-specific terms
        if sector and sector in cls.INDUSTRY_TERMS:
            parts.append(f"\n### مصطلحات القطاع ({sector}):")
            for eng, ar in cls.INDUSTRY_TERMS[sector].items():
                parts.append(f"- {eng} = {ar}")

        # Regional awareness
        if region and region in cls.REGIONAL_MARKERS:
            regional = cls.REGIONAL_MARKERS[region]
            parts.append(f"\n### لهجة المنطقة ({region}):")
            parts.append(f"- تحية مناسبة: {regional['greeting']}")
            parts.append(f"- كلمات مألوفة: {', '.join(regional['markers'])}")

        # General Saudi rules
        parts.append("\n### قواعد عامة للتواصل بالسعودية:")
        parts.append("- لا تستخدم لهجة مصرية أو شامية أو مغربية")
        parts.append("- استخدم 'ريال' وليس 'جنيه' أو 'دولار'")
        parts.append("- راعي أوقات العمل السعودية (الأحد-الخميس)")
        parts.append("- احترم أوقات الصلاة وتجنب التواصل خلالها")
        parts.append("- استخدم التقويم الهجري إذا ذُكر")
        parts.append("- الشركات الحكومية = رسمي جداً")
        parts.append("- القطاع الخاص = محترف وودي")
        parts.append("- المنشآت الصغيرة = عفوي ومباشر")

        return "\n".join(parts)

    @classmethod
    def get_greeting(cls, tone: str = "business") -> str:
        """Get a random appropriate greeting."""
        import random
        greetings = cls.GREETINGS.get(tone, cls.GREETINGS["business"])
        return random.choice(greetings)

    @classmethod
    def get_farewell(cls) -> str:
        import random
        return random.choice(cls.EXPRESSIONS["goodbye"])

    @classmethod
    def enhance_message(cls, message: str, tone: str = "professional_friendly") -> str:
        """Add Saudi conversational touches to a message."""
        # This is a simple enhancement; the real magic happens in the LLM prompt
        if not message.startswith(("السلام", "أهلا", "هلا", "حياك", "مرحب")):
            greeting = cls.get_greeting(
                "formal" if tone == "executive" else "business"
            )
            message = f"{greeting}\n\n{message}"

        if not message.endswith(("الله", "عافية", "تشرفنا", "أمان")):
            farewell = cls.get_farewell()
            message = f"{message}\n\n{farewell}"

        return message

    @classmethod
    def detect_region(cls, text: str) -> str:
        """Detect the regional dialect from text."""
        text_lower = text.lower()
        scores = {}

        for region, config in cls.REGIONAL_MARKERS.items():
            score = sum(1 for marker in config["markers"] if marker in text_lower)
            scores[region] = score

        if max(scores.values(), default=0) > 0:
            return max(scores, key=scores.get)
        return "najdi"  # Default to Najdi (most common)

    @classmethod
    def get_objection_responses(cls, objection_type: str) -> list:
        """Get culturally appropriate objection responses."""
        responses = {
            "price": [
                "أفهم تماماً، خلني أوضح لك القيمة اللي بترجع عليك من الاستثمار هذا...",
                "سعرنا تنافسي مقارنة بالسوق، وعندنا ضمان ذهبي إذا ما حصلت نتائج",
                "كثير من عملاءنا قالوا نفس الكلام بالبداية، بس بعد ما جربوا شافوا الفرق",
            ],
            "timing": [
                "ما فيه أحسن وقت من الحين، المنافسين ما بينتظرونك",
                "أفهم إنك مشغول، ممكن نحجز لك 15 دقيقة بس عشان توضح لك الصورة",
                "كثير من الشركات تأجل وبعدين تندم إنها ما بدت بدري",
            ],
            "competitor": [
                "كل نظام له مميزاته، بس خلني أوريك وش يميزنا عنهم بالتحديد",
                "حياك، المقارنة حقك. خلنا نسوي لك عرض مقارنة واضح",
                "كثير من عملاءنا كانوا يستخدمون [المنافس] وحولوا لنا، وش تبي أشرح لك ليش؟",
            ],
            "authority": [
                "طيب، وش رأيك نجهز لك ملخص تقدر تشاركه مع صاحب القرار؟",
                "ممكن نسوي لك عرض مختصر بالأرقام عشان يسهل عليك الشرح",
                "عادي، ممكن ندعو صاحب القرار معك في الاجتماع القادم",
            ],
        }
        return responses.get(objection_type, responses["price"])
