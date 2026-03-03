from groq import Groq
from config import settings

class GroqService:
    def __init__(self):
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is not set up.")
        self.client = Groq(api_key=settings.GROQ_API_KEY)

    def generate(self, prompt: str):
        response = self.client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content