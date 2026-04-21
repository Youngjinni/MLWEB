import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
// 시각화 라이브러리 추가
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LstmAnalysis = () => {
    // 1. 상태 관리
    const [fileData, setFileData] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [progress, setProgress] = useState(0);
    const [lossData, setLossData] = useState([]); // 실시간 Loss 차트 데이터
    const [chartData, setChartData] = useState([]); // 결과 비교 차트 데이터

    const [params, setParams] = useState({
        windowSize: 10,
        neurons: 64,
        epochs: 50,
        batchSize: 32,
        learningRate: 0.001,
        optimizer: 'Adam'
    });

    // 2. 입력 핸들러
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const nextValue = e.target.type === 'number' ? parseFloat(value) : value;
        setParams({ ...params, [name]: nextValue });
    };

    // 3. 엑셀 파일 읽기
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const jsonRaw = XLSX.utils.sheet_to_json(ws);
            const values = jsonRaw.map(row => parseFloat(Object.values(row)[0])).filter(val => !isNaN(val));
            setFileData(values);
            alert(`${values.length}개의 데이터를 불러왔습니다.`);
        };
        reader.readAsBinaryString(file);
    };

    // 4. LSTM 분석 실행
    const runLstm = async () => {
        const winSize = parseInt(params.windowSize);
        if (fileData.length < winSize) return alert("데이터가 부족합니다.");

        setIsAnalyzing(true);
        setResult(null);
        setProgress(0);
        setLossData([]);
        setChartData([]);

        try {
            // 데이터 전처리 (3D Shape 생성)
            const xs = []; const ys = [];
            for (let i = 0; i < fileData.length - winSize; i++) {
                xs.push(fileData.slice(i, i + winSize).map(val => [val]));
                ys.push(fileData[i + winSize]);
            }

            const tensorXs = window.tf.tensor3d(xs);
            const tensorYs = window.tf.tensor2d(ys, [ys.length, 1]);

            // 모델 구성
            const model = window.tf.sequential();
            model.add(window.tf.layers.lstm({
                units: parseInt(params.neurons),
                inputShape: [winSize, 1],
                kernelInitializer: 'glorotUniform'
            }));
            model.add(window.tf.layers.dense({ units: 1 }));

            model.compile({
                optimizer: window.tf.train.adam(parseFloat(params.learningRate)),
                loss: 'meanSquaredError'
            });

            // 학습 실행 (실시간 콜백)
            await model.fit(tensorXs, tensorYs, {
                epochs: parseInt(params.epochs),
                batchSize: parseInt(params.batchSize),
                verbose: 0,
                callbacks: {
                    onEpochEnd: (epoch, logs) => {
                        const cur = epoch + 1;
                        setProgress(Math.round((cur / params.epochs) * 100));
                        setLossData(prev => [...prev, { epoch: cur, loss: logs.loss.toFixed(6) }]);
                    }
                }
            });

            // 예측 결과 생성
            const predictions = model.predict(tensorXs).dataSync();
            setChartData(ys.map((actual, i) => ({
                index: i,
                실제값: actual,
                예측값: predictions[i]
            })).slice(-50)); // 최근 50개 샘플 비교

            setResult("LSTM 분석 및 학습 완료!");

            // 백엔드 전송
            await axios.post('http://localhost:8083/api/analysis/lstm', {
                ...params,
                inputDataNm: "User_LSTM_Analysis",
                resultJson: JSON.stringify({
                    status: "success",
                    finalLoss: lossData[lossData.length - 1]?.loss
                })
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            tensorXs.dispose(); tensorYs.dispose(); model.dispose();
        } catch (err) {
            console.error(err);
            alert("에러 발생: " + err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1100px', margin: 'auto', fontFamily: 'sans-serif' }}>
            <h2 style={{ color: '#2c3e50', borderBottom: '3px solid #4a90e2', paddingBottom: '10px' }}>📈 LSTM 시계열 분석 & 모니터링</h2>

            {/* 상단 설정 영역 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '20px', marginBottom: '20px' }}>
                <div style={{ background: '#f4f7f6', padding: '20px', borderRadius: '10px' }}>
                    <h4 style={{ marginTop: 0 }}>📂 데이터 로드</h4>
                    <input type="file" onChange={handleFileUpload} accept=".csv, .xlsx" style={{ width: '100%' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', background: '#fff', padding: '20px', border: '1px solid #eee', borderRadius: '10px' }}>
                    <h4 style={{ gridColumn: 'span 3', margin: 0 }}>⚙️ 하이퍼파라미터</h4>
                    {['windowSize', 'neurons', 'epochs', 'batchSize', 'learningRate'].map(field => (
                        <label key={field} style={{ fontSize: '0.85rem' }}>
                            {field.toUpperCase()}<br/>
                            <input type="number" name={field} value={params[field]} onChange={handleInputChange} style={{ width: '90%', padding: '5px' }} />
                        </label>
                    ))}
                    <label style={{ fontSize: '0.85rem' }}>
                        OPTIMIZER<br/>
                        <select name="optimizer" value={params.optimizer} onChange={handleInputChange} style={{ width: '96%', padding: '5px' }}>
                            <option value="Adam">Adam</option>
                            <option value="SGD">SGD</option>
                        </select>
                    </label>
                </div>
            </div>

            <button
                onClick={runLstm}
                disabled={isAnalyzing || fileData.length === 0}
                style={{
                    width: '100%', padding: '18px',
                    backgroundColor: isAnalyzing ? '#b2bec3' : '#4a90e2',
                    color: 'white', border: 'none', borderRadius: '8px',
                    fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '25px'
                }}
            >
                {isAnalyzing ? `모델 학습 중... (${progress}%)` : "LSTM 분석 실행 및 결과 저장"}
            </button>

            {/* 차트 영역 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                <div style={{ background: '#fff', padding: '15px', borderRadius: '10px', border: '1px solid #eee' }}>
                    <h5 style={{ margin: '0 0 15px 0', color: '#e74c3c' }}>📉 Training Loss</h5>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={lossData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="epoch" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="loss" stroke="#e74c3c" dot={false} strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ background: '#fff', padding: '15px', borderRadius: '10px', border: '1px solid #eee' }}>
                    <h5 style={{ margin: '0 0 15px 0', color: '#4a90e2' }}>📊 Actual vs Prediction (LSTM)</h5>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="index" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="실제값" stroke="#2c3e50" dot={false} strokeWidth={2} />
                            <Line type="monotone" dataKey="예측값" stroke="#4a90e2" dot={false} strokeWidth={2} strokeDasharray="5 5" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {result && <div style={{ marginTop: '20px', padding: '20px', background: '#e3f2fd', color: '#0d47a1', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}>{result}</div>}
        </div>
    );
};

export default LstmAnalysis;