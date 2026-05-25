import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Activity, Download, FileSpreadsheet, Play, RefreshCw, Settings, UploadCloud, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { API } from '../api/auth';

const CONTROLS = [
  { key: 'windowSize',   label: 'Window Size',  type: 'number', min: 5,      max: 90,   step: 5 },
  { key: 'neurons',      label: 'Neurons',       type: 'number', min: 16,     max: 256,  step: 16 },
  { key: 'epochs',       label: 'Epochs',        type: 'number', min: 10,     max: 200,  step: 10 },
  { key: 'batchSize',    label: 'Batch Size',    type: 'number', min: 8,      max: 128,  step: 8 },
  { key: 'learningRate', label: 'Learning Rate', type: 'number', min: 0.0001, max: 0.02, step: 0.0001 },
  { key: 'optimizer',    label: 'Optimizer',     type: 'select', options: ['Adam', 'SGD'] },
];

const SAMPLE_ROWS = [
  { date: '2026-05-01', open: '71,200', close: '72,900', volume: '1.8M' },
  { date: '2026-05-02', open: '72,400', close: '73,100', volume: '2.1M' },
  { date: '2026-05-03', open: '73,000', close: '74,600', volume: '1.5M' },
];

const LstmAnalysis = () => {
  const [fileData, setFileData]       = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult]           = useState(null);
  const [progress, setProgress]       = useState(0);
  const [lossData, setLossData]       = useState([]);
  const [chartData, setChartData]     = useState([]);
  const [fileName, setFileName]       = useState(null);
  const inputRef = useRef(null);

  const [params, setParams] = useState({
    windowSize: 10, neurons: 64, epochs: 50,
    batchSize: 32, learningRate: 0.001, optimizer: 'Adam',
  });

  const handleParamChange = (key, value) => setParams((prev) => ({ ...prev, [key]: value }));

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const values = XLSX.utils.sheet_to_json(ws)
        .map((row) => parseFloat(Object.values(row)[0]))
        .filter((v) => !isNaN(v));
      setFileData(values);
      alert(`${values.length}개의 데이터를 불러왔습니다.`);
    };
    reader.readAsBinaryString(file);
  };

  const runLstm = async () => {
    const winSize = parseInt(params.windowSize);
    if (fileData.length < winSize) return alert('데이터가 부족합니다.');

    setIsAnalyzing(true);
    setResult(null);
    setProgress(0);
    setLossData([]);
    setChartData([]);

    try {
      const xs = [], ys = [];
      for (let i = 0; i < fileData.length - winSize; i++) {
        xs.push(fileData.slice(i, i + winSize).map((v) => [v]));
        ys.push(fileData[i + winSize]);
      }
      const tensorXs = window.tf.tensor3d(xs);
      const tensorYs = window.tf.tensor2d(ys, [ys.length, 1]);

      const model = window.tf.sequential();
      model.add(window.tf.layers.lstm({ units: parseInt(params.neurons), inputShape: [winSize, 1], kernelInitializer: 'glorotUniform' }));
      model.add(window.tf.layers.dense({ units: 1 }));
      model.compile({ optimizer: window.tf.train.adam(parseFloat(params.learningRate)), loss: 'meanSquaredError' });

      await model.fit(tensorXs, tensorYs, {
        epochs: parseInt(params.epochs),
        batchSize: parseInt(params.batchSize),
        verbose: 0,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            const cur = epoch + 1;
            setProgress(Math.round((cur / params.epochs) * 100));
            setLossData((prev) => [...prev, { epoch: cur, loss: parseFloat(logs.loss.toFixed(6)) }]);
          },
        },
      });

      const predictions = model.predict(tensorXs).dataSync();
      setChartData(ys.map((actual, i) => ({ index: i, 실제값: actual, 예측값: predictions[i] })).slice(-50));
      setResult('LSTM 분석 및 학습 완료!');

      await API.post('/api/analysis/lstm', {
        ...params,
        inputDataNm: 'User_LSTM_Analysis',
        resultJson: JSON.stringify({ status: 'success' }),
      });

      tensorXs.dispose(); tensorYs.dispose(); model.dispose();
    } catch (err) {
      console.error(err);
      alert('에러 발생: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="page">
      <div className="shell analysis-layout">
        <div className="analysis-header">
          <div>
            <p className="eyebrow"><Activity size={14} /> Window 기반 딥러닝 예측</p>
            <h1>LSTM 시계열 분석</h1>
          </div>
          <div className="analysis-actions">
            <button className="secondary-button compact" type="button"><Download size={16} /> 내보내기</button>
            <button className="primary-button compact" type="button" onClick={runLstm} disabled={isAnalyzing || fileData.length === 0}>
              {isAnalyzing ? <RefreshCw className="spin" size={16} /> : <Play size={16} />}
              {isAnalyzing ? '분석 중' : '분석 실행'}
            </button>
          </div>
        </div>

        <div className="analysis-grid">
          <section className="tool-panel">
            <div className="panel-title"><UploadCloud size={20} /><h2>CSV 데이터</h2></div>
            <input ref={inputRef} className="visually-hidden" type="file" accept=".csv,.xlsx" onChange={handleFileUpload} />
            <button className="file-drop" type="button" onClick={() => inputRef.current?.click()}>
              <FileSpreadsheet size={28} />
              <span>{fileName || '파일을 선택하세요'}</span>
              <strong>CSV / XLSX 선택</strong>
            </button>
            <div className="data-table">
              <div className="table-row table-head">
                <span>Date</span><span>Open</span><span>Close</span><span>Volume</span>
              </div>
              {SAMPLE_ROWS.map((row) => (
                <div className="table-row" key={row.date}>
                  <span>{row.date}</span><span>{row.open}</span><span>{row.close}</span><span>{row.volume}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="tool-panel">
            <div className="panel-title"><Settings size={20} /><h2>파라미터</h2></div>
            <div className="control-grid">
              {CONTROLS.map((ctrl) =>
                ctrl.type === 'select' ? (
                  <label key={ctrl.key} className="param-control">
                    <span>{ctrl.label}</span>
                    <select value={params[ctrl.key]} onChange={(e) => handleParamChange(ctrl.key, e.target.value)}>
                      {ctrl.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </label>
                ) : (
                  <label key={ctrl.key} className="param-control">
                    <span>{ctrl.label}</span>
                    <input type="number" min={ctrl.min} max={ctrl.max} step={ctrl.step}
                      value={params[ctrl.key]} onChange={(e) => handleParamChange(ctrl.key, parseFloat(e.target.value))} />
                  </label>
                )
              )}
            </div>
          </section>

          <section className="tool-panel">
            <div className="panel-title"><Zap size={20} /><h2>실행 상태</h2></div>
            <div className="progress-head">
              <span>{isAnalyzing ? '실행 중' : result ? '완료' : '대기'}</span>
              <strong>{progress}%</strong>
            </div>
            <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
            <div className="result-list">
              <div><span>Window</span><strong>{params.windowSize}일</strong></div>
              <div><span>Optimizer</span><strong>{params.optimizer}</strong></div>
              <div><span>Epochs</span><strong>{params.epochs}</strong></div>
            </div>
          </section>
        </div>

        <button className="run-button" type="button" onClick={runLstm} disabled={isAnalyzing || fileData.length === 0}>
          {isAnalyzing ? <><RefreshCw className="spin" size={18} /> 모델 학습 중... ({progress}%)</> : <><Play size={18} /> LSTM 분석 실행</>}
        </button>

        <div className="chart-grid">
          <section className="tool-panel">
            <div className="chart-header">
              <div><h2>Training Loss</h2><span>loss curve</span></div>
              <span className="status-badge blue"><Activity size={13} /> Live</span>
            </div>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lossData} margin={{ top: 8, right: 18, bottom: 8, left: 0 }}>
                  <CartesianGrid stroke="#eef1f4" vertical={false} />
                  <XAxis dataKey="epoch" axisLine={false} tickLine={false} tick={{ fill: '#8b95a1', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8b95a1', fontSize: 12 }} width={38} />
                  <Tooltip /><Line type="monotone" dataKey="loss" stroke="#3182f6" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section className="tool-panel">
            <div className="chart-header">
              <div><h2>Actual vs Prediction</h2><span>actual / prediction</span></div>
              <span className="status-badge blue"><Activity size={13} /> Live</span>
            </div>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 18, bottom: 8, left: 0 }}>
                  <CartesianGrid stroke="#eef1f4" vertical={false} />
                  <XAxis dataKey="index" axisLine={false} tickLine={false} tick={{ fill: '#8b95a1', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8b95a1', fontSize: 12 }} width={38} />
                  <Tooltip /><Legend iconType="circle" />
                  <Line type="monotone" dataKey="실제값" stroke="#191f28" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="예측값" stroke="#3182f6" strokeWidth={2.5} dot={false} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {result && <div className="result-banner success">{result}</div>}
      </div>
    </div>
  );
};

export default LstmAnalysis;
