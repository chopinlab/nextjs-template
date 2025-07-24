-- TimescaleDB 초기화 스크립트
-- 데이터베이스 생성 후 자동 실행됩니다

-- TimescaleDB 확장 활성화
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- 시계열 데이터용 하이퍼테이블 생성 준비
-- (Prisma 마이그레이션 후에 수동으로 실행 필요)

-- 예시: 하이퍼테이블 생성 함수
CREATE OR REPLACE FUNCTION create_hypertables()
RETURNS VOID AS $$
BEGIN
    -- time_series_data 테이블을 하이퍼테이블로 변환
    PERFORM create_hypertable('time_series_data', 'timestamp', if_not_exists => TRUE);
    
    -- sensor_data 테이블을 하이퍼테이블로 변환  
    PERFORM create_hypertable('sensor_data', 'timestamp', if_not_exists => TRUE);
    
    RAISE NOTICE 'Hypertables created successfully';
END;
$$ LANGUAGE plpgsql;

-- 유용한 시계열 함수들
CREATE OR REPLACE FUNCTION time_bucket_gapfill_example()
RETURNS VOID AS $$
BEGIN
    -- 시간 버킷으로 집계하고 빈 구간 채우기 예시
    -- SELECT time_bucket_gapfill('1 hour', timestamp) as bucket,
    --        avg(value) as avg_value
    -- FROM time_series_data 
    -- WHERE timestamp >= NOW() - INTERVAL '1 day'
    -- GROUP BY bucket
    -- ORDER BY bucket;
    
    RAISE NOTICE 'Time bucket functions are ready to use';
END;
$$ LANGUAGE plpgsql;

-- 데이터베이스 설정 정보 출력
SELECT 'TimescaleDB initialized successfully!' as status;