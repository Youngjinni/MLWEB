import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- ⭐ 1. 댓글을 위한 새로운 상태(State) 추가 ---
    const [comments, setComments] = useState([]); // 댓글 목록 저장
    const [commentInput, setCommentInput] = useState(""); // 댓글 입력창 텍스트
    const token = localStorage.getItem('token');
    const headers = { Authorization: token ? `Bearer ${token}` : "" };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 게시글 정보와 댓글 목록을 동시에 가져옵니다.
                const [postRes, commentRes] = await Promise.all([
                    axios.get(`http://localhost:8082/api/community/posts/${id}`, { headers }),
                    axios.get(`http://localhost:8082/api/community/posts/${id}/comments`, { headers })
                ]);
                setPost(postRes.data);
                setComments(commentRes.data);
            } catch (err) {
                console.error("데이터 로드 실패:", err);
                alert("데이터를 불러올 수 없습니다.");
                navigate('/posts');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id, navigate]);

    // --- ⭐ 2. 좋아요 클릭 함수 ---
    const handleLike = async () => {
        try {
            const res = await axios.post(`http://localhost:8080/api/community/posts/${id}/like`, {}, { headers });
            setPost({ ...post, likeCnt: res.data }); // 서버가 보낸 최신 좋아요 수로 업데이트
        } catch (err) {
            alert("좋아요 처리에 실패했습니다.");
        }
    };

    // --- ⭐ 3. 댓글 등록 함수 ---
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentInput.trim()) return;

        try {
            const res = await axios.post(`http://localhost:8080/api/community/posts/${id}/comments`,
                { cont: commentInput },
                { headers }
            );
            setComments([...comments, res.data]); // 기존 댓글 배열에 새 댓글 추가
            setCommentInput(""); // 입력창 비우기
        } catch (err) {
            alert("댓글 등록에 실패했습니다.");
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>로딩 중...</div>;
    if (!post) return <div style={{ textAlign: 'center', marginTop: '50px' }}>게시글을 찾을 수 없습니다.</div>;

    return (
        <div className="post-detail-container" style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', border: '1px solid #eee', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>

            <div style={{ marginBottom: '20px' }}>
                <button onClick={() => navigate('/posts')} style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '5px' }}>← 목록으로 돌아가기</button>
            </div>

            <h1 style={{ fontSize: '2rem', marginBottom: '15px', color: '#333' }}>{post.postNm}</h1>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '25px', fontSize: '0.9rem' }}>
                <span>작성자 ID: {post.userId}</span>
                <span>작성일: {post.crtrDt ? new Date(post.crtrDt).toLocaleString() : '날짜 정보 없음'}</span>
            </div>

            <div style={{ minHeight: '300px', fontSize: '1.1rem', lineHeight: '1.8', whiteSpace: 'pre-wrap', color: '#444' }}>{post.cont}</div>

            {post.imgUrl && (
                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    <img src={post.imgUrl} alt="첨부 이미지" style={{ maxWidth: '100%', borderRadius: '5px' }} />
                </div>
            )}

            {/* --- ⭐ 4. 좋아요 버튼 (기존 영역 수정) --- */}
            <div style={{ marginTop: '40px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <button
                    onClick={handleLike}
                    style={{ padding: '10px 25px', fontSize: '1.1rem', cursor: 'pointer', borderRadius: '30px', border: '1px solid #ff4757', color: '#ff4757', backgroundColor: 'white' }}
                >
                    👍 좋아요 {post.likeCnt || 0}
                </button>
                <div style={{ marginTop: '10px', color: '#999' }}>👀 조회수 {post.viewCnt || 0}</div>
            </div>

            {/* --- ⭐ 5. 댓글 영역 추가 --- */}
            <div style={{ marginTop: '50px' }}>
                <h3>댓글 ({comments.length})</h3>

                {/* 댓글 입력 폼 */}
                <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                    <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="따뜻한 댓글을 남겨주세요."
                        style={{ flex: 1, padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }}
                    />
                    <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>등록</button>
                </form>

                {/* 댓글 목록 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {comments.map((comment) => (
                        <div key={comment.cmetId} style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '5px' }}>사용자 {comment.userId}</div>
                            <div style={{ color: '#444' }}>{comment.cont}</div>
                            <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '8px' }}>
                                {new Date(comment.crtrDt).toLocaleString()}
                            </div>
                        </div>
                    ))}
                    {comments.length === 0 && <p style={{ color: '#999', textAlign: 'center' }}>첫 번째 댓글을 남겨보세요!</p>}
                </div>
            </div>
        </div>
    );
};

export default PostDetail;