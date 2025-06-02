from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

import schemas, crud, models
from db import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Namespace)
def create_namespace(ns: schemas.NamespaceCreate, db: Session = Depends(get_db)):
    return crud.create_namespace(db=db, ns=ns)

@router.get("/", response_model=List[schemas.Namespace])
def list_namespaces(db: Session = Depends(get_db)):
    # TODO: Implement listing namespaces, potentially filtered by cluster/tenant
    return [] # Placeholder

@router.get("/{ns_id}", response_model=schemas.Namespace)
def get_namespace(ns_id: uuid.UUID, db: Session = Depends(get_db)):
    db_ns = db.query(models.Namespace).filter(models.Namespace.id == ns_id).first()
    if db_ns is None:
        raise HTTPException(status_code=404, detail="Namespace not found")
    return db_ns

@router.delete("/{ns_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_namespace(ns_id: uuid.UUID, db: Session = Depends(get_db)):
    db_ns = db.query(models.Namespace).filter(models.Namespace.id == ns_id).first()
    if db_ns is None:
        raise HTTPException(status_code=404, detail="Namespace not found")
    db.delete(db_ns)
    db.commit()
    return