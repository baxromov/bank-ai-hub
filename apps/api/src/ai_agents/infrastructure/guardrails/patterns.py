"""Regex patterns for banking-specific guardrails."""

INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?previous\s+instructions",
    r"you\s+are\s+now\s+",
    r"pretend\s+you\s+are",
    r"reveal\s+your\s+system\s+prompt",
    r"repeat\s+the\s+above",
    r"disregard\s+your\s+training",
    r"output\s+your\s+instructions",
]

PII_PATTERNS = [
    r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b",  # credit/debit card
    r"\b[A-Z]{2}\d{7}\b",                               # passport number
    r"\b\d{14}\b",                                       # PINFL (Uzbekistan personal ID)
    r"\b860\d{11}\b",                                    # Uzbek INN
]

SENSITIVE_OUTPUT_PATTERNS = [
    r"password\s*[:=]\s*\S+",
    r"(api[_-]?key|secret[_-]?key|token)\s*[:=]\s*\S+",
    r"postgresql://",
    r"redis://",
    r"mongodb://",
    r"BEGIN\s+(RSA\s+)?PRIVATE\s+KEY",
]
