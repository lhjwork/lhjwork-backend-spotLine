# Implementation Plan: Spotline Admin Dashboard

## Overview

이 구현 계획은 React + Vite 기반의 어드민 대시보드와 기존 Node.js/Express 백엔드에 어드민 API를 추가하는 작업을 단계별로 진행합니다. 프론트엔드와 백엔드를 병렬로 개발하여 효율성을 높이고, 각 단계에서 테스트를 통해 품질을 보장합니다.

## Tasks

- [ ] 1. 백엔드 어드민 API 기반 구조 설정
  - 어드민 라우트 디렉토리 구조 생성
  - 어드민 인증 미들웨어 구현
  - 기본 어드민 라우터 설정
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [ ]* 1.1 어드민 인증 속성 테스트 작성
  - **Property 1: Valid credential authentication**
  - **Property 2: Invalid credential rejection**
  - **Property 4: Logout session cleanup**
  - **Validates: Requirements 1.1, 1.2, 1.5**

- [ ] 2. 어드민 인증 시스템 구현
  - [ ] 2.1 어드민 사용자 모델 및 시드 데이터 생성
    - AdminUser 모델 정의
    - 기본 어드민 계정 시드 스크립트 작성
    - _Requirements: 1.1_

  - [ ] 2.2 JWT 기반 어드민 인증 API 구현
    - 로그인 엔드포인트 (/api/admin/auth/login)
    - 토큰 갱신 엔드포인트 (/api/admin/auth/refresh)
    - 로그아웃 엔드포인트 (/api/admin/auth/logout)
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

  - [ ]* 2.3 인증 시스템 단위 테스트 작성
    - 로그인 성공/실패 케이스 테스트
    - 토큰 검증 및 갱신 테스트
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 3. 어드민 매장 관리 API 구현
  - [ ] 3.1 어드민 매장 CRUD API 구현
    - GET /api/admin/stores (목록, 검색, 필터링)
    - POST /api/admin/stores (생성)
    - PUT /api/admin/stores/:id (수정)
    - DELETE /api/admin/stores/:id (소프트 삭제)
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [ ]* 3.2 매장 관리 속성 테스트 작성
    - **Property 5: Store creation validation**
    - **Property 6: Store update history preservation**
    - **Property 7: Store search filtering**
    - **Property 9: Store soft deletion**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.5**

  - [ ] 3.3 이미지 업로드 및 QR 코드 생성 API 구현
    - POST /api/admin/stores/:id/images (이미지 업로드)
    - POST /api/admin/stores/:id/qr/regenerate (QR 코드 재생성)
    - GET /api/admin/qr/:id/download (QR 코드 다운로드)
    - _Requirements: 2.6, 2.7, 5.1, 5.2, 5.3_

  - [ ]* 3.4 QR 코드 관리 속성 테스트 작성
    - **Property 10: Image upload validation**
    - **Property 11: QR code uniqueness**
    - **Property 21: QR code generation uniqueness**
    - **Property 22: QR code regeneration**
    - **Validates: Requirements 2.6, 2.7, 5.1, 5.2**

- [ ] 4. 어드민 추천 관리 API 구현
  - [ ] 4.1 추천 관리 CRUD API 구현
    - GET /api/admin/recommendations (목록 조회)
    - POST /api/admin/recommendations (추천 생성)
    - PUT /api/admin/recommendations/:id (추천 수정)
    - DELETE /api/admin/recommendations/:id (추천 삭제)
    - _Requirements: 3.1, 3.2, 3.5, 3.6_

  - [ ]* 4.2 추천 관리 속성 테스트 작성
    - **Property 12: Recommendation store validation**
    - **Property 13: Priority value validation**
    - **Property 16: Recommendation deletion**
    - **Property 17: Duplicate recommendation prevention**
    - **Validates: Requirements 3.1, 3.2, 3.5, 3.6**

  - [ ] 4.3 추천 거리 계산 및 정렬 기능 구현
    - 매장 간 거리 및 도보 시간 자동 계산
    - 우선순위별 추천 정렬 로직
    - _Requirements: 3.3, 3.4_

  - [ ]* 4.4 추천 계산 속성 테스트 작성
    - **Property 14: Distance calculation consistency**
    - **Property 15: Recommendation priority sorting**
    - **Validates: Requirements 3.3, 3.4**

- [ ] 5. 어드민 분석 API 구현
  - [ ] 5.1 분석 데이터 조회 API 구현
    - GET /api/admin/analytics/overview (전체 개요)
    - GET /api/admin/analytics/realtime (실시간 데이터)
    - GET /api/admin/analytics/stores/:id (매장별 분석)
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 5.2 분석 데이터 속성 테스트 작성
    - **Property 18: Store popularity ranking**
    - **Property 19: Date range filtering**
    - **Property 20: Click-through rate calculation**
    - **Validates: Requirements 4.2, 4.3, 4.4**

- [ ] 6. 데이터 내보내기 API 구현
  - [ ] 6.1 데이터 내보내기 엔드포인트 구현
    - POST /api/admin/export/stores (매장 데이터 내보내기)
    - POST /api/admin/export/recommendations (추천 데이터 내보내기)
    - POST /api/admin/export/analytics (분석 데이터 내보내기)
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 6.2 데이터 내보내기 속성 테스트 작성
    - **Property 25: Export file generation**
    - **Property 26: Export data filtering**
    - **Property 27: Export metadata inclusion**
    - **Property 28: Large file compression**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

- [ ] 7. 백엔드 체크포인트 - API 테스트 및 검증
  - 모든 어드민 API 엔드포인트 통합 테스트 실행
  - API 문서 생성 및 검증
  - 사용자에게 질문이 있으면 문의

- [ ] 8. 프론트엔드 프로젝트 초기 설정
  - [ ] 8.1 Vite + React + TypeScript 프로젝트 생성
    - 새로운 admin-dashboard 디렉토리에 Vite 프로젝트 생성
    - TypeScript, ESLint, Prettier 설정
    - 기본 폴더 구조 생성 (components, pages, services, stores, utils)
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 8.2 필수 의존성 설치 및 설정
    - React Router, Zustand, Axios, React Query 설치
    - UI 라이브러리 (Ant Design 또는 Material-UI) 설치
    - 차트 라이브러리 (Chart.js 또는 Recharts) 설치
    - _Requirements: 전체_

  - [ ] 8.3 개발 환경 설정
    - 환경 변수 설정 (.env 파일)
    - API 베이스 URL 및 개발 서버 프록시 설정
    - Vite 설정 최적화
    - _Requirements: 전체_

- [ ] 9. 인증 시스템 프론트엔드 구현
  - [ ] 9.1 인증 상태 관리 구현
    - Zustand 기반 AuthStore 구현
    - JWT 토큰 관리 (localStorage, 자동 갱신)
    - 인증 상태 지속성 구현
    - _Requirements: 1.1, 1.3, 1.4, 1.5_

  - [ ] 9.2 로그인 페이지 및 컴포넌트 구현
    - LoginForm 컴포넌트 구현
    - 로그인 페이지 레이아웃
    - 폼 검증 및 에러 처리
    - _Requirements: 1.1, 1.2_

  - [ ] 9.3 인증 가드 및 라우팅 구현
    - ProtectedRoute 컴포넌트 구현
    - 인증되지 않은 사용자 리다이렉트
    - 세션 만료 처리
    - _Requirements: 1.3, 1.5_

  - [ ]* 9.4 인증 프론트엔드 속성 테스트 작성
    - **Property 3: Session expiration handling**
    - **Validates: Requirements 1.3**

- [ ] 10. 대시보드 레이아웃 및 네비게이션 구현
  - [ ] 10.1 메인 레이아웃 컴포넌트 구현
    - 사이드바 네비게이션
    - 헤더 (사용자 정보, 로그아웃)
    - 반응형 레이아웃 (데스크톱, 태블릿, 모바일)
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ] 10.2 대시보드 홈페이지 구현
    - 주요 지표 카드 (총 매장 수, QR 스캔 수 등)
    - 최근 활동 피드
    - 빠른 액션 버튼들
    - _Requirements: 4.1_

  - [ ] 10.3 테마 및 설정 시스템 구현
    - 라이트/다크 테마 전환
    - 사용자 설정 저장 (localStorage)
    - 설정 초기화 기능
    - _Requirements: 7.1, 7.2, 7.5_

  - [ ]* 10.4 설정 관리 속성 테스트 작성
    - **Property 29: Settings persistence**
    - **Property 31: Settings reset**
    - **Validates: Requirements 7.1, 7.5**

- [ ] 11. 매장 관리 페이지 구현
  - [ ] 11.1 매장 목록 페이지 구현
    - 매장 테이블 (페이지네이션, 정렬)
    - 검색 및 필터 기능
    - 매장 상태 표시 (활성/비활성)
    - _Requirements: 2.3, 2.4_

  - [ ] 11.2 매장 생성/편집 폼 구현
    - 매장 정보 입력 폼
    - 이미지 업로드 기능
    - 위치 선택 (지도 연동)
    - 폼 검증 및 에러 처리
    - _Requirements: 2.1, 2.2, 2.6_

  - [ ] 11.3 QR 코드 관리 기능 구현
    - QR 코드 표시 및 다운로드
    - QR 코드 재생성 기능
    - 다양한 형식 지원 (PNG, SVG, PDF)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 11.4 매장 관리 속성 테스트 작성
    - **Property 8: Store pagination and sorting**
    - **Property 23: QR code format availability**
    - **Property 24: QR code status tracking**
    - **Validates: Requirements 2.4, 5.3, 5.5**

- [ ] 12. 추천 관리 페이지 구현
  - [ ] 12.1 추천 관계 시각화 구현
    - 매장 간 추천 관계 그래프
    - 추천 카테고리별 필터링
    - 우선순위 표시
    - _Requirements: 3.4_

  - [ ] 12.2 추천 생성/편집 기능 구현
    - 매장 선택 (검색 가능한 드롭다운)
    - 추천 카테고리 및 우선순위 설정
    - 거리 및 도보 시간 자동 계산 표시
    - _Requirements: 3.1, 3.2, 3.3, 3.6_

- [ ] 13. 분석 대시보드 구현
  - [ ] 13.1 실시간 분석 차트 구현
    - QR 스캔 통계 차트 (시간별, 일별)
    - 인기 매장 랭킹
    - 추천 클릭률 차트
    - _Requirements: 4.1, 4.2, 4.4_

  - [ ] 13.2 분석 필터 및 상호작용 구현
    - 날짜 범위 선택기
    - 매장별 필터링
    - 차트 상호작용 (줌, 툴팁)
    - _Requirements: 4.3_

  - [ ] 13.3 지리적 분석 지도 구현
    - QR 스캔 위치 지도 표시
    - 히트맵 시각화
    - 지역별 통계
    - _Requirements: 4.5_

- [ ] 14. 데이터 내보내기 기능 구현
  - [ ] 14.1 내보내기 인터페이스 구현
    - 데이터 타입 선택 (매장, 추천, 분석)
    - 필터 옵션 (날짜, 카테고리, 지역)
    - 파일 형식 선택 (CSV, JSON)
    - _Requirements: 6.1, 6.2_

  - [ ] 14.2 내보내기 진행 상태 및 다운로드 구현
    - 진행 상태 표시
    - 파일 다운로드 처리
    - 에러 처리 및 재시도
    - _Requirements: 6.3, 6.5_

- [ ] 15. 알림 및 설정 시스템 구현
  - [ ] 15.1 알림 시스템 구현
    - 토스트 알림 컴포넌트
    - 알림 설정 관리
    - 실시간 알림 (WebSocket 또는 폴링)
    - _Requirements: 7.3_

  - [ ] 15.2 대시보드 커스터마이징 구현
    - 위젯 레이아웃 편집
    - 위젯 표시/숨김 설정
    - 레이아웃 저장 및 복원
    - _Requirements: 7.4_

  - [ ]* 15.3 알림 시스템 속성 테스트 작성
    - **Property 30: Notification preference respect**
    - **Validates: Requirements 7.3**

- [ ] 16. 프론트엔드 테스트 구현
  - [ ]* 16.1 컴포넌트 단위 테스트 작성
    - React Testing Library를 사용한 컴포넌트 테스트
    - 폼 검증 및 사용자 상호작용 테스트
    - 모든 주요 컴포넌트 테스트 커버리지 확보

  - [ ]* 16.2 통합 테스트 작성
    - MSW를 사용한 API 모킹
    - 사용자 플로우 테스트 (로그인 → 매장 관리 → 분석 조회)
    - 에러 시나리오 테스트

  - [ ]* 16.3 E2E 테스트 작성
    - Playwright를 사용한 주요 사용자 시나리오 테스트
    - 반응형 디자인 테스트
    - 크로스 브라우저 테스트

- [ ] 17. 성능 최적화 및 배포 준비
  - [ ] 17.1 프론트엔드 성능 최적화
    - 코드 스플리팅 및 지연 로딩
    - 이미지 최적화
    - 번들 크기 분석 및 최적화
    - _Requirements: 전체_

  - [ ] 17.2 프로덕션 빌드 및 배포 설정
    - Vite 프로덕션 빌드 최적화
    - 환경별 설정 분리
    - 정적 파일 서빙 설정
    - _Requirements: 전체_

- [ ] 18. 최종 통합 테스트 및 검증
  - 전체 시스템 통합 테스트 실행
  - 성능 테스트 및 부하 테스트
  - 보안 검증 (인증, 권한, 입력 검증)
  - 사용자 승인 테스트 준비

## Notes

- 태스크에 `*` 표시가 있는 것은 선택적 작업으로, 빠른 MVP를 위해 건너뛸 수 있습니다
- 각 태스크는 특정 요구사항을 참조하여 추적 가능성을 보장합니다
- 체크포인트에서는 점진적 검증을 통해 품질을 보장합니다
- 속성 테스트는 범용적 정확성 속성을 검증합니다
- 단위 테스트는 특정 예제와 엣지 케이스를 검증합니다