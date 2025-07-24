-- TimescaleDB 초기화 스크립트
-- Docker 컨테이너 최초 실행 시에만 실행됩니다

-- TimescaleDB 확장 활성화 (필수)
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- 하이퍼테이블 자동 변환 함수
CREATE OR REPLACE FUNCTION auto_create_hypertables()
RETURNS TEXT AS $$
DECLARE
    result TEXT := '';
    table_name TEXT;
BEGIN
    -- 시계열 테이블들을 자동으로 하이퍼테이블로 변환
    FOR table_name IN 
        SELECT t.table_name 
        FROM information_schema.tables t
        WHERE t.table_schema = 'public' 
        AND t.table_name IN ('time_series_data', 'sensor_data')
    LOOP
        BEGIN
            PERFORM create_hypertable(table_name, 'timestamp', if_not_exists => TRUE);
            result := result || table_name || ' converted to hypertable. ';
        EXCEPTION 
            WHEN OTHERS THEN
                result := result || table_name || ' conversion failed: ' || SQLERRM || '. ';
        END;
    END LOOP;
    
    IF result = '' THEN
        result := 'No time-series tables found. Run Prisma migrations first.';
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 테이블 생성 시 자동으로 하이퍼테이블 변환하는 트리거 함수
CREATE OR REPLACE FUNCTION trigger_create_hypertable()
RETURNS event_trigger AS $$
DECLARE
    obj record;
BEGIN
    FOR obj IN SELECT * FROM pg_event_trigger_ddl_commands() WHERE command_tag = 'CREATE TABLE'
    LOOP
        -- 시계열 테이블이면 자동으로 하이퍼테이블로 변환
        IF obj.object_identity LIKE '%time_series_data' OR obj.object_identity LIKE '%sensor_data' THEN
            PERFORM create_hypertable(obj.object_identity, 'timestamp', if_not_exists => TRUE);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 이벤트 트리거 생성 (테이블 생성 시 자동 실행)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_event_trigger WHERE evtname = 'auto_hypertable_trigger') THEN
        CREATE EVENT TRIGGER auto_hypertable_trigger
            ON ddl_command_end
            WHEN TAG IN ('CREATE TABLE')
            EXECUTE FUNCTION trigger_create_hypertable();
    END IF;
END;
$$;

-- 초기화 완료 메시지
SELECT 'TimescaleDB extension loaded. Run create_hypertables() after Prisma migration.' as status;