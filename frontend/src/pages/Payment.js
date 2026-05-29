import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, CreditCard, Shield, Zap } from 'lucide-react';
import { API, tokenStorage } from '../api/auth';

const TOSS_CLIENT_KEY = process.env.REACT_APP_TOSS_CLIENT_KEY;

const FEATURES = [
  '서버 GPU/CPU로 LSTM 모델 학습',
  '서버 GPU/CPU로 Random Forest 학습',
  '브라우저 부하 없는 대용량 데이터 처리',
  '분석 결과 영구 저장',
  '커뮤니티 게시글 무제한',
];

const Payment = () => {
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [history, setHistory]   = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Toss Payments SDK 동적 로드
    const script = document.createElement('script');
    script.src = 'https://js.tosspayments.com/v1/payment';
    document.head.appendChild(script);

    // 유저 정보 + 결제 이력 조회
    const fetchData = async () => {
      try {
        const [meRes, histRes] = await Promise.all([
          API.get('/auth/me'),
          API.get('/api/payment/history'),
        ]);
        setUserInfo(meRes.data);
        setHistory(histRes.data.filter(h => h.status === 'DONE'));
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();

    return () => document.head.removeChild(script);
  }, []);

  const handleSubscribe = async () => {
    if (!window.TossPayments) return alert('결제 모듈 로드 중입니다. 잠시 후 다시 시도해주세요.');
    setLoading(true);

    try {
      const customerKey = `ml-${userInfo.userId}`;
      const toss = window.TossPayments(TOSS_CLIENT_KEY);

      // 빌링키 발급 요청 (카드 등록 UI)
      await toss.requestBillingAuth('카드', {
        customerKey,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl:    `${window.location.origin}/payment/fail`,
      });
    } catch (e) {
      console.error('결제 오류:', e);
      alert('결제 요청 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('구독을 취소하시겠습니까? 다음 결제일부터 청구되지 않습니다.')) return;
    try {
      await API.post('/api/payment/cancel');
      alert('구독이 취소되었습니다.');
      window.location.reload();
    } catch (e) {
      alert('취소 처리 중 오류가 발생했습니다.');
    }
  };

  const isSubscribed = userInfo?.subscYn === 1;

  return (
    <div className="page">
      <div className="shell" style={{ maxWidth: 760 }}>
        <div style={{ marginBottom: 32 }}>
          <p className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.8rem', fontWeight: 600, color: 'var(--blue)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            <CreditCard size={14} /> 구독 관리
          </p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--dark)' }}>MLWeb Pro</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          {/* 플랜 카드 */}
          <div className="tool-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--dark)' }}>Pro 플랜</h2>
              <span className={isSubscribed ? 'status-badge success' : 'status-badge'}>
                {isSubscribed ? <><CheckCircle2 size={13} /> 구독 중</> : '미구독'}
              </span>
            </div>
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--dark)' }}>₩9,900</span>
              <span style={{ fontSize: '.88rem', color: 'var(--muted)', marginLeft: 4 }}>/ 월</span>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {FEATURES.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.88rem', color: 'var(--body)' }}>
                  <CheckCircle2 size={16} color="var(--green)" />
                  {f}
                </li>
              ))}
            </ul>
            {isSubscribed ? (
              <button className="danger-button" style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleCancel}>구독 취소</button>
            ) : (
              <button className="primary-button full" onClick={handleSubscribe} disabled={loading}>
                <CreditCard size={16} />
                {loading ? '처리 중...' : '카드 등록 및 구독 시작'}
              </button>
            )}
          </div>

          {/* 안내 */}
          <div className="tool-panel">
            <div className="panel-title" style={{ marginBottom: 16 }}>
              <Shield size={20} />
              <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>결제 안내</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '.88rem', color: 'var(--body)' }}>
              <p>• 매월 1일 오전 9시에 자동 결제됩니다.</p>
              <p>• 카드 등록 즉시 첫 달 결제가 진행됩니다.</p>
              <p>• 구독 취소 후에도 해당 월 만료일까지 사용 가능합니다.</p>
              <p>• 결제는 토스페이먼츠를 통해 안전하게 처리됩니다.</p>
              <div style={{ marginTop: 8, padding: 12, background: 'var(--blue-light)', borderRadius: 6 }}>
                <p style={{ fontWeight: 600, color: 'var(--blue)', marginBottom: 4 }}>
                  <Zap size={14} style={{ display: 'inline', marginRight: 4 }} />
                  서버 ML 사용 방법
                </p>
                <p style={{ color: 'var(--body)', fontSize: '.82rem' }}>
                  구독 후 분석 페이지에서 <strong>서버 분석</strong> 모드를 선택하면 서버 자원으로 모델이 학습됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 결제 이력 */}
        {history.length > 0 && (
          <div className="tool-panel">
            <div className="panel-title">
              <CreditCard size={20} />
              <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>결제 이력</h2>
            </div>
            {history.map((h) => (
              <div key={h.payId} className="payment-row">
                <div>
                  <strong>{h.orderName}</strong>
                  <span>{h.paidDt ? new Date(h.paidDt).toLocaleDateString() : '—'}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ color: 'var(--dark)' }}>
                    ₩{h.amount?.toLocaleString()}
                  </strong>
                  <span className="status-badge success" style={{ marginTop: 4, display: 'inline-flex' }}>결제 완료</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
