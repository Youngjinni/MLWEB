import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Activity, BookOpen, Download, FileSpreadsheet, Play, RefreshCw, Server, Settings, UploadCloud, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { API, tokenStorage } from '../api/auth';
import { useNavigate } from 'react-router-dom';

const CONTROLS = [
  { key: 'windowSize',   label: 'Window Size',  type: 'number', min: 5,      max: 90,   step: 5 },
  { key: 'neurons',      label: 'Neurons',       type: 'number', min: 16,     max: 256,  step: 16 },
  { key: 'epochs',       label: 'Epochs',        type: 'number', min: 10,     max: 200,  step: 10 },
  { key: 'batchSize',    label: 'Batch Size',    type: 'number', min: 8,      max: 128,  step: 8 },
  { key: 'learningRate', label: 'Learning Rate', type: 'number', min: 0.0001, max: 0.02, step: 0.0001 },
  { key: 'optimizer',    label: 'Optimizer',     type: 'select', options: ['adam', 'sgd'] },
  { key: 'testRatio',    label: '검증 세트 비율', type: 'number', min: 0.1,    max: 0.4,  step: 0.05 },
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

const MetricCard = ({ label, value, sub, color }) => (
  <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 18px' }}>
    <div style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: color || 'var(--dark)', lineHeight: 1.2 }}>{value}</div>
    {sub && <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 3 }}>{sub}</div>}
  </div>
);

const LstmAnalysis = () => {
  const [fileData, setFileData]       = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult]           = useState(null);
  const [progress, setProgress]       = useState(0);
  const [lossData, setLossData]       = useState([]);
  const [trainChart, setTrainChart]   = useState([]);
  const [testChart, setTestChart]     = useState([]);
  const [metrics, setMetrics]         = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [fileName, setFileName]       = useState(null);
  const [useServer, setUseServer]     = useState(false);
  const [predPage, setPredPage]       = useState(0);
  const inputRef     = useRef(null);
  const navigate     = useNavigate();
  const isSubscribed = getSubscYn() === 1;
  const PRED_PAGE_SIZE = 20;

  const [params, setParams] = useState({
    windowSize: 10, neurons: 64, epochs: 50,
    batchSize: 32, learningRate: 0.001, optimizer: 'adam', testRatio: 0.2,
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

  // ── 서버 분석 ──
  const runServerLstm = async () => {
    setIsAnalyzing(true); setResult(null); setProgress(0);
    setLossData([]); setTrainChart([]); setTestChart([]); setMetrics(null); setPredictions([]);
    try {
      setProgress(10);
      const res = await API.post('/api/ml/lstm', {
        data: fileData, window_size: params.windowSize, neurons: params.neurons,
        epochs: params.epochs, batch_size: params.batchSize,
        learning_rate: params.learningRate, optimizer: params.optimizer,
        test_ratio: params.testRatio,
      });
      const d = res.data;
      setLossData(d.train_loss_history.map((loss, i) => ({ epoch: i + 1, loss })));
      setTrainChart(d.train_chart);
      setTestChart(d.test_chart);
      setPredictions(d.test_predictions);
      setMetrics({
        mse: d.test_mse, mae: d.test_mae, rmse: d.test_rmse,
        dirAcc: d.direction_accuracy, accuracy: d.accuracy,
        trainSize: d.train_chart.length, testSize: d.test_chart.length,
      });
      setProgress(100);
      setResult(`서버 LSTM 완료`);
      await API.post('/api/analysis/lstm', {
        ...params, inputDataNm: fileName || 'User_LSTM',
        resultJson: JSON.stringify({ test_mse: d.test_mse, direction_accuracy: d.direction_accuracy }),
      });
    } catch (err) {
      if (err.response?.status === 403) { alert('구독자 전용 기능입니다.'); navigate('/payment'); }
      else alert('서버 분석 중 오류가 발생했습니다.');
    } finally { setIsAnalyzing(false); }
  };

  // ── 브라우저 분석 (train/test split 추가) ──
  const runBrowserLstm = async () => {
    const winSize = parseInt(params.windowSize);
    if (fileData.length < winSize + 10) return alert('데이터가 부족합니다.');
    setIsAnalyzing(true); setResult(null); setProgress(0);
    setLossData([]); setTrainChart([]); setTestChart([]); setMetrics(null); setPredictions([]);
    try {
      const xs = [], ys = [];
      for (let i = 0; i < fileData.length - winSize; i++) {
        xs.push(fileData.slice(i, i + winSize).map(v => [v]));
        ys.push(fileData[i + winSize]);
      }
      const split = Math.floor(xs.length * (1 - params.testRatio));
      const X_train = xs.slice(0, split), X_test = xs.slice(split);
      const y_train = ys.slice(0, split), y_test = ys.slice(split);

      const tensorXtr = window.tf.tensor3d(X_train);
      const tensorYtr = window.tf.tensor2d(y_train, [y_train.length, 1]);

      const model = window.tf.sequential();
      model.add(window.tf.layers.lstm({ units: parseInt(params.neurons), inputShape: [winSize, 1] }));
      model.add(window.tf.layers.dense({ units: 1 }));
      model.compile({ optimizer: window.tf.train.adam(parseFloat(params.learningRate)), loss: 'meanSquaredError' });

      await model.fit(tensorXtr, tensorYtr, {
        epochs: parseInt(params.epochs), batchSize: parseInt(params.batchSize), verbose: 0,
        callbacks: { onEpochEnd: (epoch, logs) => {
          const cur = epoch + 1;
          setProgress(Math.round(cur / params.epochs * 90));
          setLossData(prev => [...prev, { epoch: cur, loss: parseFloat(logs.loss.toFixed(6)) }]);
        }},
      });

      // 학습 세트 예측
      const trainPreds = model.predict(tensorXtr).dataSync();
      setTrainChart(y_train.map((a, i) => ({ index: i, 실제값: parseFloat(a.toFixed(2)), 예측값: parseFloat(trainPreds[i].toFixed(2)) })));

      // 검증 세트 예측
      const tensorXte = window.tf.tensor3d(X_test);
      const testPreds = model.predict(tensorXte).dataSync();

      const testRows = y_test.map((actual, i) => {
        const predicted = parseFloat(testPreds[i].toFixed(2));
        const act = parseFloat(actual.toFixed(2));
        const diff = parseFloat((predicted - act).toFixed(2));
        const diff_pct = parseFloat((Math.abs(diff) / (Math.abs(act) + 1e-9) * 100).toFixed(2));
        const direction_ok = i > 0 ? (y_test[i] > y_test[i-1]) === (testPreds[i] > testPreds[i-1]) : false;
        return { index: split + i, actual: act, predicted, diff, diff_pct, direction_ok };
      });

      setTestChart(y_test.map((a, i) => ({ index: split + i, 실제값: parseFloat(a.toFixed(2)), 예측값: parseFloat(testPreds[i].toFixed(2)) })));
      setPredictions(testRows);

      // 지표 계산
      const mse  = testRows.reduce((s, r) => s + r.diff ** 2, 0) / testRows.length;
      const mae  = testRows.reduce((s, r) => s + Math.abs(r.diff), 0) / testRows.length;
      const rmse = Math.sqrt(mse);
      const dirAcc = testRows.filter((r, i) => i > 0 && r.direction_ok).length / (testRows.length - 1) * 100;
      const dRange = Math.max(...fileData) - Math.min(...fileData) + 1e-9;
      const accuracy = Math.max(0, 1 - rmse / dRange) * 100;

      setMetrics({
        mse: parseFloat(mse.toFixed(6)), mae: parseFloat(mae.toFixed(4)),
        rmse: parseFloat(rmse.toFixed(4)), dirAcc: parseFloat(dirAcc.toFixed(2)),
        accuracy: parseFloat(accuracy.toFixed(2)),
        trainSize: split, testSize: testRows.length,
      });
      setProgress(100);
      setResult('브라우저 LSTM 완료');

      await API.post('/api/analysis/lstm', {
        ...params, inputDataNm: fileName || 'User_LSTM',
        resultJson: JSON.stringify({ test_mse: mse, direction_accuracy: dirAcc }),
      });
      tensorXtr.dispose(); tensorYtr.dispose(); tensorXte.dispose(); model.dispose();
    } catch (err) { alert('에러: ' + err.message); }
    finally { setIsAnalyzing(false); }
  };

  const runLstm = () => useServer ? runServerLstm() : runBrowserLstm();
  const pagedPreds = predictions.slice(predPage * PRED_PAGE_SIZE, (predPage + 1) * PRED_PAGE_SIZE);
  const totalPages = Math.ceil(predictions.length / PRED_PAGE_SIZE);

  return (
    <div className="page">
      <div className="shell analysis-layout">

        {/* 헤더 */}
        <div className="analysis-header">
          <div>
            <p className="eyebrow"><Activity size={14} /> Window 기반 딥러닝 예측</p>
            <h1>LSTM 시계열 분석</h1>
          </div>
          <div className="analysis-actions">
            <div className="segmented">
              <button className={!useServer ? 'is-active' : ''} type="button" onClick={() => setUseServer(false)}>브라우저</button>
              <button className={useServer ? 'is-active' : ''} type="button"
                onClick={() => { if (!isSubscribed) { alert('구독자 전용 기능입니다.'); navigate('/payment'); return; } setUseServer(true); }}>
                <Server size={13} style={{ marginRight: 4 }} />서버{!isSubscribed && ' 🔒'}
              </button>
            </div>
            <button className="primary-button compact" type="button" onClick={runLstm} disabled={isAnalyzing || fileData.length === 0}>
              {isAnalyzing ? <RefreshCw className="spin" size={16} /> : <Play size={16} />}
              {isAnalyzing ? '분석 중' : '분석 실행'}
            </button>
          </div>
        </div>

        {useServer && (
          <div style={{ padding: '10px 16px', background: 'var(--blue-light)', borderRadius: 8, fontSize: '.85rem', color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Server size={16} /> 서버 자원으로 학습합니다.
          </div>
        )}

        {/* 파라미터 / 업로드 / 상태 */}
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
            <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
            <div className="result-list">
              <div><span>모드</span><strong>{useServer ? '서버' : '브라우저'}</strong></div>
              <div><span>학습 / 검증</span><strong>{Math.round((1 - params.testRatio) * 100)}% / {Math.round(params.testRatio * 100)}%</strong></div>
              <div><span>Epochs</span><strong>{params.epochs}</strong></div>
            </div>
          </section>
        </div>

        {/* 실행 버튼 */}
        <button className="run-button" type="button" onClick={runLstm} disabled={isAnalyzing || fileData.length === 0}>
          {isAnalyzing
            ? <><RefreshCw className="spin" size={18} /> 학습 중... ({progress}%)</>
            : <><Play size={18} /> {useServer ? '서버 LSTM 분석' : 'LSTM 분석 실행'}</>}
        </button>

        {/* ── 결과 섹션 ── */}
        {metrics && (
          <>
            {/* 지표 카드 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
              <MetricCard label="방향 정확도" value={`${metrics.dirAcc}%`}
                sub="상승/하락 방향 일치율" color={metrics.dirAcc >= 55 ? 'var(--green)' : metrics.dirAcc >= 45 ? 'var(--blue)' : 'var(--red)'} />
              <MetricCard label="추정 정확도" value={`${metrics.accuracy}%`} sub="1 - RMSE/Range" />
              <MetricCard label="RMSE" value={metrics.rmse} sub="루트 평균제곱오차" />
              <MetricCard label="MAE" value={metrics.mae} sub="평균절대오차" />
              <MetricCard label="학습 / 검증" value={`${metrics.trainSize} / ${metrics.testSize}`} sub="샘플 수" color="var(--muted)" />
            </div>

            {/* 차트 */}
            <div className="chart-grid">
              <section className="tool-panel">
                <div className="chart-header">
                  <div><h2>Training Loss</h2><span>학습 세트 오차 곡선</span></div>
                  <span className="status-badge blue"><Activity size={13} /> Train</span>
                </div>
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lossData} margin={{ top: 8, right: 18, bottom: 8, left: 0 }}>
                      <CartesianGrid stroke="#eef1f4" vertical={false} />
                      <XAxis dataKey="epoch" axisLine={false} tickLine={false} tick={{ fill: '#8b95a1', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8b95a1', fontSize: 12 }} width={38} />
                      <Tooltip />
                      <Line type="monotone" dataKey="loss" stroke="#3182f6" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="tool-panel">
                <div className="chart-header">
                  <div><h2>검증 세트 예측</h2><span>모델이 본 적 없는 데이터</span></div>
                  <span className="status-badge success">Test</span>
                </div>
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={testChart} margin={{ top: 8, right: 18, bottom: 8, left: 0 }}>
                      <CartesianGrid stroke="#eef1f4" vertical={false} />
                      <XAxis dataKey="index" axisLine={false} tickLine={false} tick={{ fill: '#8b95a1', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8b95a1', fontSize: 12 }} width={50} />
                      <Tooltip />
                      <Legend iconType="circle" />
                      <Line type="monotone" dataKey="실제값" stroke="#191f28" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="예측값" stroke="#3182f6" strokeWidth={2.5} dot={false} strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>

            {/* 정확한 예측값 테이블 */}
            <section className="tool-panel">
              <div className="panel-title" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <Activity size={20} />
                  <h2>검증 세트 상세 예측값</h2>
                  <span style={{ fontSize: '.8rem', color: 'var(--muted)', fontWeight: 400 }}>총 {predictions.length}개</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button className="secondary-button compact" onClick={() => setPredPage(p => Math.max(0, p-1))} disabled={predPage === 0}>이전</button>
                  <span style={{ fontSize: '.85rem', color: 'var(--muted)' }}>{predPage + 1} / {totalPages}</span>
                  <button className="secondary-button compact" onClick={() => setPredPage(p => Math.min(totalPages-1, p+1))} disabled={predPage >= totalPages-1}>다음</button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg)', borderBottom: '2px solid var(--border)' }}>
                      {['인덱스', '실제값', '예측값', '오차', '오차율', '방향'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--muted)', fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedPreds.map((row) => (
                      <tr key={row.index} style={{ borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td style={{ padding: '10px 14px', color: 'var(--muted)', fontFamily: 'monospace' }}>#{row.index}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--dark)' }}>{row.actual.toLocaleString()}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--blue)' }}>{row.predicted.toLocaleString()}</td>
                        <td style={{ padding: '10px 14px', color: row.diff > 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                          {row.diff > 0 ? '+' : ''}{row.diff.toLocaleString()}
                        </td>
                        <td style={{ padding: '10px 14px', color: 'var(--muted)' }}>{row.diff_pct}%</td>
                        <td style={{ padding: '10px 14px' }}>
                          {row.index === predictions[0]?.index ? (
                            <span style={{ color: 'var(--muted)', fontSize: '.78rem' }}>—</span>
                          ) : (
                            <span style={{ fontWeight: 700, color: row.direction_ok ? 'var(--green)' : 'var(--red)' }}>
                              {row.direction_ok ? '✓ 일치' : '✗ 불일치'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="result-banner success">{result} — 방향 정확도 {metrics.dirAcc}% / RMSE {metrics.rmse}</div>
          </>
        )}

        {/* 데이터 가이드 */}
        <div className="data-guide">
          <p className="data-guide-title"><BookOpen size={18} color="var(--blue)" /> LSTM에 적합한 데이터 가이드</p>
          <div className="guide-blocks">
            <div className="guide-block">
              <h4>✅ 적합한 데이터</h4>
              <ul>
                <li><strong>주가 / 코인 가격</strong> — 종가, 시가, 거래량</li>
                <li><strong>기상 데이터</strong> — 일별 기온, 강수량</li>
                <li><strong>수요 예측</strong> — 전력 소비량, 판매량</li>
                <li><strong>센서 데이터</strong> — 진동, 압력 등 연속 측정값</li>
              </ul>
            </div>
            <div className="guide-block">
              <h4>📊 결과 해석</h4>
              <ul>
                <li><strong>방향 정확도 55% 이상</strong>이면 의미 있는 수준</li>
                <li>RMSE는 낮을수록 예측이 정확</li>
                <li>검증 세트는 학습에 사용되지 않은 데이터</li>
                <li>학습 Loss가 수렴하지 않으면 epochs 늘리기</li>
              </ul>
            </div>
          </div>
          <div className="data-format-box">
            <span className="comment"># 예시 CSV (첫 번째 열 숫자만 사용)</span>{'\n'}
            date,close{'\n'}
            <span className="value">2026-01-01,72400{'\n'}2026-01-02,73100{'\n'}2026-01-03,71800</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LstmAnalysis;
