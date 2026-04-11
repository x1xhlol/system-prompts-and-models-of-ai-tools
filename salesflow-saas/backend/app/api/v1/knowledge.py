from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel as Schema

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.knowledge import KnowledgeArticle

router = APIRouter()


class ArticleCreate(Schema):
    category: Optional[str] = None
    title: str
    title_ar: Optional[str] = None
    content: str
    content_ar: Optional[str] = None
    tags: Optional[list] = None
    is_internal: bool = False


class ArticleUpdate(Schema):
    category: Optional[str] = None
    title: Optional[str] = None
    title_ar: Optional[str] = None
    content: Optional[str] = None
    content_ar: Optional[str] = None
    tags: Optional[list] = None
    is_internal: Optional[bool] = None
    is_active: Optional[bool] = None


class ArticleResponse(Schema):
    id: UUID
    category: Optional[str] = None
    title: str
    title_ar: Optional[str] = None
    content: str
    content_ar: Optional[str] = None
    tags: Optional[list] = None
    is_internal: bool
    is_active: bool
    author_id: Optional[UUID] = None
    version: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ArticleListResponse(Schema):
    items: list[ArticleResponse]
    total: int
    page: int
    per_page: int


@router.get("", response_model=ArticleListResponse)
async def list_articles(
    category: str = Query(None),
    search: str = Query(None),
    is_internal: bool = Query(None),
    is_active: bool = Query(True),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(KnowledgeArticle)
    if is_active is not None:
        query = query.where(KnowledgeArticle.is_active == is_active)
    if category:
        query = query.where(KnowledgeArticle.category == category)
    if is_internal is not None:
        query = query.where(KnowledgeArticle.is_internal == is_internal)
    if search:
        query = query.where(
            or_(
                KnowledgeArticle.title.ilike(f"%{search}%"),
                KnowledgeArticle.content.ilike(f"%{search}%"),
                KnowledgeArticle.title_ar.ilike(f"%{search}%"),
            )
        )

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar()
    query = query.order_by(KnowledgeArticle.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    items = [ArticleResponse.model_validate(a) for a in result.scalars().all()]
    return ArticleListResponse(items=items, total=total, page=page, per_page=per_page)


@router.get("/search", response_model=ArticleListResponse)
async def search_articles(
    q: str = Query(..., min_length=2),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(KnowledgeArticle).where(
        KnowledgeArticle.is_active == True,
        or_(
            KnowledgeArticle.title.ilike(f"%{q}%"),
            KnowledgeArticle.content.ilike(f"%{q}%"),
            KnowledgeArticle.title_ar.ilike(f"%{q}%"),
            KnowledgeArticle.content_ar.ilike(f"%{q}%"),
        ),
    )
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar()
    query = query.order_by(KnowledgeArticle.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    items = [ArticleResponse.model_validate(a) for a in result.scalars().all()]
    return ArticleListResponse(items=items, total=total, page=page, per_page=per_page)


@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(
    article_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(KnowledgeArticle).where(KnowledgeArticle.id == article_id))
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return ArticleResponse.model_validate(article)


@router.post("", response_model=ArticleResponse, status_code=201)
async def create_article(
    data: ArticleCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    article = KnowledgeArticle(
        author_id=current_user.id,
        **data.model_dump(exclude_none=True),
    )
    db.add(article)
    await db.flush()
    await db.refresh(article)
    return ArticleResponse.model_validate(article)


@router.put("/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: UUID,
    data: ArticleUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(KnowledgeArticle).where(KnowledgeArticle.id == article_id))
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    updates = data.model_dump(exclude_none=True)
    if "content" in updates or "content_ar" in updates:
        article.version = (article.version or 1) + 1
    for field, value in updates.items():
        setattr(article, field, value)
    await db.flush()
    await db.refresh(article)
    return ArticleResponse.model_validate(article)


@router.delete("/{article_id}", status_code=204)
async def delete_article(
    article_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(KnowledgeArticle).where(KnowledgeArticle.id == article_id))
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    article.is_active = False
    await db.flush()
