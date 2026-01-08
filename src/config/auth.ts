// 인증 설정 파일
// 나중에 인증을 활성화할 때 이 설정을 변경하면 됩니다.

export const authConfig = {
  // 전역 인증 설정
  enabled: false, // 현재는 비활성화, 나중에 true로 변경
  
  // 시스템별 인증 설정
  demo: {
    enabled: false, // Demo는 항상 인증 불필요
    requireAuth: {
      read: false,
      create: false,
      update: false,
      delete: false
    }
  },
  
  live: {
    enabled: false, // 현재는 비활성화, 나중에 true로 변경
    requireAuth: {
      read: false,    // READ는 항상 인증 불필요 (공개)
      create: false,  // 나중에 true로 변경
      update: false,  // 나중에 true로 변경
      delete: false   // 나중에 true로 변경
    }
  },
  
  // 어드민 시스템 (항상 인증 필요)
  admin: {
    enabled: true, // 어드민은 항상 인증 필요
    requireAuth: {
      read: true,    // 어드민 조회도 인증 필요
      create: true,  // 어드민 생성 인증 필요
      update: true,  // 어드민 수정 인증 필요
      delete: true   // 어드민 삭제 인증 필요
    }
  },
  
  // JWT 설정
  jwt: {
    secret: process.env.JWT_SECRET || "spotline-secret-key",
    expiresIn: "7d" as const, // Explicit type to avoid issues
    issuer: "spotline-api",
    audience: "spotline-users"
  },
  
  // 인증이 필요한 경우의 에러 메시지
  messages: {
    noToken: "인증 토큰이 필요합니다.",
    invalidToken: "유효하지 않은 토큰입니다.",
    expiredToken: "토큰이 만료되었습니다.",
    insufficientPermission: "권한이 부족합니다.",
    adminOnly: "관리자 권한이 필요합니다."
  }
};

// 인증 활성화 여부 확인 함수
export const isAuthEnabled = (system: 'demo' | 'live' | 'admin', action: 'read' | 'create' | 'update' | 'delete'): boolean => {
  // 어드민은 항상 인증 필요
  if (system === 'admin') {
    return authConfig.admin.enabled && authConfig.admin.requireAuth[action];
  }
  
  // 다른 시스템은 전역 설정 확인
  if (!authConfig.enabled) return false;
  return authConfig[system].enabled && authConfig[system].requireAuth[action];
};

// 개발 모드에서 인증 우회 설정 (어드민 제외)
export const isDevelopmentBypass = (system?: 'demo' | 'live' | 'admin'): boolean => {
  // 어드민은 개발 모드에서도 인증 우회 불가
  if (system === 'admin') return false;
  
  return process.env.NODE_ENV === 'development' && process.env.AUTH_BYPASS === 'true';
};