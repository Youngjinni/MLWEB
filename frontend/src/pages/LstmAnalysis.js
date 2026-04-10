import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';

const LstmAnalysis = () => {
    const [fileData, setFileData] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);

    // DB 구조 (ML_MODEL_LSTM) 필드 전체 반영
    const [params, setParams] = useState({
        windowSize: 10,
        hiddenLayers: 1,
        neurons: 64,
        epochs: 50,
        batchSize: 32,
        learningRate: 0.001,
        optimizer: 'Adam'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setParams({ ...params, [name]: value });
    };

    // 엑셀 파일 읽기 로직
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const jsonRaw = XLSX.utils.sheet_to_json(ws);

            // 첫 번째 컬럼 데이터 추출 및 숫자 변환
            const values = jsonRaw
                .map(row => parseFloat(Object.values(row)[0]))
                .filter(val => !isNaN(val));

            setFileData(values);
            alert(`${values.length}개의 시계열 데이터를 읽어왔습니다.`);
        };
        reader.readAsBinaryString(file);
    };

    const runLstm = async () => {
        if (fileData.length < params.windowSize) return alert("데이터가 윈도우 크기보다 적습니다.");
        setIsAnalyzing(true);

        try {
            // 1. 데이터셋 구성
            const xs = []; const ys = [];
            for (let i = 0; i < fileData.length - params.windowSize; i++) {
                xs.push(fileData.slice(i, i + params.windowSize));
                ys.push(fileData[i + params.windowSize]);
            }

            const tensorXs = window.tf.tensor3d(xs, [xs.length, params.windowSize, 1]);
            const tensorYs = window.tf.tensor2d(ys, [ys.length, 1]);

            // 2. 모델 생성 및 학습
            const model = window.tf.sequential();
            model.add(window.tf.layers.lstm({
                units: parseInt(params.neurons),
                inputShape: [params.windowSize, 1]
            }));
            model.add(window.tf.layers.dense({ units: 1 }));

            model.compile({
                optimizer: params.optimizer.toLowerCase(),
                loss: 'meanSquaredError'
            });

            await model.fit(tensorXs, tensorYs, {
                epochs: parseInt(params.epochs),
                batchSize: parseInt(params.batchSize),
                callbacks: { onEpochEnd: (epoch, logs) => console.log(`Epoch ${epoch}: Loss ${logs.loss}`) }
            });

            setResult("LSTM 분석 및 학습이 완료되었습니다.");

            // 3. 백엔드 DB 저장
            await axios.post('http://localhost:8083/api/analysis/lstm', {
                ...params,
                inputDataNm: "User_Upload_File",
                resultJson: JSON.stringify({ status: "success", dataCount: fileData.length })
            }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

        } catch (err) {
            console.error(err);
            alert("LSTM 분석 중 오류 발생");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
            <h2 style={{ borderBottom: '2px solid #4a90e2', paddingBottom: '10px' }}>📈 LSTM 시계열 분석</h2>

            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
                <h4>1. 데이터 파일 업로드 (.csv, .xlsx)</h4>
                <input type="file" onChange={handleFileUpload} accept=".csv, .xlsx" />
                <p style={{ fontSize: '0.8rem', color: '#666' }}>※ 엑셀의 첫 번째 열 데이터를 시계열 데이터로 사용합니다.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#fff', padding: '20px', border: '1px solid #ddd', borderRadius: '10px' }}>
                <h4 style={{ gridColumn: 'span 2' }}>2. 분석 파라미터 설정</h4>
                <label>윈도우 크기 (Window Size)<br/><input type="number" name="windowSize" value={params.windowSize} onChange={handleInputChange} style={{width:'100%'}}/></label>
                <label>뉴런 수 (Neurons)<br/><input type="number" name="neurons" value={params.neurons} onChange={handleInputChange} style={{width:'100%'}}/></label>
                <label>학습 횟수 (Epochs)<br/><input type="number" name="epochs" value={params.epochs} onChange={handleInputChange} style={{width:'100%'}}/></label>
                <label>배치 크기 (Batch Size)<br/><input type="number" name="batchSize" value={params.batchSize} onChange={handleInputChange} style={{width:'100%'}}/></label>
                <label>학습률 (Learning Rate)<br/><input type="number" step="0.001" name="learningRate" value={params.learningRate} onChange={handleInputChange} style={{width:'100%'}}/></label>
                <label>최적화 함수 (Optimizer)<br/>
                    <select name="optimizer" value={params.optimizer} onChange={handleInputChange} style={{width:'100%', padding:'4px'}}>
                        <option value="Adam">Adam</option>
                        <option value="SGD">SGD</option>
                    </select>
                </label>
            </div>

            <button onClick={runLstm} disabled={isAnalyzing || fileData.length === 0} style={{ marginTop: '20px', width: '100%', padding: '15px', backgroundColor: '#4a90e2', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', cursor: 'pointer' }}>
                {isAnalyzing ? "모델 학습 및 분석 중..." : "분석 실행하기"}
            </button>

            {result && <div style={{ marginTop: '20px', padding: '15px', background: '#e7f3ff', borderRadius: '5px', color: '#0056b3' }}>{result}</div>}
        </div>
    );
};

export default LstmAnalysis;