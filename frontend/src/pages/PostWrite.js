import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { API } from '../api/auth';

const PostWrite = () => {
  const [postNm, setPostNm]     = useState('');
  const [cont, setCont]         = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/api/community/posts', { postNm, cont, imgUrl: '' });
      alert('게시글이 등록되었습니다!');
      navigate('/posts');
    } catch (error) {
      console.error('게시글 등록 실패:', error);
      alert('게시글 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="shell write-layout">
        <h1>새 게시글 작성</h1>
        <div className="tool-panel">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label htmlFor="post-title">제목</label>
              <input id="post-title" className="form-control" type="text" placeholder="제목을 입력하세요"
                value={postNm} onChange={(e) => setPostNm(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="post-cont">내용</label>
              <textarea id="post-cont" className="form-control" placeholder="내용을 입력하세요"
                value={cont} onChange={(e) => setCont(e.target.value)} required
                style={{ height: 300, resize: 'vertical' }} />
            </div>
            <div className="write-actions">
              <button className="primary-button" type="submit" disabled={loading}>
                <Send size={16} /> {loading ? '등록 중...' : '등록'}
              </button>
              <button className="secondary-button" type="button" onClick={() => navigate('/posts')}>취소</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostWrite;
