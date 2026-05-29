import React from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenStorage } from '../api/auth';

const Home = () => {
  const navigate  = useNavigate();
  const isLoggedIn = !!tokenStorage.getAccess();

  return (
    <div className="home-page">

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="shell">
          <div className="hero-inner">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              머신러닝 웹 플랫폼
            </div>
            <h1 className="hero-title">
              데이터를 넣으면<br />
              <span className="hero-accent">예측이 나옵니다</span>
            </h1>
            <p className="hero-desc">
              LSTM 시계열 예측과 Random Forest 분석을<br />
              브라우저 또는 서버 자원으로 실행하세요.
            </p>
            <div className="hero-cta">
              {isLoggedIn ? (
                <>
                  <button className="cta-primary" onClick={() => navigate('/analysis/lstm')}>
                    LSTM 분석 시작
                  </button>
                  <button className="cta-secondary" onClick={() => navigate('/analysis/rf')}>
                    RF 분석 시작
                  </button>
                </>
              ) : (
                <>
                  <button className="cta-primary" onClick={() => navigate('/signup')}>
                    무료로 시작하기
                  </button>
                  <button className="cta-secondary" onClick={() => navigate('/login')}>
                    로그인
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 기능 카드 ── */}
      <section className="features-section">
        <div className="shell">
          <p className="section-eyebrow">분석 모델</p>
          <h2 className="section-title">두 가지 ML 모델</h2>
          <div className="feature-grid">
            <div className="feature-card feature-card--lstm">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <h3>LSTM</h3>
              <p className="feature-sub">Long Short-Term Memory</p>
              <p className="feature-desc">
                시계열 패턴을 기억하는 순환 신경망. 주가, 기온, 수요량 등 시간 순서가 있는 데이터의 다음 값을 예측합니다.
              </p>
              <div className="feature-tags">
                <span>주가 예측</span>
                <span>기상 데이터</span>
                <span>수요 예측</span>
                <span>센서 데이터</span>
              </div>
              <button className="feature-btn" onClick={() => navigate(isLoggedIn ? '/analysis/lstm' : '/login')}>
                시작하기 →
              </button>
            </div>

            <div className="feature-card feature-card--rf">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
              </div>
              <h3>Random Forest</h3>
              <p className="feature-sub">Ensemble Tree Model</p>
              <p className="feature-desc">
                여러 결정 트리를 조합한 앙상블 모델. 노이즈에 강하고 과적합이 적어 범용적인 회귀 분석에 적합합니다.
              </p>
              <div className="feature-tags">
                <span>부동산 가격</span>
                <span>매출 예측</span>
                <span>이상 감지</span>
                <span>품질 분류</span>
              </div>
              <button className="feature-btn feature-btn--rf" onClick={() => navigate(isLoggedIn ? '/analysis/rf' : '/login')}>
                시작하기 →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 실행 모드 비교 ── */}
      <section className="mode-section">
        <div className="shell">
          <p className="section-eyebrow">실행 환경</p>
          <h2 className="section-title">브라우저 vs 서버</h2>
          <div className="mode-table">
            <div className="mode-col mode-col--header">
              <div className="mode-cell" />
              <div className="mode-cell">처리 위치</div>
              <div className="mode-cell">데이터 크기</div>
              <div className="mode-cell">속도</div>
              <div className="mode-cell">비용</div>
            </div>
            <div className="mode-col mode-col--browser">
              <div className="mode-cell mode-cell--title">브라우저</div>
              <div className="mode-cell">내 컴퓨터</div>
              <div className="mode-cell">소규모 권장</div>
              <div className="mode-cell">PC 사양 의존</div>
              <div className="mode-cell mode-cell--free">무료</div>
            </div>
            <div className="mode-col mode-col--server">
              <div className="mode-cell mode-cell--title">
                서버
                <span className="pro-badge">PRO</span>
              </div>
              <div className="mode-cell">서버 GPU/CPU</div>
              <div className="mode-cell">대용량 처리</div>
              <div className="mode-cell">일정하고 빠름</div>
              <div className="mode-cell mode-cell--paid">₩9,900/월</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 데이터 형식 안내 ── */}
      <section className="guide-section">
        <div className="shell">
          <p className="section-eyebrow">데이터 준비</p>
          <h2 className="section-title">이런 파일을 업로드하세요</h2>
          <div className="guide-grid">
            <div className="guide-card">
              <div className="guide-num">01</div>
              <h4>파일 형식</h4>
              <p>CSV 또는 XLSX 파일을 지원합니다. 첫 번째 열의 숫자 값을 자동으로 읽습니다.</p>
            </div>
            <div className="guide-card">
              <div className="guide-num">02</div>
              <h4>데이터 방향</h4>
              <p>행이 시간 순서대로 정렬되어 있어야 합니다. 헤더 행이 있어도 무관합니다.</p>
            </div>
            <div className="guide-card">
              <div className="guide-num">03</div>
              <h4>권장 데이터 크기</h4>
              <p>브라우저 모드는 500~2,000행 권장, 서버 모드는 10,000행 이상도 처리 가능합니다.</p>
            </div>
            <div className="guide-card">
              <div className="guide-num">04</div>
              <h4>결측값 처리</h4>
              <p>NaN, 빈 값은 자동으로 제거됩니다. 분석 전 데이터 정제를 권장합니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      {!isLoggedIn && (
        <section className="bottom-cta">
          <div className="shell">
            <h2>지금 바로 시작해보세요</h2>
            <p>회원가입 후 브라우저에서 즉시 분석할 수 있습니다.</p>
            <button className="cta-primary" onClick={() => navigate('/signup')}>
              무료 회원가입
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
