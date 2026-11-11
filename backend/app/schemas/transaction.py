"""Pydantic schemas for earnings/transaction endpoints."""
from typing import List, Optional
from pydantic import BaseModel


class TransactionItem(BaseModel):
    id: str
    project_id: Optional[str] = None
    project_title: Optional[str] = None
    amount: float
    status: str  # held_in_escrow | released | refunded
    created_at: str
    released_at: Optional[str] = None

    class Config:
        from_attributes = True


class EarningsSummary(BaseModel):
    total_earned: float
    released: float
    held_in_escrow: float
    refunded: float
    transaction_count: int
    recent_transactions: List[TransactionItem] = []
