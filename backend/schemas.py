from pydantic import BaseModel, Field
from typing import List, Optional


class GenerateRequest(BaseModel):
    idea: str = Field(..., min_length=5, max_length=500,
                      description="One-sentence product idea")


# ── Nested response models ──────────────────────────────────────

class Feature(BaseModel):
    icon: str
    title: str
    desc: str


class Testimonial(BaseModel):
    name: str
    role: str
    quote: str


class PricingPlan(BaseModel):
    plan: str
    price: str
    features: List[str]


class HowItWorks(BaseModel):
    step: str
    title: str
    desc: str


class FAQ(BaseModel):
    q: str
    a: str


class Palette(BaseModel):
    accent: str
    bg: str
    text: str


class GenerateResponse(BaseModel):
    brand: str
    tagline: str
    subheadline: str
    cta: str
    features: List[Feature]
    testimonials: List[Testimonial]
    pricing: List[PricingPlan]
    howItWorks: List[HowItWorks] = Field(default_factory=list)
    faq: List[FAQ] = Field(default_factory=list)
    palette: Palette
    font: str


class ErrorResponse(BaseModel):
    detail: str
