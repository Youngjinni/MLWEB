import React, { useEffect, useState } from 'react';
import { getMyInfo } from '../api/auth';

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await getMyInfo();
        setUserInfo(response.data); // 백엔드에서 받은 UserEntity 저장
      } catch (error) {
        console.error("정보 불러오기 실패:", error);
        alert("로그인 세션이 만료되었거나 정보를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (!userInfo) return <div>사용자 정보를 찾을 수 없습니다.</div>;

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', border: '1px solid #ddd', borderRadius: '10px' }}>
      <h2>👤 내 프로필 설정</h2>
      <hr />
      <div style={{ textAlign: 'left', lineHeight: '2' }}>
        <p><strong>아이디:</strong> {userInfo.id}</p>
        <p><strong>이름:</strong> {userInfo.nm}</p>
        <p><strong>이메일:</strong> {userInfo.email}</p>
        <p><strong>구독 여부:</strong> {userInfo.subscYn === 1 ? '✅ 구독 중' : '❌ 미구독'}</p>
        <p><strong>가입 일시:</strong> {new Date(userInfo.crtrDt).toLocaleString()}</p>
      </div>
      <button
        onClick={(modifymyinfo) => alert('정보 수정 페이지로 이동')}
        style={{ marginTop: '20px', width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        내 정보 수정하기
      </button>
    </div>
  );
};

export default Profile;