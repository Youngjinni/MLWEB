import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Heart, MessageCircle, Send } from 'lucide-react';
import { API } from '../api/auth';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [comments, setComments]       = useState([]);
  const [commentInput, setCommentInput] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postRes, commentRes] = await Promise.all([
          API.get(`/api/community/posts/${id}`),
          API.get(`/api/community/posts/${id}/comments`),
        ]);
        setPost(postRes.data);
        setComments(commentRes.data);
      } catch (err) {
        console.error('데이터 로드 실패:', err);
        alert('데이터를 불러올 수 없습니다.');
        navigate('/posts');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, navigate]);

  const handleLike = async () => {
    try {
      const res = await API.post(`/api/community/posts/${id}/like`);
      setPost({ ...post, likeCnt: res.data });
    } catch {
      alert('좋아요 처리에 실패했습니다.');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    try {
      const res = await API.post(`/api/community/posts/${id}/comments`, { cont: commentInput });
      setComments([...comments, res.data]);
      setCommentInput('');
    } catch {
      alert('댓글 등록에 실패했습니다.');
    }
  };

  if (loading) return <div className="loading-state">로딩 중...</div>;
  if (!post)   return <div className="empty-state">게시글을 찾을 수 없습니다.</div>;

  return (
    <div className="page">
      <div className="shell detail-layout">
        <button className="secondary-button compact" type="button" onClick={() => navigate('/posts')} style={{ marginBottom: 24 }}>
          ← 목록으로
        </button>

        <div className="tool-panel" style={{ marginBottom: 20 }}>
          <div className="detail-header">
            <h1>{post.postNm}</h1>
            <div className="detail-meta">
              <span>작성자 ID: {post.userId}</span>
              <span>{post.crtrDt ? new Date(post.crtrDt).toLocaleString() : '—'}</span>
            </div>
          </div>
          <div className="detail-body">{post.cont}</div>
          {post.imgUrl && (
            <div style={{ marginBottom: 24, textAlign: 'center' }}>
              <img src={post.imgUrl} alt="첨부 이미지" style={{ maxWidth: '100%', borderRadius: 8 }} />
            </div>
          )}
          <div className="detail-actions">
            <button className="like-button" type="button" onClick={handleLike}>
              <Heart size={16} /> 좋아요 {post.likeCnt || 0}
            </button>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.85rem', color: 'var(--muted)' }}>
              <Eye size={15} /> 조회 {post.viewCnt || 0}
            </span>
          </div>
        </div>

        <div className="tool-panel">
          <div className="panel-title">
            <MessageCircle size={20} />
            <h2>댓글 ({comments.length})</h2>
          </div>
          <form className="comment-input-row" onSubmit={handleCommentSubmit}>
            <input className="form-control" type="text" value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)} placeholder="따뜻한 댓글을 남겨주세요." />
            <button className="primary-button" type="submit"><Send size={16} /> 등록</button>
          </form>
          <div>
            {comments.length === 0 ? (
              <p className="empty-comments">첫 번째 댓글을 남겨보세요!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.cmetId} className="comment-item">
                  <p className="comment-author">사용자 {comment.userId}</p>
                  <p className="comment-body">{comment.cont}</p>
                  <p className="comment-date">{new Date(comment.crtrDt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
