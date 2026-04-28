import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RfAnalysis = () => {
    const [fileData, setFileData] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [progress, setProgress] = useState(0);
    const [lossData, setLossData] = useState([]);
    const [chartData, setChartData] = useState([]);

    const [params, setParams] = useState({
        windowSize: 10,
        nEstimators: 100,
        maxDepth: 10,
        minSamplesSplit: 2,
        criterion: 'gini',
        learningRate: 0.01,
        epochs: 30,
        batchSize: 32
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const nextValue = e.target.type === 'number' ? parseFloat(value) : value;
        setParams({ ...params, [name]: nextValue });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const jsonRaw = XLSX.utils.sheet_to_json(ws);
            const values = jsonRaw.map(row => parseFloat(Object.values(row)[0])).filter(v => !isNaN(v));
            setFileData(values);
            alert(`${values.length}개의 데이터를 불러왔습니다.`);
        };
        reader.readAsBinaryString(file);
    };

    const runRfAnalysis = async () => {
        const winSize = parseInt(params.windowSize);
        if (fileData.length < winSize) return alert("데이터가 부족합니다.");

        setIsAnalyzing(true);
        setLossData([]);
        setChartData([]);
        setProgress(0);

        try {
            const maxVal = Math.max(...fileData);
            const minVal = Math.min(...fileData);
            const range = maxVal - minVal || 1;
            const scaledData = fileData.map(v => (v - minVal) / range);

            const xs = []; const ys = [];
            for (let i = 0; i < scaledData.length - winSize; i++) {
                xs.push(scaledData.slice(i, i + winSize));
                ys.push(scaledData[i + winSize]);
            }

            const tensorXs = window.tf.tensor2d(xs);
            const tensorYs = window.tf.tensor2d(ys, [ys.length, 1]);

            const model = window.tf.sequential();
            model.add(window.tf.layers.dense({
                units: parseInt(params.nEstimators),
                activation: params.criterion === 'gini' ? 'relu' : 'tanh',
                inputShape: [winSize]
            }));
            model.add(window.tf.layers.dense({ units: 1 }));
            model.compile({ optimizer: window.tf.train.adam(params.learningRate), loss: 'meanSquaredError' });

            await model.fit(tensorXs, tensorYs, {
                epochs: parseInt(params.epochs),
                batchSize: parseInt(params.batchSize),
                callbacks: {
                    onEpochEnd: (epoch, logs) => {
                        const cur = epoch + 1;
                        setProgress(Math.round((cur / params.epochs) * 100));
                        setLossData(prev => [...prev, { epoch: cur, loss: logs.loss }]);
                    }
                }
            });

            const predScaled = model.predict(tensorXs).dataSync();
            const predOriginal = Array.from(predScaled).map(v => v * range + minVal);
            const actualOriginal = ys.map(v => v * range + minVal);

            setChartData(actualOriginal.map((actual, i) => ({
                index: i,
                실제값: actual.toFixed(2),
                예측값: predOriginal[i].toFixed(2)
            })).slice(-50));

            const finalLoss = lossData[lossData.length - 1]?.loss || 0;
            const safeAccuracy = (Math.max(0, (1 - Math.sqrt(finalLoss))) * 100).toFixed(2);

            setResult(`분석 완료! (추정 정확도: ${safeAccuracy}%)`);
            tensorXs.dispose(); tensorYs.dispose(); model.dispose();

        } catch (err) {
            console.error(err);
            alert("분석 중 오류 발생");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1100px', margin: 'auto', fontFamily: 'Arial' }}>
            <h2 style={{ color: '#27ae60', borderBottom: '3px solid #27ae60', paddingBottom: '10px' }}>🌲 RF 분석 & 실시간 모니터링</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '20px', marginBottom: '20px' }}>
                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', border: '1px solid #dee2e6' }}>
                    <h4>📂 데이터 업로드</h4>
                    <input type="file" onChange={handleFileUpload} accept=".csv, .xlsx" style={{ width: '100%' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', background: '#fff', padding: '20px', border: '1px solid #dee2e6', borderRadius: '10px' }}>
                    <h4 style={{ gridColumn: 'span 4', margin: 0 }}>⚙️ 파라미터 튜닝</h4>
                    <label>윈도우<br/><input type="number" name="windowSize" value={params.windowSize} onChange={handleInputChange} style={{width:'85%'}}/></label>
                    <label>트리수<br/><input type="number" name="nEstimators" value={params.nEstimators} onChange={handleInputChange} style={{width:'85%'}}/></label>
                    <label>깊이<br/><input type="number" name="maxDepth" value={params.maxDepth} onChange={handleInputChange} style={{width:'85%'}}/></label>
                    <label>최소분할<br/><input type="number" name="minSamplesSplit" value={params.minSamplesSplit} onChange={handleInputChange} style={{width:'85%'}}/></label>
                    <label>지표<br/>
                        <select name="criterion" value={params.criterion} onChange={handleInputChange} style={{width:'95%', padding:'3px'}}>
                            <option value="gini">Gini</option>
                            <option value="entropy">Entropy</option>
                        </select>
                    </label>
                    <label>학습률<br/><input type="number" step="0.001" name="learningRate" value={params.learningRate} onChange={handleInputChange} style={{width:'85%'}}/></label>
                    <label>Epochs<br/><input type="number" name="epochs" value={params.epochs} onChange={handleInputChange} style={{width:'85%'}}/></label>
                    <label>배치크기<br/><input type="number" name="batchSize" value={params.batchSize} onChange={handleInputChange} style={{width:'85%'}}/></label>
                </div>
            </div>

            <button onClick={runRfAnalysis} disabled={isAnalyzing || fileData.length === 0} style={{ width: '100%', padding: '15px', backgroundColor: isAnalyzing ? '#ccc' : '#27ae60', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px' }}>
                {isAnalyzing ? `분석 중... (${progress}%)` : "분석 실행"}
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: '#fff', padding: '15px', border: '1px solid #eee', borderRadius: '10px' }}>
                    <h5>📉 Training Loss</h5>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={lossData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="epoch" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="loss" stroke="#e74c3c" dot={false} strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ background: '#fff', padding: '15px', border: '1px solid #eee', borderRadius: '10px' }}>
                    <h5>📊 Actual vs Prediction</h5>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="index" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="실제값" stroke="#27ae60" dot={false} strokeWidth={2} />
                            <Line type="monotone" dataKey="예측값" stroke="#3498db" dot={false} strokeWidth={2} strokeDasharray="5 5" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {result && <div style={{ marginTop: '20px', padding: '15px', background: '#d4edda', color: '#155724', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}>{result}</div>}
        </div>
    );
};

export default RfAnalysis;