export interface BusinessPlanSection {
  id: string; // 고유값 (UUID 등)
  title: string; // 섹션 제목
  content: string; // 섹션 본문
}

export interface BusinessPlanCreateRequest {
  title: string; // 필수
  grantId?: string; // 선택
  content?: {
    sections: BusinessPlanSection[];
  };
  data?: any; // AI가 만든 전체 JSON (선택)
}
