import uuid
from datetime import datetime

from pydantic import EmailStr, Field, StrictInt, model_validator

from app.models import DeliveryMethod, OrderStatus, PaymentMethod, PaymentStatus
from app.schemas.catalog import ProductCard
from app.schemas.common import Input, Money, Output, Phone

Qty = Field(ge=1, le=999)


class CartLineIn(Input):
    product_id: int
    quantity: StrictInt = Qty


class CartQtyIn(Input):
    quantity: StrictInt = Qty


class CartMergeIn(Input):
    items: list[CartLineIn] = Field(max_length=100)


class CartLineOut(Output):
    product: ProductCard
    quantity: int
    line_total_minor: int
    available: bool


class CartOut(Output):
    items: list[CartLineOut]
    subtotal_minor: int
    currency: str


class CheckoutIn(Input):
    items: list[CartLineIn] = Field(min_length=1, max_length=100)
    customer_name: str = Field(min_length=2, max_length=160)
    phone: Phone
    email: EmailStr | None = None
    delivery_method: DeliveryMethod
    address: str | None = Field(default=None, max_length=500)
    payment_method: PaymentMethod
    comment: str | None = Field(default=None, max_length=1000)
    # What the buyer saw. If the server's total differs, checkout is rejected so the
    # UI can show the updated prices instead of silently charging a different amount.
    expected_total_minor: Money | None = None

    @model_validator(mode="after")
    def _address(self):
        if self.delivery_method is DeliveryMethod.courier and not (self.address or "").strip():
            raise ValueError("Address is required for courier delivery")
        return self


class OrderItemOut(Output):
    product_id: int | None
    sku: str | None
    name: str
    unit_price_minor: int
    quantity: int
    line_total_minor: int


class OrderEventOut(Output):
    from_status: str | None
    to_status: str
    note: str | None
    created_at: datetime


class OrderOut(Output):
    id: uuid.UUID
    number: int
    status: OrderStatus
    payment_status: PaymentStatus
    payment_method: PaymentMethod
    delivery_method: DeliveryMethod
    customer_name: str
    phone: str
    email: str | None
    address: str | None
    comment: str | None
    currency: str
    subtotal_minor: int
    delivery_minor: int
    total_minor: int
    items: list[OrderItemOut]
    created_at: datetime


class OrderCustomerOut(OrderOut):
    events: list[OrderEventOut]


class CheckoutOut(Output):
    order: OrderOut
    access_token: str = Field(description="Show once; lets a guest view this order")


class OrderAdminOut(OrderCustomerOut):
    user_id: int | None
    staff_note: str | None
    updated_at: datetime


class OrderTransitionIn(Input):
    status: OrderStatus
    note: str | None = Field(default=None, max_length=1000)


class OrderAdminPatch(Input):
    staff_note: str | None = Field(default=None, max_length=5000)
    payment_status: PaymentStatus | None = None
