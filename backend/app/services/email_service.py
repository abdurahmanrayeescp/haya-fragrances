import logging
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("EmailService")

class EmailService:
    @staticmethod
    def send_welcome_email(user_email: str, user_name: str) -> bool:
        """
        Simulates sending a welcome email to the user.
        """
        logger.info(f"--- MOCK EMAIL SENT ---")
        logger.info(f"To: {user_email}")
        logger.info(f"Subject: Welcome to LuxeAura, {user_name}!")
        logger.info(f"Body: Welcome to the world of premium olfactory excellence. Discover luxury in every drop.")
        logger.info(f"-----------------------")
        return True

    @staticmethod
    def send_order_confirmation(user_email: str, order_id: int, total_price: float) -> bool:
        """
        Simulates sending an order confirmation email to the user.
        """
        logger.info(f"--- MOCK EMAIL SENT ---")
        logger.info(f"To: {user_email}")
        logger.info(f"Subject: Order Confirmed - LuxeAura #{order_id}")
        logger.info(f"Body: Thank you for your purchase of luxury fragrances. Your order #{order_id} for a total of ${total_price:.2f} has been placed successfully and is being processed.")
        logger.info(f"-----------------------")
        return True

    @staticmethod
    def send_password_reset_email(user_email: str, reset_token: str) -> bool:
        """
        Simulates sending a password reset request email to the user.
        """
        logger.info(f"--- MOCK EMAIL SENT ---")
        logger.info(f"To: {user_email}")
        logger.info(f"Subject: Password Reset Request - LuxeAura")
        logger.info(f"Body: Use the following token to reset your password: {reset_token}. This token expires in 15 minutes.")
        logger.info(f"-----------------------")
        return True
