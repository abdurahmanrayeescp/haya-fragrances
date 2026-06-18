import random
import string

def generate_random_string(length: int = 16) -> str:
    """
    Generates a secure random alpha-numeric string.
    """
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

def format_currency(amount: float) -> str:
    """
    Formats decimal numbers as luxury dollar currencies.
    """
    return f"${amount:,.2f}"
