from src.coin_economy.domain.entities import CoinRule


def calculate_coin_amount(rule: CoinRule, quality_score: float | None = None) -> int:
    if quality_score is None:
        return rule.min_amount
    score = max(0.0, min(1.0, quality_score))
    return rule.min_amount + int((rule.max_amount - rule.min_amount) * score)
