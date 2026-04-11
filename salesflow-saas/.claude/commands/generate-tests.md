# /generate-tests — Auto-generate Tests for Dealix Services

Analyze a service file and generate comprehensive pytest-asyncio tests with factory-boy fixtures.

## Usage
Provide the path to a service file, e.g.: `/generate-tests backend/app/services/lead_service.py`

## Steps

### 1. Analyze the Target Service
Read the specified service file and extract:
- Class name and constructor dependencies (db session, other services)
- All public methods with their signatures and return types
- Database models referenced
- External service calls (WhatsApp, email, Stripe, AI providers)
- Async vs sync methods

### 2. Identify Test Cases
For each public method, generate tests for:
- **Happy path** — normal operation with valid inputs
- **Empty/null input** — None, empty string, empty list
- **Invalid tenant** — wrong tenant_id, missing tenant_id
- **Not found** — entity does not exist
- **Duplicate** — creating something that already exists
- **Permission denied** — user lacks required role
- **Boundary values** — max length strings, zero amounts, negative numbers
- **Concurrent access** — if method modifies shared state

### 3. Generate Factory Classes
Create factory-boy factories for each model used:
```python
import factory
from factory.alchemy import SQLAlchemyModelFactory

class TenantFactory(SQLAlchemyModelFactory):
    class Meta:
        model = Tenant
        sqlalchemy_session_persistence = "commit"

    id = factory.LazyFunction(uuid4)
    name = factory.Faker("company", locale="ar_SA")
    domain = factory.Faker("domain_name")
    is_active = True
    created_at = factory.LazyFunction(lambda: datetime.now(timezone.utc))
```

Use `locale="ar_SA"` for Arabic data where appropriate (names, companies, addresses).

### 4. Generate Test File
Create the test file at `backend/tests/test_services/test_<service_name>.py` with:

```python
"""
Tests for <ServiceName>.
Auto-generated — review and customize before committing.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

from app.services.<module> import <ServiceClass>


@pytest.fixture
def db_session():
    """Mock async database session."""
    session = AsyncMock()
    session.execute = AsyncMock()
    session.commit = AsyncMock()
    session.rollback = AsyncMock()
    session.refresh = AsyncMock()
    return session


@pytest.fixture
def service(db_session):
    return <ServiceClass>(db=db_session)


@pytest.fixture
def tenant_id():
    return uuid4()


class TestMethodName:
    @pytest.mark.asyncio
    async def test_success(self, service, tenant_id):
        # Arrange
        ...
        # Act
        result = await service.method_name(...)
        # Assert
        assert result is not None

    @pytest.mark.asyncio
    async def test_not_found(self, service, tenant_id):
        service.db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=None))
        with pytest.raises(NotFoundException):
            await service.method_name(...)

    @pytest.mark.asyncio
    async def test_wrong_tenant(self, service):
        wrong_tenant = uuid4()
        # Should not return data from another tenant
        ...
```

### 5. Mocking Strategy
- **Database**: Mock `AsyncSession` with `execute()` returning mock results
- **Redis**: Mock with `fakeredis.aioredis` or `AsyncMock`
- **External APIs** (WhatsApp, Stripe): Use `unittest.mock.patch` on the service method
- **Celery tasks**: Mock with `@patch("app.workers.task_name.delay")`
- **AI services**: Mock LLM responses with fixed JSON structures
- **Time-dependent**: Use `freezegun` for timestamp-sensitive logic

### 6. Validation Checklist
After generating, verify:
- [ ] All public methods have at least one test
- [ ] Async methods use `@pytest.mark.asyncio`
- [ ] Mocks match actual method signatures
- [ ] Tenant isolation is tested
- [ ] No real external calls in tests
- [ ] Test file runs without import errors: `pytest <test_file> --co -q`

### 7. Output
Print the complete test file content and the command to run it:
```bash
pytest backend/tests/test_services/test_<name>.py -v
```
