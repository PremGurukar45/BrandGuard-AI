
import re


class AIService:

    def analyze_content(self, brand, content):

        prohibited_words = brand.get("prohibited_words") or []
        brand_name = brand.get("brand_name", "Your Brand")

        violations = []
        corrected_content = content

        # 1. Detect prohibited words
        for word in prohibited_words:
            if not word.strip():
                continue

            pattern = re.compile(re.escape(word), re.IGNORECASE)

            if pattern.search(corrected_content):
                violations.append({
                    "type": "Prohibited Word",
                    "word": word,
                    "severity": "High",
                    "description": f"'{word}' is not allowed by brand guidelines."
                })

                corrected_content = pattern.sub(
                    "[removed]",
                    corrected_content
                )

       
        # 2. Detect unsupported claims
        risky_claims = {
            "guaranteed": "designed to help",
            "best ever": "a great choice",
            "number one": "a popular choice",
            "#1": "a popular choice",
            "100% free": "explore our offer",
            "risk-free": "designed with your needs in mind",
            "unlimited results": "valuable results"
        }

        for claim, replacement in risky_claims.items():
            pattern = re.compile(re.escape(claim), re.IGNORECASE)

            if pattern.search(content):
                violations.append({
                    "type": "Unsupported Claim",
                    "word": claim,
                    "severity": "Medium",
                    "description": (
                        f"The claim '{claim}' may require evidence."
                    )
                })

                corrected_content = pattern.sub(
                    replacement,
                    corrected_content
                )


       
        # 3. Detect excessive promotional language
        promotional_words = {
            "buy now": "explore the product",
            "act now": "learn more",
            "hurry": "discover more",
            "limited time": "special offer"
        }

        for phrase, replacement in promotional_words.items():
            pattern = re.compile(re.escape(phrase), re.IGNORECASE)

            if pattern.search(content):
                violations.append({
                    "type": "Promotional Language",
                    "word": phrase,
                    "severity": "Low",
                    "description": (
                        f"'{phrase}' may create excessive sales pressure."
                    )
                })

                corrected_content = pattern.sub(
                    replacement,
                    corrected_content
                )


        # 4. Detect excessive exclamation marks
        if corrected_content.count("!") > 2:
            violations.append({
                "type": "Tone Issue",
                "word": "Excessive exclamation marks",
                "severity": "Low",
                "description": "Too many exclamation marks may affect brand tone."
            })

            corrected_content = re.sub(
                r"!{2,}",
                "!",
                corrected_content
            )

        # 5. Calculate compliance score
        deduction = 0

        for violation in violations:
            severity = violation["severity"]

            if severity == "High":
                deduction += 25
            elif severity == "Medium":
                deduction += 15
            else:
                deduction += 5

        score = max(0, 100 - deduction)

        # 6. Generate summary
        if violations:
            summary = (
                f"{brand_name}: Found {len(violations)} "
                f"potential compliance issue(s). "
                "Review the violations and corrected content."
            )
        else:
            summary = (
                f"{brand_name}: No issues detected by the "
                "basic compliance checks."
            )

        return {
            "compliance_score": score,
            "ai_summary": summary,
            "violations": violations,
            "corrected_content": corrected_content
        }


ai_service = AIService()
