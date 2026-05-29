import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import { API } from '../api/auth';

/**
 * Toss SDK가 빌링키 발급 완료 후 리다이렉트하는 페이지.
 * successUrl: /payment/success?authKey=...&customerKey=...
 * failUrl:    /payment/fail?...
 */
const PaymentResult = ({ success }) => {
  const [params]   = useSearchParams();
  const [status, setStatus] = useState('processing'); // processing | done | error
  const navigate = useNavigate();

  useEffect(() => {
    if (!success) { setStatus('error'); return; }

    const authKey     = params.get('authKey');
    const customerKey = params.get('customerKey');

    if (!authKey || !customerKey) { setStatus('error'); return; }

    // 서버에 빌링키 발급 + 첫 달 결제 요청
    API.post('/api/payment/billing/issue', { authKey, customerKey })
      .then(() => setStatus('done'))
      .catch(() => setStatus('error'));
  }, [success, params]);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        {status === 'processing' && (
          <>
            <h2>결제 처리 중...</h2>
            <p className="auth-sub">잠시만 기다려주세요.</p>
          </>
        )}
        {status === 'done' && (
          <>
            <CheckCircle2 size={48} color="var(--green)" style={{ marginBottom: 16 }} />
            <h2>구독이 시작되었습니다!</h2>
            <p className="auth-sub" style={{ marginBottom: 24 }}>이제 서버 ML 분석을 사용하실 수 있습니다.</p>
            <button className="primary-button full" onClick={() => navigate('/analysis/lstm')}>
              분석 시작하기
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle size={48} color="var(--red)" style={{ marginBottom: 16 }} />
            <h2>결제에 실패했습니다.</h2>
            <p className="auth-sub" style={{ marginBottom: 24 }}>다시 시도해주세요.</p>
            <button className="primary-button full" onClick={() => navigate('/payment')}>
              돌아가기
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentResult;
