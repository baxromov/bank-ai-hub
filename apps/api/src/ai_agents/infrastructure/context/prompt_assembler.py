"""Dynamic system prompt assembly."""


class PromptAssembler:
    def __init__(self, base_prompt: str) -> None:
        self._base = base_prompt

    def assemble(
        self,
        department_context: str = "",
        user_preferences: dict | None = None,
        tool_hints: list[str] | None = None,
        conversation_summary: str = "",
    ) -> str:
        parts = [self._base]

        if department_context:
            parts.append(f"\nDepartment context: {department_context}")

        if user_preferences:
            lang = user_preferences.get("language")
            if lang:
                parts.append(f"\nRespond in {lang}.")
            style = user_preferences.get("style")
            if style == "concise":
                parts.append("\nBe concise and direct.")
            elif style == "detailed":
                parts.append("\nProvide detailed explanations.")

        if tool_hints:
            parts.append(f"\nUser frequently uses: {', '.join(tool_hints[:3])}.")

        if conversation_summary:
            parts.append(f"\nEarlier conversation summary: {conversation_summary}")

        return "\n".join(parts)
