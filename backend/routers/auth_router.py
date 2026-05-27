"""Auth router for HAVEN."""
from fastapi import APIRouter, Depends, HTTPException

from auth import create_token, get_current_user, hash_password, verify_password
from database import users_col, utcnow
from models import UserLogin, UserPublic, UserRegister, new_id

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def register(payload: UserRegister):
    if payload.role not in ("resident", "caseworker", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role")
    existing = await users_col.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    user = {
        "id": new_id(),
        "email": payload.email.lower(),
        "name": payload.name,
        "role": payload.role,
        "phone": payload.phone or "",
        "password_hash": hash_password(payload.password),
        "created_at": utcnow().isoformat(),
        "avatar_url": "",
    }
    await users_col.insert_one(user)
    token = create_token(user["id"], user["role"], user["email"])
    public = {k: v for k, v in user.items() if k not in ("password_hash", "_id")}
    return {"token": token, "user": public}


@router.post("/login")
async def login(payload: UserLogin):
    user = await users_col.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(user["id"], user["role"], user["email"])
    public = {k: v for k, v in user.items() if k not in ("password_hash", "_id")}
    return {"token": token, "user": public}


@router.get("/me", response_model=UserPublic)
async def me(user: dict = Depends(get_current_user)):
    return user
