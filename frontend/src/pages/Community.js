import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Heart, MessageCircle, Send, UsersRound } from 'lucide-react';
import { API } from '../api/auth';

const TABS = ['전략 공유', '자유 게시판'];

const Community = () => {
  const [posts, setPosts]         = useState([]);
  const [activeTab, setActiveTab] = useState('전략 공유');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await API.get('/api/community/posts');
        setPosts(response.data.sort((a, b) => b.postId - a.postId));
      } catch (error) {
        console.error('게시글 로딩 실패:', error);
        if (error.response?.status === 401) navigate('/login');
      }
    };
    fetchPosts();
  }, [navigate]);

  return (
    <div className="page">
      <div className="shell community-layout">
        <div>
          <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.8rem', fontWeight: 600, color: 'var(--blue)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            <UsersRound size={14} /> Community
          </p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--dark)' }}>분석 결과와 전략을 나누는 공간</h1>
        </div>

        <div className="community-toolbar">
          <div className="segmented">
            {TABS.map((tab) => (
              <button key={tab} className={activeTab === tab ? 'is-active' : ''} type="button" onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>
          <button className="primary-button compact" type="button" onClick={() => navigate('/posts/write')}>
            <Send size={15} /> 글 작성
          </button>
        </div>

        <div className="post-list">
          {posts.length > 0 ? (
            posts.map((post) => (
              <article key={post.postId} className="post-card" onClick={() => navigate(`/posts/${post.postId}`)}>
                <h2>{post.postNm}</h2>
                <p className="post-excerpt">{post.cont ? post.cont.substring(0, 120) : '내용이 없습니다.'}</p>
                <div className="post-meta">
                  <span>{new Date(post.crtrDt).toLocaleDateString()}</span>
                </div>
                <div className="post-stats">
                  <span><Eye size={14} /> {post.viewCnt}</span>
                  <span><Heart size={14} /> {post.likeCnt}</span>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <MessageCircle size={32} style={{ marginBottom: 12 }} />
              <p>게시글이 없습니다. 첫 번째 글을 남겨보세요!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;
