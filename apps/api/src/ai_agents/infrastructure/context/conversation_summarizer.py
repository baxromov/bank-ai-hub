"""Compress older messages to save context window."""


class ConversationSummarizer:
    async def summarize(self, messages: list[dict]) -> str:
        """Summarize a list of messages into a brief paragraph.
        In production, uses LLM call for extractive/abstractive summary."""
        if not messages:
            return ""
        msg_count = len(messages)
        topics = set()
        for m in messages:
            content = m.get("content", "")[:100]
            if content:
                topics.add(content[:50])

        return f"Previous conversation ({msg_count} messages) covered: {'; '.join(list(topics)[:5])}"
