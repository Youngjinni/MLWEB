import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { BarChart3, BookOpen, Download, FileSpreadsheet, Play, RefreshCw, Server, Settings, UploadCloud, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { API, tokenStorage } from '../api/auth';
import { useNavigate } from 'react-router-dom';

const CONTROLS = [
  { key: 'windowSize',      label: '윈도우 크기',       type: 'number', min: 5,     max: 100, step: 5 },
  { key: 'nEstimators',     label: 'N Estimators',      type: 'number', min: 20,    max: 300, step: 10 },
  { key: 'maxDepth',        label: 'Max Depth',         type: 'number', min: 2,     max: 30,  step: 1 },
  { key: 'minSamplesSplit', label: 'Min Samples Split', type: 'number', min: 2,     max: 20,  step: 1 },
  { key: 'criterion',       label: '지표',               type: 'select', options: ['squared_error', 'absolute_error'] },
  { key: 'learningRate',    label: '학습률 (브라우저)',  type: 'number', min: 0.001, max: 0.2, step: 0.001 },
  { key: 'epochs',          label: 'Epochs (브라우저)', type: 'number', min: 10,    max: 200, step: 10 },
  { key: 'batchSize',       label: '배치 크기',          type: 'number', min: 8,     max: 128, step: 8 },
];

const SAMPLE_ROWS = [
  { date: '2026-05-01', open: '71,200', close: '72,900', volume: '1.8M' },
  { date: '2026-05-02', open: '72,400', close: '73,100', volume: '2.1M' },
  { date: '2026-05-03', open: '73,000', close: '74,600', volume: '1.5M' },
];

const getSubscYn = () => {
  try {
    const token = tokenStorage.getAccess();
    if (!token) return 0;
    return JSON.parse(atob(token.split('.')[1])).subscYn || 0;
  } catch { return 0; }
};

const RfAnalysis = () => {
  const [fileData, setFileData]       = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult]           = useState(null);
  const [progress, setProgress]       = useState(0);
  const [lossData, setLossData]       = useState([]);
  const [chartData, setChartData]     = useState([]);
  const [fileName, setFileName]       = useState(null);
  const [useServer, setUseServer]     = useState(false);
  const inputRef     = useRef(null);
  const navigate     = useNavigate();
  const isSubscribed = getSubscYn() === 1;

  const [params, setParams] = useState({
    windowSize: 10, nEstimators: 100, maxDepth: 10,
    minSamplesSplit: 2, criterion: 'squared_error',
    learningRate: 0.01, epochs: 30, batchSize: 32,
  });
  const handleParamChange = (key, value) => setParams(p => ({ ...p, [key]: value }));

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const values = XLSX.utils.sheet_to_json(ws)
        .map(row => parseFloat(Object.values(row)[0])).filter(v => !isNaN(v));
      setFileData(values);
      alert(`${values.length}개의 데이터를 불러왔습니다.`);
    };
    reader.readAsBinaryString(file);
  };

  const runServerRf = async () => {
    setIsAnalyzing(true); setResult(null); setProgress(0); setLossData([]); setChartData([]);
    try {
      const res = await API.post('/api/ml/rf', {
        data: fileData, window_size: params.windowSize, n_estimators: params.nEstimators,
        max_depth: params.maxDepth, min_samples_split: params.minSamplesSplit, criterion: params.criterion,
      });
      const { predictions, actual, loss_history, final_loss, accuracy } = res.data;
      setLossData(loss_history.map((loss, i) => ({ epoch: i + 1, loss })));
      setChartData(actual.map((a, i) => ({ index: i, 실제값: a, 예측값: predictions[i] })).slice(-50));
      setProgress(100);
      setResult(`서버 RF 분석 완료! (추정 정확도: ${accuracy?.toFixed(2) ?? '—'}%)`);
      await API.post('/api/analysis/rf', {
        ...params, inputDataNm: fileName || 'User_RF',
        accuracy, resultJson: JSON.stringify({ final_loss }),
      });
    } catch (err) {
      if (err.response?.status === 403) { alert('구독자 전용 기능입니다.'); navigate('/payment'); }
      else alert('서버 분석 중 오류가 발생했습니다.');
    } finally { setIsAnalyzing(false); }
  };

  const runBrowserRf = async () => {
    const winSize = parseInt(params.windowSize);
    if (fileData.length < winSize) return alert('데이터가 부족합니다.');
    setIsAnalyzing(true); setResult(null); setProgress(0); setLossData([]); setChartData([]);
    try {
      const maxVal = Math.max(...fileData), minVal = Math.min(...fileData);
      const range = maxVal - minVal || 1;
      const scaled = fileData.map(v => (v - minVal) / range);
      const xs = [], ys = [];
      for (let i = 0; i < scaled.length - winSize; i++) {
        xs.push(scaled.slice(i, i + winSize));
        ys.push(scaled[i + winSize]);
      }
      const tensorXs = window.tf.tensor2d(xs);
      const tensorYs = window.tf.tensor2d(ys, [ys.length, 1]);
      const model = window.tf.sequential();
      model.add(window.tf.layers.dense({
        units: parseInt(params.nEstimators),
        activation: params.criterion === 'squared_error' ? 'relu' : 'tanh',
        inputShape: [winSize],
      }));
      model.add(window.tf.layers.dense({ units: 1 }));
      model.compile({ optimizer: window.tf.train.adam(params.learningRate), loss: 'meanSquaredError' });
      await model.fit(tensorXs, tensorYs, {
        epochs: parseInt(params.epochs), batchSize: parseInt(params.batchSize),
        callbacks: { onEpochEnd: (epoch, logs) => {
          const cur = epoch + 1;
          setProgress(Math.round(cur / params.epochs * 100));
          setLossData(prev => [...prev, { epoch: cur, loss: logs.loss }]);
        }},
      });
      const predScaled   = model.predict(tensorXs).dataSync();
      const predOriginal = Array.from(predScaled).map(v => v * range + minVal);
      const actualOrig   = ys.map(v => v * range + minVal);
      setChartData(actualOrig.map((a, i) => ({
        index: i, 실제값: parseFloat(a.toFixed(2)), 예측값: parseFloat(predOriginal[i].toFixed(2)),
      })).slice(-50));
      const finalLoss = lossData[lossData.length - 1]?.loss || 0;
      const accuracy  = (Math.max(0, 1 - Math.sqrt(finalLoss)) * 100).toFixed(2);
      setResult(`브라우저 RF 분석 완료! (추정 정확도: ${accuracy}%)`);
      await API.post('/api/analysis/rf', {
        ...params, inputDataNm: fileName || 'User_RF',
        accuracy: parseFloat(accuracy), resultJson: JSON.stringify({ status: 'success' }),
      });
      tensorXs.dispose(); tensorYs.dispose(); model.dispose();
    } catch (err) { alert('에러: ' + err.message); }
    finally { setIsAnalyzing(false); }
  };

  const runRf = () => useServer ? runServerRf() : runBrowserRf();

  return (
    <div className="page">
      <div className="shell analysis-layout">
        <div className="analysis-header">
          <div>
            <p className="eyebrow"><BarChart3 size={14} /> 트리 앙상블 기반 예측</p>
            <h1>Random Forest 분석</h1>
          </div>
          <div className="analysis-actions">
            <div className="segmented">
              <button className={!useServer ? 'is-active' : ''} type="button" onClick={() => setUseServer(false)}>브라우저</button>
              <button className={useServer ? 'is-active' : ''} type="button"
                onClick={() => { if (!isSubscribed) { alert('구독자 전용 기능입니다.'); navigate('/payment'); return; } setUseServer(true); }}>
                <Server size={13} style={{ marginRight: 4 }} />서버{!isSubscribed && ' 🔒'}
              </button>
            </div>
            <button className="secondary-button compact" type="button"><Download size={16} /> 내보내기</button>
            <button className="primary-button compact" type="button" onClick={runRf} disabled={isAnalyzing || fileData.length === 0}>
              {isAnalyzing ? <RefreshCw className="spin" size={16} /> : <Play size={16} />}
              {isAnalyzing ? '분석 중' : '분석 실행'}
            </button>
          </div>
        </div>

        {useServer && (
          <div style={{ padding: '10px 16px', background: 'var(--green-light)', borderRadius: 8, fontSize: '.85rem', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Server size={16} /> 서버 자원으로 학습합니다. scikit-learn RandomForestRegressor 사용.
          </div>
        )}

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
              <div className="table-row table-head"><span>Date</span><span>Open</span><span>Close</span><span>Volume</span></div>
              {SAMPLE_ROWS.map(row => (
                <div className="table-row" key={row.date}>
                  <span>{row.date}</span><span>{row.open}</span><span>{row.close}</span><span>{row.volume}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="tool-panel">
            <div className="panel-title"><Settings size={20} /><h2>파라미터</h2></div>
            <div className="control-grid">
              {CONTROLS.map(ctrl => ctrl.type === 'select' ? (
                <label key={ctrl.key} className="param-control">
                  <span>{ctrl.label}</span>
                  <select value={params[ctrl.key]} onChange={e => handleParamChange(ctrl.key, e.target.value)}>
                    {ctrl.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </label>
              ) : (
                <label key={ctrl.key} className="param-control">
                  <span>{ctrl.label}</span>
                  <input type="number" min={ctrl.min} max={ctrl.max} step={ctrl.step}
                    value={params[ctrl.key]} onChange={e => handleParamChange(ctrl.key, parseFloat(e.target.value))} />
                </label>
              ))}
            </div>
          </section>

          <section className="tool-panel">
            <div className="panel-title"><Zap size={20} /><h2>실행 상태</h2></div>
            <div className="progress-head">
              <span>{isAnalyzing ? '실행 중' : result ? '완료' : '대기'}</span>
              <strong>{progress}%</strong>
            </div>
            <div className="progress-track">
              <span style={{ width: `${progress}%`, background: 'var(--green)' }} />
            </div>
            <div className="result-list">
              <div><span>모드</span><strong>{useServer ? '서버' : '브라우저'}</strong></div>
              <div><span>Trees</span><strong>{params.nEstimators}개</strong></div>
              <div><span>Criterion</span><strong>{params.criterion}</strong></div>
            </div>
          </section>
        </div>

        <button className="run-button rf" type="button" onClick={runRf} disabled={isAnalyzing || fileData.length === 0}>
          {isAnalyzing
            ? <><RefreshCw className="spin" size={18} /> {useServer ? '서버 학습 중' : '분석 중'} ({progress}%)</>
            : <><Play size={18} /> {useServer ? '서버 RF 분석' : 'RF 분석 실행'}</>}
        </button>

        <div className="chart-grid">
          <section className="tool-panel">
            <div className="chart-header"><div><h2>Training Loss</h2><span>loss curve</span></div></div>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lossData} margin={{ top: 8, right: 18, bottom: 8, left: 0 }}>
                  <CartesianGrid stroke="#eef1f4" vertical={false} />
                  <XAxis dataKey="epoch" axisLine={false} tickLine={false} tick={{ fill: '#8b95a1', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8b95a1', fontSize: 12 }} width={38} />
                  <Tooltip /><Line type="monotone" dataKey="loss" stroke="#00a66a" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section className="tool-panel">
            <div className="chart-header"><div><h2>Actual vs Prediction</h2><span>actual / prediction</span></div></div>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 18, bottom: 8, left: 0 }}>
                  <CartesianGrid stroke="#eef1f4" vertical={false} />
                  <XAxis dataKey="index" axisLine={false} tickLine={false} tick={{ fill: '#8b95a1', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8b95a1', fontSize: 12 }} width={38} />
                  <Tooltip /><Legend iconType="circle" />
                  <Line type="monotone" dataKey="실제값" stroke="#191f28" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="예측값" stroke="#00a66a" strokeWidth={2.5} dot={false} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {result && <div className="result-banner rf">{result}</div>}

        {/* ── 데이터 가이드 ── */}
        <div className="data-guide">
          <p className="data-guide-title"><BookOpen size={18} color="var(--green)" /> Random Forest에 적합한 데이터 가이드</p>
          <div className="guide-blocks">
            <div className="guide-block">
              <h4>✅ 적합한 데이터</h4>
              <ul>
                <li><strong>부동산 가격</strong> — 면적, 층수, 지역 등 다변수</li>
                <li><strong>매출 예측</strong> — 마케팅비, 계절성 등 포함</li>
                <li><strong>품질 분류</strong> — 제조 공정 측정값</li>
                <li><strong>이상 감지</strong> — 정상 vs 비정상 패턴</li>
                <li><strong>비선형 패턴</strong> — 복잡한 변수 관계</li>
              </ul>
            </div>
            <div className="guide-block">
              <h4>⚙️ LSTM과의 차이</h4>
              <ul>
                <li>시간 순서보다 <strong>변수 간 관계</strong>에 강함</li>
                <li><strong>노이즈에 강하고</strong> 과적합이 적음</li>
                <li>학습 속도가 빠르고 <strong>해석이 용이</strong></li>
                <li>서버 모드는 진짜 RF, 브라우저는 <strong>Dense 신경망으로 근사</strong></li>
                <li>대용량 처리 시 <strong>서버 모드 권장</strong></li>
              </ul>
            </div>
          </div>
          <div className="data-format-box">
            <span className="comment"># 예시 CSV 형식 (첫 번째 열 값만 사용)</span>{'\n'}
            price{'\n'}
            <span className="value">350000{'\n'}
            412000{'\n'}
            388000</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RfAnalysis;
