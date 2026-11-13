
import re


class AIService:
    """
    Rule-based brand compliance checker.
    Keeps the existing FastAPI response format.
    """

    RISKY_CLAIMS = (
        "guaranteed",
        "guarantee",
        "guarantees",
        "best ever",
        "number one",
        "#1",
        "100% free",
        "risk-free",
        "unlimited results",
        "cheapest",
        "unbeatable",
        "unbelievable",
        "better than every competitor",
        "completely change your life",
        "100% results",
        "complete customer satisfaction",
    )

    PRESSURE_PHRASES = (
        "buy now",
        "act now",
        "hurry",
        "limited time",
    )

    # Common words used to help identify unclear English text.
    # This is a heuristic, not a language model.
    COMMON_WORDS = frozenset(
        """
        a an and are as at be because been but by can
        check choose content create discover do everyday
        explore features for from get has have how in is
        it its learn life make meet more new of on or our
        product products review see smart support that the
        their these this to today use useful we what when
        which with you your designed design technology
        brand nova tech smartwatch phone watch available
        now introducing experience information details
        professional friendly innovative activity tracking
        notifications comfortable daily routine combines
        practical benefits website email social media
        marketing offer offers services quality made
        include includes helps help customers compare
        price specifications modern about before whether
        fits needs solutions
        """.split()
    )

    @staticmethod
    def _pattern(phrase):
        """
        Match whole words or phrases, ignoring case.
        """
        escaped = re.escape(phrase.strip())
        escaped = escaped.replace(r"\ ", r"\s+")

        return re.compile(
            r"(?<!\w)" + escaped + r"(?!\w)",
            re.IGNORECASE,
        )

    @classmethod
    def _quality_problem(cls, content):
        """
        Detect very short or apparently meaningless text.
        Returns None if no obvious quality problem is found.
        """
        words = re.findall(
            r"[A-Za-z]+(?:'[A-Za-z]+)?",
            content,
        )

        if not words:
            return (
                "Insufficient Content",
                "The text has too little readable English "
                "content to evaluate.",
                "short",
            )

        if len(words) < 4:
            return (
                "Insufficient Content",
                "Add more detail so the draft can be "
                "assessed meaningfully.",
                "short",
            )

        lower = [
            word.casefold()
            for word in words
            if len(word) > 1
        ]

        if not lower:
            return (
                "Insufficient Content",
                "Add a clear description of the message.",
                "short",
            )

        recognizable = sum(
            word in cls.COMMON_WORDS
            for word in lower
        )

        common_ratio = recognizable / len(lower)
        unique_ratio = len(set(lower)) / len(lower)
        average_length = sum(
            len(word) for word in lower
        ) / len(lower)

        looks_unclear = (
            len(lower) >= 6
            and (
                (
                    common_ratio < 0.10
                    and average_length >= 4.5
                )
                or unique_ratio < 0.25
            )
        )

        if looks_unclear:
            return (
                "Unclear Content",
                "The draft may contain random or repetitive "
                "text rather than a meaningful message.",
                "unclear",
            )

        return None

    def analyze_content(self, brand, content):
        content = str(content or "").strip()

        brand_name = str(
            brand.get("brand_name") or "Your Brand"
        )

        prohibited_words = (
            brand.get("prohibited_words") or []
        )

        if not isinstance(
            prohibited_words, (list, tuple)
        ):
            prohibited_words = []

        violations = []
        used_terms = set()
        unsafe_patterns = []

        # Register a violation without double-counting
        # the exact same matched phrase.

        def register(
            issue_type,
            phrase,
            severity,
            description,
            rewrite=True,
        ):
            pattern = self._pattern(phrase)
            match = pattern.search(content)

            if not match:
                return

            matched_text = match.group(0)
            normalized = matched_text.casefold()

            if normalized in used_terms:
                return

            used_terms.add(normalized)

            violations.append({
                "type": issue_type,
                "word": matched_text,
                "severity": severity,
                "description": description,
            })

            if rewrite:
                unsafe_patterns.append(pattern)

        # 1. Prohibited brand words

        for term in prohibited_words:
            if not isinstance(term, str):
                continue

            term = term.strip()

            if not term:
                continue

            register(
                "Prohibited Word",
                term,
                "High",
                f"'{term}' is not allowed by this "
                "brand's rules.",
            )

        # 2. Unsupported or exaggerated claims

        for phrase in self.RISKY_CLAIMS:
            register(
                "Unsupported Claim",
                phrase,
                "Medium",
                f"'{phrase}' may require evidence "
                "or be too absolute.",
            )

        # 3. Excessive sales pressure

        for phrase in self.PRESSURE_PHRASES:
            register(
                "Promotional Language",
                phrase,
                "Low",
                f"'{phrase}' may create unnecessary "
                "sales pressure.",
                rewrite=False,
            )

        # 4. Excessive punctuation

        if content.count("!") > 2:
            violations.append({
                "type": "Tone Issue",
                "word": "Excessive exclamation marks",
                "severity": "Low",
                "description":
                    "Too many exclamation marks may "
                    "affect the brand's tone.",
            })

        # 5. Basic content-quality validation

        quality = self._quality_problem(content)

        if quality:
            title, description, quality_level = quality

            violations.append({
                "type": "Content Quality",
                "word": title,
                "severity": (
                    "High"
                    if quality_level == "unclear"
                    else "Medium"
                ),
                "description": description,
            })
        else:
            quality_level = None

        # 6. Calculate compliance score

        deductions = {
            "High": 25,
            "Medium": 15,
            "Low": 5,
        }

        total_deduction = sum(
            deductions[item["severity"]]
            for item in violations
        )

        score = max(0, 100 - total_deduction)

        # Unclear text cannot receive a perfect score.

        if quality_level == "unclear":
            score = min(score, 30)

        elif quality_level == "short":
            score = min(score, 70)

        # 7. Generate conservative corrected content

        if quality_level:
            corrected_content = (
                "This draft needs a clearer message. "
                f"Write a factual description of "
                f"{brand_name}'s product or service, "
                "including only details you can verify."
            )

        else:
            paragraphs = re.split(
                r"\n\s*\n",
                content,
            )

            safe_paragraphs = []
            removed_any = False

            for paragraph in paragraphs:
                sentences = re.split(
                    r"(?<=[.!?])\s+",
                    paragraph.strip(),
                )

                kept_sentences = []

                for sentence in sentences:

                    # Remove sentences containing prohibited
                    # terms or unverified claims rather than
                    # inserting '[removed]' placeholders.

                    if any(
                        pattern.search(sentence)
                        for pattern in unsafe_patterns
                    ):
                        removed_any = True
                        continue

                    safe_sentence = sentence

                    # Soften promotional instructions.

                    replacements = (
                        ("buy now", "Learn more"),
                        (
                            "act now",
                            "Explore the details",
                        ),
                        ("hurry", "Take a look"),
                        ("limited time", "current"),
                    )

                    for phrase, replacement in replacements:
                        safe_sentence = self._pattern(
                            phrase
                        ).sub(
                            replacement,
                            safe_sentence,
                        )

                    # Reduce excessive exclamation marks.

                    if content.count("!") > 2:
                        safe_sentence = re.sub(
                            r"!+",
                            ".",
                            safe_sentence,
                        )

                    if safe_sentence.strip():
                        kept_sentences.append(
                            safe_sentence.strip()
                        )

                if kept_sentences:
                    safe_paragraphs.append(
                        " ".join(kept_sentences)
                    )

            corrected_content = "\n\n".join(
                safe_paragraphs
            ).strip()

            # Add a neutral closing when unsafe claims
            # were removed.

            if removed_any:
                closing = (
                    "Explore the product details and "
                    "verify its features before deciding "
                    "if it meets your needs."
                )

                corrected_content = (
                    corrected_content
                    + "\n\n"
                    + closing
                ).strip()

            if not corrected_content:
                corrected_content = (
                    f"Learn more about {brand_name}'s "
                    "products and services. Review verified "
                    "details to decide whether they "
                    "meet your needs."
                )

        # 8. Generate result summary

        if violations:
            summary = (
                f"{brand_name}: Found {len(violations)} "
                "potential compliance issue(s). "
                "Review the flagged items and "
                "suggested changes."
            )
        else:
            summary = (
                f"{brand_name}: No issues detected "
                "by the current rule-based checks."
            )

        # 9. Return the existing API response format

        return {
            "compliance_score": score,
            "ai_summary": summary,
            "violations": violations,
            "corrected_content": corrected_content,
        }


ai_service = AIService()
