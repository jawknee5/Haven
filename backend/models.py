"""Pydantic models for HAVEN."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from database import utcnow


def new_id() -> str:
    return str(uuid.uuid4())


# ====== Users ======
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "resident"  # resident | caseworker | admin
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    role: str
    phone: Optional[str] = None
    created_at: Optional[str] = None
    avatar_url: Optional[str] = None


# ====== Cases ======
class CaseCreate(BaseModel):
    title: str
    description: str
    resident_id: Optional[str] = None
    urgency_score: int = 50
    category: str = "general"  # housing | food | health | benefits | crisis | legal | employment | general


class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    urgency_score: Optional[int] = None
    caseworker_id: Optional[str] = None
    category: Optional[str] = None


class Case(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=new_id)
    title: str
    description: str
    resident_id: str
    resident_name: Optional[str] = None
    caseworker_id: Optional[str] = None
    caseworker_name: Optional[str] = None
    status: str = "new"  # new | enriched | routed | active | resolved | closed
    urgency_score: int = 50
    category: str = "general"
    intake_data: dict = Field(default_factory=dict)
    created_at: str = Field(default_factory=lambda: utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: utcnow().isoformat())


# ====== Tasks ======
class TaskCreate(BaseModel):
    case_id: str
    title: str
    description: Optional[str] = ""
    due_date: Optional[str] = None
    priority: str = "medium"  # low | medium | high | urgent


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None


class Task(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=new_id)
    case_id: str
    caseworker_id: str
    title: str
    description: str = ""
    due_date: Optional[str] = None
    priority: str = "medium"
    status: str = "open"  # open | in_progress | done
    created_at: str = Field(default_factory=lambda: utcnow().isoformat())


# ====== Messages ======
class MessageCreate(BaseModel):
    case_id: str
    content: str
    recipient_id: Optional[str] = None


class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=new_id)
    case_id: str
    sender_id: str
    sender_name: str
    sender_role: str
    recipient_id: Optional[str] = None
    content: str
    read: bool = False
    created_at: str = Field(default_factory=lambda: utcnow().isoformat())


# ====== Documents ======
class Document(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=new_id)
    case_id: str
    uploaded_by: str
    type: str  # identity | income | residency | medical | other
    filename: str
    content_type: str
    size: int
    data_url: Optional[str] = None  # base64 for demo
    verified: bool = False
    verified_by: Optional[str] = None
    notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: utcnow().isoformat())


# ====== Forms (Custom Form Builder) ======
class FormField(BaseModel):
    id: str = Field(default_factory=new_id)
    label: str
    type: str  # text | email | phone | number | date | select | checkbox | radio | textarea | file
    name: str
    placeholder: Optional[str] = ""
    required: bool = False
    options: list[str] = Field(default_factory=list)
    helper_text: Optional[str] = ""
    map_to: Optional[str] = None  # e.g. "resident.name", "case.urgency"


class FormCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    fields: list[FormField] = Field(default_factory=list)
    category: str = "intake"


class FormUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    fields: Optional[list[FormField]] = None
    category: Optional[str] = None
    published: Optional[bool] = None


class Form(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=new_id)
    name: str
    description: str = ""
    fields: list[FormField] = Field(default_factory=list)
    category: str = "intake"
    created_by: str
    published: bool = True
    created_at: str = Field(default_factory=lambda: utcnow().isoformat())


class FormSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=new_id)
    form_id: str
    case_id: Optional[str] = None
    submitted_by: str
    data: dict = Field(default_factory=dict)
    created_at: str = Field(default_factory=lambda: utcnow().isoformat())


# ====== Resources ======
class Resource(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=new_id)
    name: str
    type: str  # shelter | food | health | crisis | legal | employment | childcare
    lat: float
    lng: float
    address: str = ""
    phone: str = ""
    hours: str = ""
    capacity: Optional[int] = None
    capacity_available: Optional[int] = None
    description: str = ""
    eligibility: str = ""
    website: str = ""


# ====== BB ======
class BBChatRequest(BaseModel):
    message: str
    session_id: str
    context: dict = Field(default_factory=dict)


class BBFormAnalyzeRequest(BaseModel):
    form_html: str


class BBAutofillRequest(BaseModel):
    form_html: str
    user_id: Optional[str] = None
    case_id: Optional[str] = None


class BBBrowserStartRequest(BaseModel):
    url: Optional[str] = "https://www.google.com"


class BBBrowserActionRequest(BaseModel):
    session_id: str
    action: str  # navigate | fill | click | type | submit | screenshot | extract | back | forward | scroll
    payload: dict = Field(default_factory=dict)


class BBApplicationTrackRequest(BaseModel):
    case_id: str
    agency_name: str
    application_id: Optional[str] = None
    application_url: Optional[str] = None
    required_documents: list[str] = Field(default_factory=list)
    notes: Optional[str] = ""


class ApplicationTracking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=new_id)
    case_id: str
    user_id: str
    agency_name: str
    application_id: Optional[str] = None
    application_url: Optional[str] = None
    status: str = "submitted"  # submitted | under_review | approved | denied | needs_action
    required_documents: list[str] = Field(default_factory=list)
    submitted_at: str = Field(default_factory=lambda: utcnow().isoformat())
    last_checked: Optional[str] = None
    notes: str = ""
