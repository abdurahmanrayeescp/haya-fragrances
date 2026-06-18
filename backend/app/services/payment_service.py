import logging
from typing import Dict, Any

logger = logging.getLogger("PaymentService")

class PaymentService:
    @staticmethod
    def verify_payment_signature(razorpay_payment_id: str, razorpay_order_id: str, razorpay_signature: str) -> bool:
        """
        Simulates verification of Razorpay webhook/client payment signature.
        In a real application, this uses razorpay client utility.
        """
        logger.info(f"Verifying signature for payment {razorpay_payment_id} and order {razorpay_order_id}")
        return True

    @staticmethod
    def create_razorpay_order(amount: float, receipt_id: str) -> Dict[str, Any]:
        """
        Simulates creation of a Razorpay order.
        Amount should be converted to subunits (e.g. cents/paise).
        """
        amount_subunits = int(amount * 100)
        logger.info(f"Creating Razorpay order for receipt {receipt_id} of amount {amount_subunits}")
        return {
            "id": f"order_rzp_{receipt_id}",
            "entity": "order",
            "amount": amount_subunits,
            "currency": "USD",
            "receipt": receipt_id,
            "status": "created"
        }
