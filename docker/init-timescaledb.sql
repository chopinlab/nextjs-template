-- TimescaleDB 초기화 스크립트
-- Docker 컨테이너 최초 실행 시에만 실행됩니다

-- TimescaleDB 확장 활성화 (필수)
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- 수동 하이퍼테이블 변환 함수
CREATE OR REPLACE FUNCTION create_hypertables_manual()
RETURNS TEXT AS $$
DECLARE
    result TEXT := '';
    table_names TEXT[] := ARRAY['time_series_data', 'sensor_data']; -- 새 시계열 테이블 추가시 여기에 추가: 'new_table_name'
    tbl_name TEXT;
BEGIN
    FOREACH tbl_name IN ARRAY table_names
    LOOP
        -- 테이블이 존재하는지 확인
        IF EXISTS (
            SELECT 1 FROM information_schema.tables t
            WHERE t.table_schema = 'public' AND t.table_name = tbl_name
        ) THEN
            -- 이미 하이퍼테이블인지 확인
            IF NOT EXISTS (
                SELECT 1 FROM timescaledb_information.hypertables h 
                WHERE h.hypertable_name = tbl_name
            ) THEN
                BEGIN
                    PERFORM create_hypertable(tbl_name, 'timestamp', if_not_exists => TRUE);
                    result := result || tbl_name || ' converted to hypertable. ';
                EXCEPTION 
                    WHEN OTHERS THEN
                        result := result || tbl_name || ' conversion failed: ' || SQLERRM || '. ';
                END;
            ELSE
                result := result || tbl_name || ' already is a hypertable. ';
            END IF;
        ELSE
            result := result || tbl_name || ' table not found. ';
        END IF;
    END LOOP;
    
    IF result = '' THEN
        result := 'No time-series tables specified.';
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 개별 테이블을 하이퍼테이블로 변환하는 함수
CREATE OR REPLACE FUNCTION convert_to_hypertable(table_name TEXT, time_column TEXT DEFAULT 'timestamp')
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    -- 테이블이 존재하는지 확인
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = convert_to_hypertable.table_name
    ) THEN
        RETURN 'Table ' || table_name || ' does not exist.';
    END IF;
    
    -- 이미 하이퍼테이블인지 확인
    IF EXISTS (
        SELECT 1 FROM timescaledb_information.hypertables h 
        WHERE h.hypertable_name = convert_to_hypertable.table_name
    ) THEN
        RETURN 'Table ' || table_name || ' is already a hypertable.';
    END IF;
    
    -- 하이퍼테이블로 변환
    BEGIN
        PERFORM create_hypertable(table_name, time_column, if_not_exists => TRUE);
        RETURN 'Table ' || table_name || ' successfully converted to hypertable.';
    EXCEPTION 
        WHEN OTHERS THEN
            RETURN 'Failed to convert ' || table_name || ' to hypertable: ' || SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql;

-- 사용 방법:
-- 1. 모든 시계열 테이블을 한번에 변환: SELECT create_hypertables_manual();
-- 2. 개별 테이블 변환: SELECT convert_to_hypertable('table_name');
-- 3. 사용자 정의 시간 컬럼: SELECT convert_to_hypertable('table_name', 'created_at');

-- 초기화 완료 메시지
SELECT 'TimescaleDB extension loaded. Use create_hypertables_manual() or convert_to_hypertable() to create hypertables.' as status;