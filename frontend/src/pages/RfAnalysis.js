import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';

const RfAnalysis = () => {
    const [rawJson, setRawJson] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [accuracy, setAccuracy] = useState(null);

    // DB 구조 (ML_MODEL_RF) 필드 전체 반영
    const [params, setParams] = useState({
        nEstimators: 100,
        maxDepth: 10,
        minSamplesSplit: 2,
        criterion: 'gini'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setParams({ ...params, [name]: value });
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
            setRawJson(jsonRaw);
            alert(`${jsonRaw.length}행의 데이터를 로드했습니다.`);
        };
        reader.readAsBinaryString(file);
    };

    const runRf = async () => {
        if (!rawJson) return alert("분석할 파일을 먼저 업로드하세요.");
        setIsAnalyzing(true);

        try {
            const pyodide = await window.loadPyodide();
            await pyodide.loadPackage(['pandas', 'scikit-learn']);

            // 데이터 전달
            pyodide.globals.set("js_data", JSON.stringify(rawJson));

            const pythonCode = `
import pandas as pd
import json
from sklearn.ensemble import RandomForestClassifier

df = pd.DataFrame(json.loads(js_data))
X = df.iloc[:, :-1] # 마지막 컬럼 제외
y = df.iloc[:, -1]  # 마지막 컬럼 선택

model = RandomForestClassifier(
    n_estimators=${params.nEstimators}, 
    max_depth=${params.maxDepth},
    min_samples_split=${params.minSamplesSplit},
    criterion='${params.criterion}'
)
model.fit(X, y)
acc = model.score(X, y)
json.dumps({"accuracy": acc})
            `;

            const res = await pyodide.runPythonAsync(pythonCode);
            const parsedRes = JSON.parse(res);
            setAccuracy(parsedRes.accuracy);

            // DB 저장
            await axios.post('http://localhost:8082/api/analysis/rf', {
                ...params,
                inputDataNm: "User_Upload_File",
                accuracy: parsedRes.accuracy,
                resultJson: res
            }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

        } catch (err) {
            console.error(err);
            alert("RF 분석 중 오류 발생");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
            <h2 style={{ borderBottom: '2px solid #2ecc71', paddingBottom: '10px' }}>🌲 Random Forest 분석</h2>

            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
                <h4>1. 데이터 파일 업로드 (.csv, .xlsx)</h4>
                <input type="file" onChange={handleFileUpload} accept=".csv, .xlsx" />
                <p style={{ fontSize: '0.8rem', color: '#666' }}>※ 엑셀의 마지막 열을 예측 대상(Label)으로 사용합니다.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#fff', padding: '20px', border: '1px solid #ddd', borderRadius: '10px' }}>
                <h4 style={{ gridColumn: 'span 2' }}>2. 모델 파라미터 튜닝</h4>
                <label>트리 개수 (n_estimators)<br/><input type="number" name="nEstimators" value={params.nEstimators} onChange={handleInputChange} style={{width:'100%'}}/></label>
                <label>최대 깊이 (max_depth)<br/><input type="number" name="maxDepth" value={params.maxDepth} onChange={handleInputChange} style={{width:'100%'}}/></label>
                <label>최소 샘플 분할 (min_split)<br/><input type="number" name="minSamplesSplit" value={params.minSamplesSplit} onChange={handleInputChange} style={{width:'100%'}}/></label>
                <label>불순도 기준 (criterion)<br/>
                    <select name="criterion" value={params.criterion} onChange={handleInputChange} style={{width:'100%', padding:'4px'}}>
                        <option value="gini">Gini (지니 계수)</option>
                        <option value="entropy">Entropy (엔트로피)</option>
                    </select>
                </label>
            </div>

            <button onClick={runRf} disabled={isAnalyzing || !rawJson} style={{ marginTop: '20px', width: '100%', padding: '15px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', cursor: 'pointer' }}>
                {isAnalyzing ? "엔진 가동 중..." : "분석 실행하기"}
            </button>

            {accuracy !== null && (
                <div style={{ marginTop: '20px', padding: '15px', background: '#eaffea', borderRadius: '5px', color: '#27ae60' }}>
                    <strong>분석 성공! 모델 정확도: {(accuracy * 100).toFixed(2)}%</strong>
                </div>
            )}
        </div>
    );
};

export default RfAnalysis;