-- ============================================================
-- Franchise Check — Supabase PostgreSQL 스키마
-- Migration: 001_initial_schema.sql
-- ============================================================

-- uuid 생성 확장
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Enum 타입 ──────────────────────────────────────────────

CREATE TYPE answer_state AS ENUM ('confirmed', 'not_checked', 'unknown');

CREATE TYPE source_type AS ENUM (
  'hq_verbal', 'hq_sms', 'hq_email', 'hq_document',
  'disclosure_doc', 'contract', 'actual_owner', 'self_verified', 'other'
);

CREATE TYPE answer_type AS ENUM (
  'amount', 'select', 'multi_select', 'text', 'date', 'boolean'
);

CREATE TYPE question_category AS ENUM (
  'situation', 'brand', 'hq_consultation', 'investment', 'sales',
  'contract', 'verification', 'document', 'analysis', 'missing', 'followup', 'report'
);

CREATE TYPE session_status AS ENUM ('in_progress', 'completed', 'abandoned');

CREATE TYPE document_type AS ENUM (
  'disclosure_doc', 'contract', 'sales_estimate',
  'hq_material', 'quote', 'consultation_record', 'other'
);

CREATE TYPE parse_status AS ENUM ('pending', 'processing', 'done', 'failed');

CREATE TYPE risk_flag_type AS ENUM (
  'discrepancy', 'missing_critical', 'missing_important',
  'financial_risk', 'contract_risk', 'unknown_data'
);

CREATE TYPE risk_severity AS ENUM ('critical', 'warning', 'info');

CREATE TYPE final_verdict AS ENUM (
  'need_more_info', 'mostly_confirmed', 'well_confirmed', 'expert_consultation'
);

CREATE TYPE extraction_confidence AS ENUM ('confirmed', 'uncertain', 'not_found');

-- ── 유틸리티 함수 ──────────────────────────────────────────

-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── 테이블 ─────────────────────────────────────────────────

-- 사용자 프로필 (auth.users와 연결)
CREATE TABLE user_profiles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 브랜드 정보
CREATE TABLE brands (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_name          TEXT NOT NULL,
  hq_name             TEXT NOT NULL,
  consultation_date   DATE,
  consultant_name     TEXT,
  store_type          TEXT,
  store_size_sqm      NUMERIC,
  expected_location   TEXT,
  hq_website_url      TEXT,
  has_disclosure_doc  BOOLEAN,
  has_contract        BOOLEAN,
  has_sales_estimate  BOOLEAN,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 검증 세션 (브랜드 1개당 1개)
CREATE TABLE brand_sessions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id            UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  current_step        INT NOT NULL DEFAULT 1,
  current_question_id UUID,  -- 질문 추가 후 FK 설정
  status              session_status NOT NULL DEFAULT 'in_progress',
  completion_pct      NUMERIC NOT NULL DEFAULT 0 CHECK (completion_pct BETWEEN 0 AND 100),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER brand_sessions_updated_at
  BEFORE UPDATE ON brand_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_brand_sessions_user_id ON brand_sessions(user_id);
CREATE INDEX idx_brand_sessions_brand_id ON brand_sessions(brand_id);
CREATE INDEX idx_brand_sessions_status ON brand_sessions(status);

-- 질문 (DB에서 관리 — 하드코딩 금지)
CREATE TABLE questions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_key    TEXT NOT NULL UNIQUE,
  category        question_category NOT NULL,
  step_number     INT NOT NULL CHECK (step_number BETWEEN 1 AND 12),
  order_in_step   INT NOT NULL DEFAULT 0,
  question_text   TEXT NOT NULL,
  description     TEXT,  -- "왜 중요한가요?" 내용
  answer_type     answer_type NOT NULL,
  is_required     BOOLEAN NOT NULL DEFAULT TRUE,
  risk_weight     NUMERIC NOT NULL DEFAULT 1.0 CHECK (risk_weight BETWEEN 0 AND 5),
  missing_weight  NUMERIC NOT NULL DEFAULT 1.0 CHECK (missing_weight BETWEEN 0 AND 5),
  source_type     source_type,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  is_quick_check  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_step ON questions(step_number, order_in_step);
CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_active ON questions(is_active);

-- 질문 선택지
CREATE TABLE question_options (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id      UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_key       TEXT NOT NULL,
  option_text      TEXT NOT NULL,
  order_index      INT NOT NULL DEFAULT 0,
  triggers_followup BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(question_id, option_key)
);

CREATE INDEX idx_question_options_question_id ON question_options(question_id);

-- 조건부 질문 (특정 답변 시에만 표시)
CREATE TABLE question_conditions (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id          UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  parent_question_id   UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  trigger_option_key   TEXT NOT NULL,
  UNIQUE(question_id, parent_question_id, trigger_option_key)
);

CREATE INDEX idx_question_conditions_question_id ON question_conditions(question_id);
CREATE INDEX idx_question_conditions_parent ON question_conditions(parent_question_id);

-- FK 설정 (brand_sessions.current_question_id)
ALTER TABLE brand_sessions
  ADD CONSTRAINT fk_brand_sessions_current_question
  FOREIGN KEY (current_question_id) REFERENCES questions(id) ON DELETE SET NULL;

-- 사용자 답변
CREATE TABLE question_answers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id    UUID NOT NULL REFERENCES brand_sessions(id) ON DELETE CASCADE,
  question_id   UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_value  JSONB,  -- 유연한 값 저장
  answer_state  answer_state NOT NULL DEFAULT 'not_checked',
  source_type   source_type,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, question_id)
);

CREATE INDEX idx_question_answers_session_id ON question_answers(session_id);
CREATE INDEX idx_question_answers_question_id ON question_answers(question_id);
CREATE INDEX idx_question_answers_state ON question_answers(answer_state);

CREATE TRIGGER question_answers_updated_at
  BEFORE UPDATE ON question_answers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 답변 변경 이력 (자동 생성)
CREATE TABLE question_answer_history (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  answer_id       UUID NOT NULL REFERENCES question_answers(id) ON DELETE CASCADE,
  previous_value  JSONB,
  previous_state  answer_state,
  new_value       JSONB,
  new_state       answer_state,
  changed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_answer_history_answer_id ON question_answer_history(answer_id);

-- 답변 변경 시 자동 이력 생성 트리거
CREATE OR REPLACE FUNCTION log_answer_history()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.answer_value IS DISTINCT FROM NEW.answer_value) OR
     (OLD.answer_state IS DISTINCT FROM NEW.answer_state) THEN
    INSERT INTO question_answer_history(
      answer_id, previous_value, previous_state, new_value, new_state
    ) VALUES (
      NEW.id, OLD.answer_value, OLD.answer_state, NEW.answer_value, NEW.answer_state
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER question_answers_history_trigger
  AFTER UPDATE ON question_answers
  FOR EACH ROW EXECUTE FUNCTION log_answer_history();

-- 업로드 문서
CREATE TABLE documents (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id        UUID NOT NULL REFERENCES brand_sessions(id) ON DELETE CASCADE,
  doc_type          document_type NOT NULL,
  file_path         TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  parse_status      parse_status NOT NULL DEFAULT 'pending',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_session_id ON documents(session_id);
CREATE INDEX idx_documents_parse_status ON documents(parse_status);

-- AI 문서 추출 결과
CREATE TABLE document_extractions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id      UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  field_key        TEXT NOT NULL,
  extracted_value  TEXT,
  confidence       extraction_confidence NOT NULL,
  source_page      INT,
  source_text      TEXT,  -- 근거 원문
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(document_id, field_key)
);

CREATE INDEX idx_extractions_document_id ON document_extractions(document_id);

-- 리스크 규칙 (관리자가 가중치 조정 가능)
CREATE TABLE risk_rules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_key    TEXT NOT NULL UNIQUE,
  category    TEXT NOT NULL,
  description TEXT NOT NULL,
  weight      NUMERIC NOT NULL DEFAULT 1.0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

-- 리스크 계산 결과
CREATE TABLE risk_results (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id               UUID NOT NULL REFERENCES brand_sessions(id) ON DELETE CASCADE,
  readiness_score          NUMERIC NOT NULL DEFAULT 0,  -- 계약 준비도
  info_check_score         NUMERIC NOT NULL DEFAULT 0,  -- 정보 확인도
  financial_burden_score   NUMERIC NOT NULL DEFAULT 0,  -- 재무 부담도 (높을수록 부담)
  hq_transparency_score    NUMERIC NOT NULL DEFAULT 0,  -- 본사 정보 투명성
  contract_check_score     NUMERIC NOT NULL DEFAULT 0,  -- 계약조건 확인도
  sales_check_score        NUMERIC NOT NULL DEFAULT 0,  -- 매출정보 확인도
  operation_fit_score      NUMERIC NOT NULL DEFAULT 0,  -- 운영 적합도
  total_missing_risk       NUMERIC NOT NULL DEFAULT 0,  -- 전체 미확인 위험
  calculated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_risk_results_session_id ON risk_results(session_id);

-- 위험 플래그
CREATE TABLE risk_flags (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id            UUID NOT NULL REFERENCES brand_sessions(id) ON DELETE CASCADE,
  flag_type             risk_flag_type NOT NULL,
  severity              risk_severity NOT NULL,
  title                 TEXT NOT NULL,
  description           TEXT NOT NULL,
  related_question_ids  UUID[] DEFAULT '{}',
  related_doc_fields    TEXT[] DEFAULT '{}',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_risk_flags_session_id ON risk_flags(session_id);
CREATE INDEX idx_risk_flags_severity ON risk_flags(severity);

-- 본사에 물어볼 자동 생성 질문
CREATE TABLE followup_questions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id    UUID NOT NULL REFERENCES brand_sessions(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  context       TEXT NOT NULL,  -- 왜 이 질문이 생성됐는지
  priority      INT NOT NULL DEFAULT 5,
  is_answered   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_followup_session_id ON followup_questions(session_id);
CREATE INDEX idx_followup_priority ON followup_questions(priority);

-- 브랜드 비교
CREATE TABLE comparisons (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_ids UUID[] NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comparisons_user_id ON comparisons(user_id);

-- 최종 리포트
CREATE TABLE reports (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id   UUID NOT NULL REFERENCES brand_sessions(id) ON DELETE CASCADE,
  share_token  TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  report_data  JSONB NOT NULL,
  pdf_path     TEXT,
  verdict      final_verdict NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_session_id ON reports(session_id);
CREATE INDEX idx_reports_share_token ON reports(share_token);

-- ── Row Level Security (RLS) ───────────────────────────────

-- 사용자는 자신의 데이터만 접근 가능
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_answer_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE followup_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- questions, question_options, question_conditions: 모든 인증 사용자가 읽기 가능
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "questions_read_all" ON questions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "question_options_read_all" ON question_options FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "question_conditions_read_all" ON question_conditions FOR SELECT USING (auth.role() = 'authenticated');

-- user_profiles
CREATE POLICY "user_profiles_own" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

-- brands
CREATE POLICY "brands_own" ON brands
  FOR ALL USING (auth.uid() = user_id);

-- brand_sessions
CREATE POLICY "brand_sessions_own" ON brand_sessions
  FOR ALL USING (auth.uid() = user_id);

-- question_answers (세션 소유자만)
CREATE POLICY "question_answers_own" ON question_answers
  FOR ALL USING (
    session_id IN (SELECT id FROM brand_sessions WHERE user_id = auth.uid())
  );

-- question_answer_history
CREATE POLICY "answer_history_own" ON question_answer_history
  FOR ALL USING (
    answer_id IN (
      SELECT qa.id FROM question_answers qa
      JOIN brand_sessions bs ON qa.session_id = bs.id
      WHERE bs.user_id = auth.uid()
    )
  );

-- documents
CREATE POLICY "documents_own" ON documents
  FOR ALL USING (
    session_id IN (SELECT id FROM brand_sessions WHERE user_id = auth.uid())
  );

-- document_extractions
CREATE POLICY "extractions_own" ON document_extractions
  FOR ALL USING (
    document_id IN (
      SELECT d.id FROM documents d
      JOIN brand_sessions bs ON d.session_id = bs.id
      WHERE bs.user_id = auth.uid()
    )
  );

-- risk_results, risk_flags, followup_questions
CREATE POLICY "risk_results_own" ON risk_results
  FOR ALL USING (session_id IN (SELECT id FROM brand_sessions WHERE user_id = auth.uid()));

CREATE POLICY "risk_flags_own" ON risk_flags
  FOR ALL USING (session_id IN (SELECT id FROM brand_sessions WHERE user_id = auth.uid()));

CREATE POLICY "followup_questions_own" ON followup_questions
  FOR ALL USING (session_id IN (SELECT id FROM brand_sessions WHERE user_id = auth.uid()));

-- comparisons
CREATE POLICY "comparisons_own" ON comparisons
  FOR ALL USING (auth.uid() = user_id);

-- reports: 본인 또는 공유 토큰으로 조회
CREATE POLICY "reports_own" ON reports
  FOR ALL USING (
    session_id IN (SELECT id FROM brand_sessions WHERE user_id = auth.uid())
  );

-- 공유 링크: 토큰이 있으면 누구나 읽기 가능 (별도 정책)
CREATE POLICY "reports_shared_read" ON reports
  FOR SELECT USING (share_token IS NOT NULL);

-- risk_rules: 인증 사용자 읽기
ALTER TABLE risk_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "risk_rules_read" ON risk_rules FOR SELECT USING (auth.role() = 'authenticated');
