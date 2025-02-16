from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import bcrypt

router = APIRouter()


class PasswordRequest(BaseModel):
    password: str

@router.post("/hash-password", tags=["Authentication"])
def hash_password(request: PasswordRequest):
    """
    Hashes a given password using bcrypt and returns the hashed result.
    """
    try:
        password = request.password

        # Validate password input
        if not password:
            raise HTTPException(status_code=400, detail="Password is required")

        # Generate bcrypt hash
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Return the hashed password
        return {"hashed_password": hashed_password}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))