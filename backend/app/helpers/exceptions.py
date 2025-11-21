# Custom exceptions for clear, specific error handling in the service layer.
class ServiceError(Exception):
    """Base class for service layer errors."""
    pass

class OrderNotFoundError(ServiceError):
    pass

class PaymentAlreadyCompletedError(ServiceError):
    pass

class UnsupportedPaymentMethodError(ServiceError):
    pass

class MerchantNotFoundError(ServiceError):
    pass

# Payment-related service exceptions
class PaymentProcessingError(ServiceError):
    """Raised when initiating a payment with an external processor fails."""
    pass

class PaymentVerificationError(ServiceError):
    """Raised when payment verification (signature check / capture) fails."""
    pass

class RefundError(ServiceError):
    """Raised when refunding a payment with the processor fails."""
    pass