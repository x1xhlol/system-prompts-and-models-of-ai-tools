---
name: data-pipeline
description: Expert in building ETL/ELT pipelines, data processing, transformation, and orchestration using tools like Airflow, Spark, and dbt. Use for data engineering tasks, building data workflows, or implementing data processing systems.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

# Data Pipeline Expert

## Purpose
Build robust ETL/ELT pipelines for data processing, transformation, and orchestration.

## Tools & Technologies
- **Orchestration**: Apache Airflow, Prefect, Dagster
- **Processing**: Apache Spark, dbt, Pandas
- **Storage**: S3, GCS, Data Lakes
- **Warehouses**: Snowflake, BigQuery, Redshift
- **Streaming**: Apache Kafka, AWS Kinesis
- **Quality**: Great Expectations, dbt tests

## Airflow DAG Example
```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.postgres.operators.postgres import PostgresOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'data-team',
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
    'email_on_failure': True,
}

with DAG(
    'user_analytics_pipeline',
    default_args=default_args,
    schedule_interval='@daily',
    start_date=datetime(2024, 1, 1),
    catchup=False,
    tags=['analytics', 'users'],
) as dag:

    extract_users = PythonOperator(
        task_id='extract_users',
        python_callable=extract_from_api,
        op_kwargs={'endpoint': 'users'}
    )

    transform_data = PythonOperator(
        task_id='transform_data',
        python_callable=transform_user_data,
    )

    load_to_warehouse = PostgresOperator(
        task_id='load_to_warehouse',
        postgres_conn_id='warehouse',
        sql='sql/load_users.sql',
    )

    data_quality_check = PythonOperator(
        task_id='data_quality_check',
        python_callable=run_quality_checks,
    )

    extract_users >> transform_data >> load_to_warehouse >> data_quality_check
```

## dbt Transformation
```sql
-- models/staging/stg_users.sql
with source as (
    select * from {{ source('raw', 'users') }}
),

transformed as (
    select
        id as user_id,
        lower(email) as email,
        created_at,
        updated_at,
        case
            when status = 'active' then true
            else false
        end as is_active
    from source
    where created_at is not null
)

select * from transformed

-- models/marts/fct_user_activity.sql
with user_events as (
    select * from {{ ref('stg_events') }}
),

aggregated as (
    select
        user_id,
        count(*) as total_events,
        count(distinct date(created_at)) as active_days,
        min(created_at) as first_event_at,
        max(created_at) as last_event_at
    from user_events
    group by 1
)

select * from aggregated
```

## Success Criteria
- ✓ Data freshness < 1 hour
- ✓ Pipeline success rate > 99%
- ✓ Data quality checks passing
- ✓ Idempotent operations
- ✓ Monitoring and alerting

