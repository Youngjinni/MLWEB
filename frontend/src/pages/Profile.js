import React, { useEffect, useState } from 'react';
import { CreditCard, KeyRound, ShieldCheck, UserRound, WalletCards, CheckCircle2 } from 'lucide-react';
import { getMyInfo } from '../api/auth';

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await getMyInfo();
        setUserInfo(response.data);
      } catch (error) {
        console.error('정보 불러오기 실패:', error);
        alert('로그인 세션이 만료되었거나 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, []);

  if (loading) return <div className="loading-state">로딩 중...</div>;
  if (!userInfo) return <div className="empty-state">사용자 정보를 찾을 수 없습니다.</div>;

  const isSubscribed = userInfo.subscYn === 1;

  return (
    <div className="page">
      <div className="shell profile-layout">

        {/* 프로필 헤더 */}
        <div className="profile-header">
          <div className="avatar">{userInfo.nm?.charAt(0).toUpperCase() || 'U'}</div>
          <div className="profile-info">
            <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.8rem', fontWeight: 600, color: 'var(--blue)', marginBottom: 6 }}>
              <KeyRound size={14} /> JWT Authenticated
            </p>
            <h1>{userInfo.nm} 님</h1>
            <p>{isSubscribed ? 'PAID 권한' : '미구독'} · {userInfo.email}</p>
          </div>
          <button className="secondary-button compact" type="button" onClick={() => alert('정보 수정 페이지로 이동')}>
            <UserRound size={16} /> 프로필 수정
          </button>
        </div>

        <div className="profile-grid">

          {/* 구독 현황 */}
          <section className="tool-panel">
            <div className="panel-title">
              <WalletCards size={20} />
              <h2>구독 현황</h2>
            </div>
            <div className="plan-row">
              <div>
                <span>ML Web Pro</span>
                <strong>월 9,900원</strong>
              </div>
              <span className={isSubscribed ? 'status-badge success' : 'status-badge'}>
                {isSubscribed ? <><CheckCircle2 size={13} /> 활성</> : '미구독'}
              </span>
            </div>
            <div className="billing-card">
              <CreditCard size={22} />
              <div>
                <span>구독 시작일</span>
                <strong>{userInfo.subscDt ? new Date(userInfo.subscDt).toLocaleDateString() : '—'}</strong>
              </div>
            </div>
            <div className="profile-row">
              <span>아이디</span>
              <strong>{userInfo.id}</strong>
            </div>
            <div className="profile-row">
              <span>이메일</span>
              <strong>{userInfo.email}</strong>
            </div>
            <div className="profile-row">
              <span>가입일</span>
              <strong>{userInfo.crtrDt ? new Date(userInfo.crtrDt).toLocaleDateString() : '—'}</strong>
            </div>
          </section>

          {/* 보안 상태 */}
          <section className="tool-panel">
            <div className="panel-title">
              <ShieldCheck size={20} />
              <h2>보안 상태</h2>
            </div>
            <div className="security-list">
              <span><CheckCircle2 size={18} /> 이메일 인증</span>
              <span><CheckCircle2 size={18} /> JWT 인증</span>
              <span><CheckCircle2 size={18} /> 단방향 해시 암호화</span>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Profile;
