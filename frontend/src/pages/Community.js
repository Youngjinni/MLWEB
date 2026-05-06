import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Community = () => {
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // 1. 토큰 키 이름을 'accessToken' 혹은 'token' 중 하나로 통일하세요.
        // 여기서는 기존 코드의 'token'을 유지합니다.
        const token = localStorage.getItem('token');

        if (!token) {
            alert("로그인이 필요한 서비스입니다.");
            navigate('/login'); // 홈보다는 로그인 페이지로 보내는 것이 사용자 경험상 좋습니다.
            return;
        }

        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/community/posts', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                // 최신순 정렬 (서버에서 안 해줄 경우를 대비)
                const sortedPosts = response.data.sort((a, b) => b.postId - a.postId);
                setPosts(sortedPosts);
            } catch (error) {
                console.error("게시글 로딩 실패:", error);

                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('token'); // 대소문자 주의!
                    navigate('/login');
                }
            }
        };

        fetchPosts();
    }, [navigate]);

    return (
        <div className="community-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <div className="community-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h1>토론 게시판</h1>
                {/* 2. 글쓰기 페이지로 이동하는 버튼 추가 */}
                <button
                    onClick={() => navigate('/posts/write')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    새 글 쓰기
                </button>
            </div>

            <div className="post-list">
                {posts.length > 0 ? (
                    posts.map(post => (
                        <div
                            key={post.postId}
                            className="post-card"
                            // 1. 카드 클릭 시 상세 페이지로 이동하도록 설정
                            onClick={() => navigate(`/posts/${post.postId}`)}
                            style={{
                                borderBottom: '1px solid #ddd',
                                padding: '15px 0',
                                cursor: 'pointer', // 마우스를 올리면 손가락 모양으로 변경
                                transition: 'background-color 0.2s'
                            }}
                            // 마우스 올렸을 때 효과 (선택사항)
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            {/* 2. 제목 클릭 시에도 이동 (이미 카드 전체에 걸려있으므로 스타일만 조정) */}
                            <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>{post.postNm}</h3>

                            <p style={{ color: '#666' }}>
                                {post.cont ? post.cont.substring(0, 100) : "내용이 없습니다."}...
                            </p>

                            <div className="post-info" style={{ fontSize: '0.85rem', color: '#999', marginTop: '10px' }}>
                                <span>👍 {post.likeCnt}</span> |
                                <span> 👀 {post.viewCnt}</span> |
                                <span> 📅 {new Date(post.crtrDt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', marginTop: '50px', color: '#999' }}>
                        게시글이 존재하지 않습니다. 첫 번째 글을 남겨보세요!
                    </div>
                )}
            </div>
        </div>
    );
};

export default Community;