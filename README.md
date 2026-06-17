# ML Web

LSTM이랑 Random Forest로 시계열/회귀 예측을 웹에서 바로 돌려볼 수 있게 만든 서비스입니다. 비구독자는 브라우저(TensorFlow.js)로, 구독자는 서버 자원으로 분석을 실행합니다.

Spring Boot MSA로 백엔드를 나눠서 작업해봤고, 결제는 토스페이먼츠 빌링키 방식으로 매월 자동결제가 되도록 구현했습니다.

## 왜 만들었나

ML 분석을 해보려면 보통 Python 환경 세팅하고, 라이브러리 깔고, 코드 짜는 과정이 필요한데 그게 생각보다 진입장벽이 높다고 느꼈습니다. 그래서 그냥 CSV 파일 하나 올리면 바로 LSTM이든 RF든 돌려볼 수 있는 웹 서비스를 만들어보고 싶었습니다.

구독 모델을 넣은 건 단순 토이 프로젝트로 끝내지 않고 실제 SaaS처럼 결제/구독 로직까지 한번 다뤄보고 싶어서였습니다.

## 스크린샷

 - 초기 테스트 화면
<img width="1887" height="367" alt="스크린샷 2026-05-11 180035" src="https://github.com/user-attachments/assets/7d943006-457d-4cfd-9383-6c63cf40a56e" />

 - 메인 화면
<img width="1140" height="538" alt="스크린샷 2026-06-14 213327" src="https://github.com/user-attachments/assets/dbcddad8-503f-4b21-bcc6-046facca22c8" />
 - 분석 화면
<img width="1161" height="739" alt="스크린샷 2026-04-30 163114" src="https://github.com/user-attachments/assets/d0456e45-7c4f-48cb-afd0-fab05d5e327a" />

## 기술 스택

**Frontend**
- React 19, React Router
- TensorFlow.js (브라우저에서 직접 LSTM/RF 학습)
- Recharts, axios

**Backend**
- Spring Boot 3.4 / Java 21
- Spring Cloud Gateway
- Spring Security, JWT (JJWT)
- Python FastAPI (서버사이드 ML 연산)

**Infra**
- Oracle XE 21c
- Redis (Refresh Token 저장)
- Docker / Docker Compose
- AWS EC2

**결제**
- Toss Payments 빌링 API

## 구조

마이크로서비스로 나눴습니다. 처음엔 모놀리식으로 가려다가 머신러닝은 분석에 시간이 오래 걸리니, 다른 서비스에서 장애가 나더라도 지속적으로 서비스할 수 있도록 하기 위해 계획을 변경했습니다.

```
사용자 → nginx(80) → Gateway(8080) → 각 서비스
                                        ├── authservice (8081)
                                        ├── communityservice (8082)
                                        ├── lstmanalysis (8083)
                                        ├── rfanalysis (8084)
                                        ├── mlservice (8085, Python)
                                        └── paymentservice (8086)
```

DB랑 Redis는 Docker 내부 네트워크에서만 접근 가능하게 막아놨습니다.

## 주요 기능

- LSTM / Random Forest 분석 (브라우저 모드, 서버 모드 둘 다 지원)
- 분석 결과 Train/Test Split 해서 검증 세트 기준으로 RMSE, MAE, 방향 정확도까지 같이 보여줌
- JWT Access/Refresh Token 구조, Refresh Token은 Redis에서 관리하고 Rotation 적용
- 토스페이먼츠 빌링키 발급 → 매월 1일 자동결제 스케줄러
- 커뮤니티 게시판 (분석 결과 공유용으로 생각하고 만들었습니다)

## 설계하면서 고민했던 부분들

**FK를 안 건 이유**

Oracle에서 FK를 걸면 부모 레코드 변경 시 자식 테이블까지 락이 전파되는 문제가 있어서, 동시 요청이 많아지면 데드락 위험이 커진다고 판단했습니다. 그래서 참조 무결성은 애플리케이션 레이어에서 처리하고 DB 레벨 FK는 안 걸었습니다.

**PK는 currentTimeMillis()로**

지금은 `System.currentTimeMillis()`로 PK를 생성하고 있는데, 동시 요청 시 중복 가능성이 있다는 걸 알고 있습니다. Oracle SEQUENCE로 바꾸는 걸 다음 작업으로 남겨뒀습니다.

**Refresh Token을 왜 Redis에**

처음엔 DB 테이블(`ML_USER_TOKEN`)에 저장하려고 했는데, TTL 만료 처리를 위해 별도 스케줄러를 돌려야 하는 게 비효율적이라고 느꼼. Redis는 키에 TTL을 걸어두면 자동으로 만료/삭제되니까 이쪽으로 바꿨습니다. (테이블은 코드에 흔적이 남아있는데 지금은 안 쓰입니다)

**브라우저 모드 RF는 진짜 RF가 아님**

서버 모드는 scikit-learn으로 실제 RandomForestRegressor를 돌리지만, 브라우저는 TensorFlow.js만 쓸 수 있어서 Dense 신경망으로 비슷하게 근사했습니다. 엄밀하게는 RF가 아니라서 이 부분은 README에도 명시해두는 게 맞다고 생각했습니다.

## 로컬 실행

```bash
git clone https://github.com/Youngjinni/MLWEB.git
cd MLWEB

# .env 파일 생성 (.env.example 참고)
cp .env.example .env

docker compose up --build -d
```

Oracle XE가 초기 기동에 시간이 좀 걸립니다 (2~3분 정도). `docker compose ps`로 전체 컨테이너 Up 상태 확인하면 됩니다.

## 아직 안 한 것들

- [ ] HTTPS 적용
- [ ] PK SEQUENCE로 교체
- [ ] Rate Limiting (로그인 brute force 방어 X)
- [ ] LSTM/RF 입력을 다변수로 확장 (지금은 종가 한 열만 받음)
- [ ] 커뮤니티에서 좋아요가 중복으로 눌리는 현상 제거
## 회고

MSA로 쪼개놓고 보니 서비스 간 JWT 검증 로직이 중복되는 게 마음에 좀 걸렸습니다. commonmodule로 공유는 했지만, 다음엔 인증을 Gateway 레벨에서 한 번에 처리하는 구조도 고민해볼 것 같습니다.

토스 결제 연동은 처음 해봤는데 빌링키 발급/자동결제 흐름 자체는 문서가 잘 되어 있어서 생각보다 어렵지 않았습니다. 다만 결제 실패 케이스(카드 한도, 만료 등)를 다양하게 테스트해보진 못한 게 아쉬운 부분입니다.

## 조원
김영진(백엔드 및 데이터베이스, 팀장), 조병현(프론트엔드), 최지은(기획 및 디자인)
