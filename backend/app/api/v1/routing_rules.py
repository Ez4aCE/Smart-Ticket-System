from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from ...database.session import get_db
from ...database.models import RoutingRule, Category, Department
from ...core.dependencies import require_admin, get_current_user
from ...schemas.routing import RoutingRuleCreate, RoutingRuleUpdate, RoutingRuleResponse

router = APIRouter()
VALID_PRIORITIES = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}


@router.get("", response_model=List[RoutingRuleResponse])
def list_routing_rules(db: Session = Depends(get_db), _ = Depends(get_current_user)):
    return db.query(RoutingRule).filter(RoutingRule.is_active == True).all()


@router.post("", response_model=RoutingRuleResponse, status_code=201)
def create_routing_rule(
    body: RoutingRuleCreate, db: Session = Depends(get_db), _ = Depends(require_admin),
):
    if body.priority not in VALID_PRIORITIES:
        raise HTTPException(status_code=422, detail=f"Invalid priority")
    if not (0 <= float(body.confidence_threshold) <= 1):
        raise HTTPException(status_code=422, detail="confidence_threshold must be 0-1")
    if not db.query(Category).filter(Category.id == body.category_id).first():
        raise HTTPException(status_code=404, detail="Category not found")
    if not db.query(Department).filter(Department.id == body.department_id).first():
        raise HTTPException(status_code=404, detail="Department not found")
    rule = RoutingRule(
        category_id=body.category_id, department_id=body.department_id,
        priority=body.priority, confidence_threshold=body.confidence_threshold,
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


@router.patch("/{rule_id}", response_model=RoutingRuleResponse)
def update_routing_rule(
    rule_id: UUID, body: RoutingRuleUpdate,
    db: Session = Depends(get_db), _ = Depends(require_admin),
):
    rule = db.query(RoutingRule).filter(RoutingRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Routing rule not found")
    if body.priority and body.priority not in VALID_PRIORITIES:
        raise HTTPException(status_code=422, detail="Invalid priority")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(rule, field, value)
    db.commit()
    db.refresh(rule)
    return rule
