from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal


class RoutingRuleCreate(BaseModel):
    category_id: UUID
    department_id: UUID
    priority: str
    confidence_threshold: Decimal = Decimal("0.7500")


class RoutingRuleUpdate(BaseModel):
    priority: Optional[str] = None
    confidence_threshold: Optional[Decimal] = None
    is_active: Optional[bool] = None


class RoutingRuleResponse(BaseModel):
    id: UUID
    category_id: UUID
    department_id: UUID
    priority: str
    confidence_threshold: Decimal
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
