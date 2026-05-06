import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PostWrite = () => {
    const [postNm, setPostNm] = useState('');
    const [cont, setCont] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            // 엔티티 구조에 맞춰 POST 요청
            await axios.post('http://localhost:8080/api/community/posts', {
                postNm: postNm,
                cont: cont,
                imgUrl: ""
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                withCredentials: true // 💡 이 줄을 반드시 추가하세요!
            });

            alert("게시글이 등록되었습니다!");
            navigate('/posts'); // 등록 후 다시 목록으로 이동
        } catch (error) {
            navigate('/posts');
        }
    };

    return (
        <div className="post-write-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2>새 게시글 작성</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="text"
                    placeholder="제목을 입력하세요"
                    value={postNm}
                    onChange={(e) => setPostNm(e.target.value)}
                    required
                    style={{ padding: '10px', fontSize: '16px' }}
                />
                <textarea
                    placeholder="내용을 입력하세요"
                    value={cont}
                    onChange={(e) => setCont(e.target.value)}
                    required
                    style={{ height: '300px', padding: '10px', fontSize: '14px' }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
                        등록
                    </button>
                    <button type="button" onClick={() => navigate('/posts')} style={{ flex: 1, padding: '10px' }}>
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostWrite;