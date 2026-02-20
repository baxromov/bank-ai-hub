import re
from src.ai_agents.infrastructure.guardrails.patterns import INJECTION_PATTERNS, PII_PATTERNS


class PromptInjectionDetector:
    def check(self, text: str) -> tuple[bool, str]:
        for pattern in INJECTION_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return True, "prompt_injection_detected"
        return False, ""


class PiiScanner:
    def check(self, text: str) -> tuple[bool, str]:
        for pattern in PII_PATTERNS:
            if re.search(pattern, text):
                return True, "pii_detected"
        return False, ""


class OffTopicFilter:
    OFF_TOPIC_PATTERNS = [
        r"(recipe|cooking|hobby|game|movie|song)\b",
    ]

    def check(self, text: str, strict: bool = False) -> tuple[bool, str]:
        if not strict:
            return False, ""
        for pattern in self.OFF_TOPIC_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return True, "off_topic_detected"
        return False, ""
