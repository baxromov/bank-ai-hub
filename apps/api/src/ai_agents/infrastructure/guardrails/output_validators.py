import re
from src.ai_agents.infrastructure.guardrails.patterns import SENSITIVE_OUTPUT_PATTERNS


class SensitiveDataFilter:
    def check(self, text: str) -> tuple[bool, str]:
        for pattern in SENSITIVE_OUTPUT_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return True, "sensitive_data_in_response"
        return False, ""


class ComplianceChecker:
    def check(self, text: str) -> tuple[bool, str]:
        # Banking compliance checks
        return False, ""
